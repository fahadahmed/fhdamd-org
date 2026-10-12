import { describe, expect, it, vi } from "vitest";
import { createErrorReporter, scrubServerEvent } from "./errors";

const fakeSdk = () => ({ init: vi.fn(), captureException: vi.fn(), flush: vi.fn().mockResolvedValue(true) });

describe("scrubServerEvent", () => {
  it("drops the request (headers, body, cookies) and the user, which can hold names and emails", () => {
    const event = scrubServerEvent({
      message: "boom",
      request: { data: { email: "sam@example.com" }, headers: { cookie: "a" } },
      user: { email: "sam@example.com" },
    });
    expect(event).toEqual({ message: "boom" });
  });
});

describe("createErrorReporter", () => {
  it("does nothing without a DSN", async () => {
    const sdk = fakeSdk();
    await createErrorReporter(() => "", () => sdk).capture(new Error("boom"));
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.captureException).not.toHaveBeenCalled();
  });

  it("initialises once with privacy-preserving options, reports, and flushes before the function can freeze", async () => {
    const sdk = fakeSdk();
    const reporter = createErrorReporter(() => "https://k@o1.ingest.sentry.io/1", () => sdk);
    const error = new Error("boom");
    await reporter.capture(error);
    await reporter.capture(new Error("again"));
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init.mock.calls[0][0]).toMatchObject({
      dsn: "https://k@o1.ingest.sentry.io/1",
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: scrubServerEvent,
    });
    expect(sdk.captureException).toHaveBeenCalledWith(error);
    expect(sdk.flush).toHaveBeenCalledTimes(2);
  });

  it("never throws, even if Sentry does", async () => {
    const sdk = fakeSdk();
    sdk.captureException.mockImplementation(() => {
      throw new Error("sentry down");
    });
    await expect(createErrorReporter(() => "dsn", () => sdk).capture(new Error("boom"))).resolves.toBeUndefined();
  });
});
