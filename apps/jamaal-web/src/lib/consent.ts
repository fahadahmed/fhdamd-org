/** The visitor's choice about website analytics. `null` means they haven't chosen yet. */
export type Consent = "granted" | "denied";

export const CONSENT_KEY = "jamaal-analytics-consent";

type Store = Pick<Storage, "getItem" | "setItem">;

/** Reads the saved choice. Blocked or missing storage counts as "not chosen". */
export function readConsent(store: Store | undefined): Consent | null {
  try {
    const value = store?.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Saves the choice. If storage is blocked the choice lasts for this page view only. */
export function writeConsent(store: Store | undefined, value: Consent): void {
  try {
    store?.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked: nothing to remember */
  }
}

/** localStorage, or undefined when the browser won't give it to us. */
export function browserStore(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
