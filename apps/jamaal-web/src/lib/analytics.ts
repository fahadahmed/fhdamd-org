/**
 * Website analytics: Google Analytics 4 through the Firebase project's
 * measurement ID, loaded only after the visitor accepts (see consent.ts and
 * consentBanner.ts). Nothing is requested, and no cookie is set, before that.
 *
 * It uses gtag.js directly. The Firebase web SDK would add its own bundle for
 * nothing the site needs, since this site uses no other Firebase client service.
 * The Jamaal app collects no analytics.
 */

/** The only events the site sends, with no personal data in any of them. */
export type AnalyticsEvent =
  | { name: "signup_view" }
  | { name: "signup_submit" }
  | { name: "signup_result"; status: "added" | "invited" | "exists" | "error" };

export const MEASUREMENT_ID: string | undefined = import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID || undefined;

/** True when this build has a measurement ID, so the banner and footer link are shown. */
export const ANALYTICS_AVAILABLE = Boolean(MEASUREMENT_ID);

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [disableFlag: `ga-disable-${string}`]: boolean | undefined;
};

export interface Analytics {
  readonly enabled: boolean;
  enable(): void;
  disable(): void;
  track(event: AnalyticsEvent): void;
}

const GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=";

function expireGaCookies(doc: Document, hostname: string): void {
  const domains = ["", `; domain=${hostname}`, `; domain=.${hostname}`];
  for (const part of doc.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

export function createAnalytics(measurementId: string | undefined, win: GtagWindow, doc: Document): Analytics {
  let enabled = false;
  const disableFlag = `ga-disable-${measurementId}` as const;

  // gtag.js reads the `arguments` object itself, so this cannot take rest parameters.
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    (win.dataLayer ??= []).push(arguments);
  } as (...args: unknown[]) => void;

  return {
    get enabled() {
      return enabled;
    },

    enable() {
      if (!measurementId || enabled) return;
      enabled = true;
      win[disableFlag] = false;
      win.gtag = gtag;
      gtag("js", new Date());
      gtag("config", measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      const script = doc.createElement("script");
      script.async = true;
      script.src = GTAG_SRC + encodeURIComponent(measurementId);
      doc.head.appendChild(script);
    },

    /** Stops sending and removes the Google Analytics cookies this site set. */
    disable() {
      if (!measurementId) return;
      enabled = false;
      win[disableFlag] = true;
      expireGaCookies(doc, win.location.hostname);
    },

    track(event) {
      if (!enabled) return;
      const { name, ...params } = event;
      gtag("event", name, params);
    },
  };
}

let shared: Analytics | undefined;

/** The page's one analytics instance. Browser only. */
export function getAnalytics(): Analytics {
  shared ??= createAnalytics(MEASUREMENT_ID, window as unknown as GtagWindow, document);
  return shared;
}

/** Sends an event if the visitor has accepted analytics; otherwise does nothing. */
export function track(event: AnalyticsEvent): void {
  getAnalytics().track(event);
}
