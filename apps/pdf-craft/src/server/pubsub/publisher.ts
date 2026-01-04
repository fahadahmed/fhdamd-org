import { PubSub } from '@google-cloud/pubsub';

const projectId = process.env.VITE_PROJECT_ID;

export async function publish(topic: string, payload: object) {
  if (!projectId) {
    throw new Error('VITE_PROJECT_ID is not defined in environment variables');
  }
  const pubsub = new PubSub({ projectId });
  const buffer = Buffer.from(JSON.stringify(payload));
  console.log('Publishing message to topic:', topic, 'with payload:', payload);
  return pubsub.topic(topic).publishMessage({ data: buffer });
}
