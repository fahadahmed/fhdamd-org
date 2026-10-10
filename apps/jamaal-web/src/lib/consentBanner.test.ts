import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Analytics } from "./analytics";
import { CONSENT_KEY } from "./consent";
import { setupConsentBanner } from "./consentBanner";

const html = `
  <div id="consent-banner" hidden>
    <button data-consent="accept">Accept</button>
    <button data-consent="decline">Decline</button>
  </div>
  <button data-cookie-settings>Cookie settings</button>`;

const memory = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v), data };
};
const fakeAnalytics = (): Analytics & { enable: ReturnType<typeof vi.fn>; disable: ReturnType<typeof vi.fn> } =>
  ({ enabled: false, enable: vi.fn(), disable: vi.fn(), track: vi.fn() }) as never;

const banner = () => document.getElementById("consent-banner") as HTMLElement;
const click = (selector: string) => (document.querySelector(selector) as HTMLElement).click();

describe("setupConsentBanner", () => {
  beforeEach(() => {
    document.body.innerHTML = html;
  });

  it("shows the banner and starts nothing when no choice is saved", () => {
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store: memory(), analytics });
    expect(banner().hidden).toBe(false);
    expect(analytics.enable).not.toHaveBeenCalled();
  });

  it("starts analytics and stays hidden for a saved accept", () => {
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store: memory({ [CONSENT_KEY]: "granted" }), analytics });
    expect(banner().hidden).toBe(true);
    expect(analytics.enable).toHaveBeenCalledOnce();
  });

  it("stays hidden and off for a saved decline", () => {
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store: memory({ [CONSENT_KEY]: "denied" }), analytics });
    expect(banner().hidden).toBe(true);
    expect(analytics.enable).not.toHaveBeenCalled();
  });

  it("accepting saves the choice, starts analytics and hides the banner", () => {
    const store = memory();
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store, analytics });
    click('[data-consent="accept"]');
    expect(store.data[CONSENT_KEY]).toBe("granted");
    expect(analytics.enable).toHaveBeenCalledOnce();
    expect(banner().hidden).toBe(true);
  });

  it("declining saves the choice, turns analytics off and hides the banner", () => {
    const store = memory();
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store, analytics });
    click('[data-consent="decline"]');
    expect(store.data[CONSENT_KEY]).toBe("denied");
    expect(analytics.disable).toHaveBeenCalledOnce();
    expect(banner().hidden).toBe(true);
  });

  it("Cookie settings reopens the banner, focuses Accept, and returns focus on close", () => {
    setupConsentBanner({ doc: document, store: memory({ [CONSENT_KEY]: "granted" }), analytics: fakeAnalytics() });
    const opener = document.querySelector("[data-cookie-settings]") as HTMLElement;
    opener.click();
    expect(banner().hidden).toBe(false);
    expect(document.activeElement).toBe(document.querySelector('[data-consent="accept"]'));
    click('[data-consent="decline"]');
    expect(document.activeElement).toBe(opener);
  });

  it("changing a granted choice to decline switches analytics off", () => {
    const store = memory({ [CONSENT_KEY]: "granted" });
    const analytics = fakeAnalytics();
    setupConsentBanner({ doc: document, store, analytics });
    click("[data-cookie-settings]");
    click('[data-consent="decline"]');
    expect(store.data[CONSENT_KEY]).toBe("denied");
    expect(analytics.disable).toHaveBeenCalledOnce();
  });

  it("does nothing on a page without the banner", () => {
    document.body.innerHTML = "";
    expect(() => setupConsentBanner({ doc: document, store: memory(), analytics: fakeAnalytics() })).not.toThrow();
  });
});
