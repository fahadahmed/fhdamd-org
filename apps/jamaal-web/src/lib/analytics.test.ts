import { beforeEach, describe, expect, it } from "vitest";
import { createAnalytics, getAnalytics, track } from "./analytics";

const ID = "G-TEST123";
type TestWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [k: `ga-disable-${string}`]: boolean | undefined };

describe("createAnalytics", () => {
  let win: TestWindow;

  beforeEach(() => {
    document.head.innerHTML = "";
    document.cookie.split(";").forEach((c) => {
      document.cookie = `${c.split("=")[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    win = window as unknown as TestWindow;
    delete win.dataLayer;
    delete win.gtag;
  });

  it("does nothing until enabled: no script, no data layer, events dropped", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.track({ name: "signup_view" });
    expect(analytics.enabled).toBe(false);
    expect(document.head.querySelector("script")).toBeNull();
    expect(win.dataLayer).toBeUndefined();
  });

  it("loads gtag.js and configures it without Google signals or ad personalisation", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    const script = document.head.querySelector("script");
    expect(script?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`);
    expect(script?.async).toBe(true);
    const calls = (win.dataLayer as unknown[][]).map((args) => Array.from(args as ArrayLike<unknown>));
    expect(calls.map((c) => c[0])).toEqual(["js", "config"]);
    expect(calls[1]).toEqual([
      "config",
      ID,
      { allow_google_signals: false, allow_ad_personalization_signals: false },
    ]);
  });

  it("enabling twice loads the script once", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    analytics.enable();
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
  });

  it("sends events with their parameters once enabled", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    analytics.track({ name: "signup_result", status: "added" });
    const last = Array.from((win.dataLayer as unknown[][]).at(-1) as ArrayLike<unknown>);
    expect(last).toEqual(["event", "signup_result", { status: "added" }]);
  });

  it("sends events with no parameters as an empty object", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    analytics.track({ name: "signup_view" });
    const last = Array.from((win.dataLayer as unknown[][]).at(-1) as ArrayLike<unknown>);
    expect(last).toEqual(["event", "signup_view", {}]);
  });

  it("stops on disable: flags Google's opt-out, expires _ga cookies and drops events", () => {
    document.cookie = "_ga=abc; path=/";
    document.cookie = "_ga_TEST123=def; path=/";
    document.cookie = "other=keep; path=/";
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    analytics.disable();
    const before = (win.dataLayer as unknown[]).length;
    analytics.track({ name: "signup_submit" });
    expect(analytics.enabled).toBe(false);
    expect(win[`ga-disable-${ID}`]).toBe(true);
    expect((win.dataLayer as unknown[]).length).toBe(before);
    expect(document.cookie).toContain("other=keep");
    expect(document.cookie).not.toContain("_ga");
  });

  it("can be enabled again after a disable", () => {
    const analytics = createAnalytics(ID, win, document);
    analytics.enable();
    analytics.disable();
    analytics.enable();
    expect(analytics.enabled).toBe(true);
    expect(win[`ga-disable-${ID}`]).toBe(false);
  });

  it("is inert without a measurement ID", () => {
    const analytics = createAnalytics(undefined, win, document);
    analytics.enable();
    analytics.disable();
    analytics.track({ name: "signup_view" });
    expect(analytics.enabled).toBe(false);
    expect(document.head.querySelector("script")).toBeNull();
  });
});

describe("getAnalytics and track", () => {
  it("share one instance, which stays inert in a build without a measurement ID", () => {
    expect(getAnalytics()).toBe(getAnalytics());
    expect(getAnalytics().enabled).toBe(false);
    expect(() => track({ name: "signup_view" })).not.toThrow();
  });
});
