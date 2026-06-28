import { defineMiddleware } from "astro:middleware";
import { log } from "./utils/lib/logger";

const MONITORED_ACTIONS = ["/_actions/contact.sendMessage"];

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  const isMonitoredAction = MONITORED_ACTIONS.some((path) =>
    context.url.pathname.startsWith(path),
  );

  if (isMonitoredAction && response.status >= 400) {
    let body: unknown;
    try {
      body = await response.clone().json();
    } catch {
      body = undefined;
    }
    log.exception(new Error(`Action request failed: ${context.url.pathname}`), {
      feature: "contact",
      status: response.status,
      pathname: context.url.pathname,
      body: JSON.stringify(body),
    });
  }

  return response;
});
