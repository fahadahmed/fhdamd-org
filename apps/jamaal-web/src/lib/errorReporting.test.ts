import { describe, expect, it, vi } from "vitest";
import { installErrorReporting, scrubEvent } from "./errorReporting";

const fakeSdk = () => ({ init: vi.fn(), captureException: vi.fn() });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("scrubEvent", () => {
  it("removes the user, cookies, headers and query string, and keeps only the path of the address", () => {
    const event = scrubEvent({
      message: "boom",
      user: { ip_address: "1.2.3.4" },
      request: { url: "https://jamaal.app/privacy?email=a%40b.co#top", cookies: { a: 1 }, headers: { h: 1 }, query_string: "email=a%40b.co" },
    });
    expect(event).toEqual({ message: "boom", request: { url: "https://jamaal.app/privacy" } });
  });

  it("copes with an event that has no request", () => {
    expect(scrubEvent({ message: "boom" })).toEqual({ message: "boom" });
  });
});

describe("installErrorReporting", () => {
  it("does nothing without a DSN: no listeners, no SDK", () => {
    const win = { addEventListener: vi.fn() } as unknown as Window;
    const load = vi.fn();
    expect(installErrorReporting({ win, dsn: undefined, load })).toBe(false);
    expect(win.addEventListener).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });

  it("does not load the SDK until an error happens", () => {
    const load = vi.fn().mockResolvedValue(fakeSdk());
    expect(installErrorReporting({ win: window, dsn: "https://k@o1.ingest.sentry.io/1", load })).toBe(true);
    expect(load).not.toHaveBeenCalled();
  });

  it("loads the SDK once with privacy-preserving options and reports the error", async () => {
    const sdk = fakeSdk();
    const load = vi.fn().mockResolvedValue(sdk);
    const target = new EventTarget() as unknown as Window;
    installErrorReporting({ win: target, dsn: "https://k@o1.ingest.sentry.io/1", load });
    const error = new Error("boom");
    target.dispatchEvent(Object.assign(new Event("error"), { error, message: "boom" }));
    target.dispatchEvent(Object.assign(new Event("error"), { error: new Error("again"), message: "again" }));
    await flush();
    expect(load).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init.mock.calls[0][0]).toMatchObject({
      dsn: "https://k@o1.ingest.sentry.io/1",
      sendDefaultPii: false,
      tracesSampleRate: 0,
      defaultIntegrations: false,
      beforeSend: scrubEvent,
    });
    expect(sdk.captureException).toHaveBeenCalledTimes(2);
    expect(sdk.captureException).toHaveBeenCalledWith(error);
  });

  it("reports unhandled promise rejections", async () => {
    const sdk = fakeSdk();
    const target = new EventTarget() as unknown as Window;
    installErrorReporting({ win: target, dsn: "dsn", load: async () => sdk });
    target.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: "nope" }));
    await flush();
    expect(sdk.captureException).toHaveBeenCalledWith("nope");
  });

  it("makes up an error when the event carries none", async () => {
    const sdk = fakeSdk();
    const target = new EventTarget() as unknown as Window;
    installErrorReporting({ win: target, dsn: "dsn", load: async () => sdk });
    target.dispatchEvent(Object.assign(new Event("error"), { message: "Script error." }));
    await flush();
    expect((sdk.captureException.mock.calls[0][0] as Error).message).toBe("Script error.");
  });

  it("stops after the limit so a loop cannot flood Sentry", async () => {
    const sdk = fakeSdk();
    const target = new EventTarget() as unknown as Window;
    installErrorReporting({ win: target, dsn: "dsn", load: async () => sdk, limit: 2 });
    for (let i = 0; i < 5; i++) target.dispatchEvent(Object.assign(new Event("error"), { error: new Error(String(i)), message: "x" }));
    await flush();
    expect(sdk.captureException).toHaveBeenCalledTimes(2);
  });

  it("never lets a failing SDK break the page", async () => {
    const target = new EventTarget() as unknown as Window;
    installErrorReporting({ win: target, dsn: "dsn", load: () => Promise.reject(new Error("offline")) });
    expect(() => target.dispatchEvent(Object.assign(new Event("error"), { error: new Error("x"), message: "x" }))).not.toThrow();
    await flush();
  });
});
