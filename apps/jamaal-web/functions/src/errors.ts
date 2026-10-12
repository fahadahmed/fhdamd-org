/**
 * Error reporting for the functions, to Sentry. Off unless a DSN is configured.
 * Signups carry names and email addresses, so events are stripped of the request
 * (headers, body, cookies, query string) and the user before they leave.
 */

export interface SentryLike {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown): void;
  flush(timeoutMs: number): Promise<boolean>;
}

interface ServerEvent {
  request?: unknown;
  user?: unknown;
  [key: string]: unknown;
}

export function scrubServerEvent<T extends ServerEvent>(event: T): T {
  delete event.request;
  delete event.user;
  return event;
}

export interface ErrorReporter {
  capture(error: unknown): Promise<void>;
}

/**
 * `dsn` is read lazily because it comes from a function parameter that is only
 * available once the function is running. Without one, `capture` does nothing.
 */
export function createErrorReporter(getDsn: () => string, sdk: () => SentryLike): ErrorReporter {
  let ready = false;

  return {
    async capture(error) {
      const dsn = getDsn();
      if (!dsn) return;
      try {
        const sentry = sdk();
        if (!ready) {
          sentry.init({
            dsn,
            environment: "production",
            sendDefaultPii: false,
            tracesSampleRate: 0,
            beforeSend: scrubServerEvent,
          });
          ready = true;
        }
        sentry.captureException(error);
        // The instance can freeze as soon as the response is sent, so send it now.
        await sentry.flush(2000);
      } catch {
        /* reporting must never break the function */
      }
    },
  };
}
