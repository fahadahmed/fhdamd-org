import * as logger from "firebase-functions/logger";
import * as Sentry from "@sentry/astro";

export type LogContext = {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  status?: "start" | "success" | "fail";
  type?: "event" | "business" | "error";
  [key: string]: string | number | object | undefined;
};

function base(
  severity: "debug" | "info" | "warn" | "error",
  message: string,
  context: LogContext,
) {
  logger[severity](message, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export const log = {
  debug: (msg: string, ctx?: LogContext) => base("debug", msg, ctx || {}),
  info: (msg: string, ctx?: LogContext) => base("info", msg, ctx || {}),
  warn: (msg: string, ctx?: LogContext) => base("warn", msg, ctx || {}),
  error: (msg: string, ctx?: LogContext) => base("error", msg, ctx || {}),

  event: (event: string, ctx?: LogContext) =>
    base("info", event, { type: "event", ...ctx }),
  business: (action: string, ctx?: LogContext) =>
    base("info", action, { type: "business", ...ctx }),
  exception: (error: Error, ctx?: LogContext) => {
    base("error", "exception", {
      type: "error",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...ctx,
    });
    Sentry.captureException(error, { extra: ctx });
  },
};
