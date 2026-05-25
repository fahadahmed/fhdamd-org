import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from '../../firebase/client';

export function logEvent(eventName: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  firebaseLogEvent(analytics, eventName, params);
}
