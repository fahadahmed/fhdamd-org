import type { Analytics } from "./analytics";
import { readConsent, writeConsent } from "./consent";

interface Deps {
  doc: Document;
  store: Pick<Storage, "getItem" | "setItem"> | undefined;
  analytics: Analytics;
}

/**
 * Wires the consent banner. A saved "granted" starts analytics and keeps the
 * banner hidden, a saved "denied" keeps both off, and no saved choice shows the
 * banner. Any [data-cookie-settings] control reopens it.
 */
export function setupConsentBanner({ doc, store, analytics }: Deps): void {
  const banner = doc.getElementById("consent-banner");
  if (!banner) return;
  const accept = banner.querySelector<HTMLButtonElement>('[data-consent="accept"]');
  const decline = banner.querySelector<HTMLButtonElement>('[data-consent="decline"]');
  let opener: HTMLElement | null = null;

  const show = () => {
    banner.hidden = false;
    accept?.focus();
  };
  const hide = () => {
    banner.hidden = true;
    opener?.focus();
    opener = null;
  };

  const saved = readConsent(store);
  if (saved === "granted") analytics.enable();
  if (saved === null) banner.hidden = false;

  accept?.addEventListener("click", () => {
    writeConsent(store, "granted");
    analytics.enable();
    hide();
  });
  decline?.addEventListener("click", () => {
    writeConsent(store, "denied");
    analytics.disable();
    hide();
  });

  for (const control of doc.querySelectorAll<HTMLElement>("[data-cookie-settings]")) {
    control.addEventListener("click", () => {
      opener = control;
      show();
    });
  }
}
