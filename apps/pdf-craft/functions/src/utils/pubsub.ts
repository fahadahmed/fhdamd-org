import { PubSub } from "@google-cloud/pubsub";
import type { AppEventPayload } from "../events/types";
import { log } from "./logger";

const APP_EVENT_TOPIC = "app-event";

let pubsubClient: PubSub | null = null;

function getPubSub(): PubSub {
  if (!pubsubClient) {
    pubsubClient = new PubSub();
  }
  return pubsubClient;
}

export async function publishAppEvent(
  payload: AppEventPayload,
  requestId: string,
  feature: string,
): Promise<void> {
  const pubsub = getPubSub();
  const buffer = Buffer.from(JSON.stringify(payload));

  log.event("🔄 pubsub-publish", { requestId, feature, status: "start", topic: APP_EVENT_TOPIC });

  try {
    const messageId = await pubsub.topic(APP_EVENT_TOPIC).publishMessage({ data: buffer });
    log.event("🔄 pubsub-publish", {
      requestId,
      feature,
      status: "success",
      topic: APP_EVENT_TOPIC,
      messageId,
    });
  } catch (error) {
    log.exception(error as Error, { requestId, feature, topic: APP_EVENT_TOPIC });
    throw error;
  }
}
