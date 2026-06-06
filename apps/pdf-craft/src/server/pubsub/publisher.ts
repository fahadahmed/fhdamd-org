import { PubSub } from "@google-cloud/pubsub";
import { log } from "../../utils/lib/logger";

const projectId = import.meta.env.VITE_PROJECT_ID;

export async function publish(
  topic: string,
  payload: object,
  requestId?: string,
  feature?: string,
) {
  if (!projectId) {
    log.error("VITE_PROJECT_ID is not defined in environment variables", {
      requestId,
      feature,
    });
    throw new Error("VITE_PROJECT_ID is not defined in environment variables");
  }
  const pubsub = new PubSub({ projectId });
  const buffer = Buffer.from(JSON.stringify(payload));
  log.event("🔄 pubsub-publish", {
    requestId,
    feature,
    status: "start",
    topic,
  });
  try {
    const messageId = await pubsub.topic(topic).publishMessage({ data: buffer });
    log.event("🔄 pubsub-publish", { requestId, feature, status: "success", topic, messageId });
    return messageId;
  } catch (error) {
    log.exception(error as Error, { requestId, feature, topic });
    throw error;
  }
}
