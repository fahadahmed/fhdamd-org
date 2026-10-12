/**
 * Reports JavaScript errors from the site to Sentry, and nothing else: no
 * tracing, no replay, no breadcrumbs, no user data. The Sentry SDK is only
 * downloaded when an error actually happens, so almost every visit pays nothing.
 * Off unless the build has a DSN (PUBLIC_SENTRY_DSN).
 */

export const SENTRY_DSN: string | undefined = import.meta.env.PUBLIC_SENTRY_DSN || undefined;

export const ERROR_REPORTING_AVAILABLE = Boolean(SENTRY_DSN);

interface SentryEvent {
  request?: { url?: string; cookies?: unknown; headers?: unknown; query_string?: unknown };
  user?: unknown;
  [key: string]: unknown;
}

/** Drops everything that could identify a person or hold what they typed: the address keeps only its path. */
export function scrubEvent<T extends SentryEvent>(event: T): T {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
    if (event.request.url) event.request.url = event.request.url.split(/[?#]/)[0];
  }
  return event;
}

interface SentryLike {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown): void;
}

export interface ReportingDeps {
  win: Window;
  dsn: string | undefined;
  /** Loads the SDK; replaced in tests. */
  load?: () => Promise<SentryLike>;
  /** At most this many reports per page view, so a loop can't flood Sentry. */
  limit?: number;
}

/** Returns true if reporting was switched on. */
export function installErrorReporting({
  win,
  dsn,
  load = () => import("@sentry/browser") as Promise<SentryLike>,
  limit = 5,
}: ReportingDeps): boolean {
  if (!dsn) return false;

  let sdk: Promise<SentryLike> | undefined;
  let sent = 0;

  const report = (error: unknown) => {
    if (sent >= limit) return;
    sent += 1;
    sdk ??= load().then((s) => {
      s.init({
        dsn,
        environment: "production",
        sendDefaultPii: false,
        tracesSampleRate: 0,
        // We capture errors ourselves below, so none of the SDK's own listeners or breadcrumbs run.
        defaultIntegrations: false,
        beforeSend: scrubEvent,
      });
      return s;
    });
    sdk.then((s) => s.captureException(error)).catch(() => {
      /* reporting must never break the page */
    });
  };

  win.addEventListener("error", (event) => report(event.error ?? new Error(event.message)));
  win.addEventListener("unhandledrejection", (event) => report(event.reason));
  return true;
}
