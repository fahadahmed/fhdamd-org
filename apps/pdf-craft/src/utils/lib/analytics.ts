import {
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from 'firebase/analytics';
import { analytics } from '../../firebase/client';

export function logEvent(eventName: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  firebaseLogEvent(analytics, eventName, params);
}

export function setUserId(uid: string) {
  if (!analytics) return;
  firebaseSetUserId(analytics, uid);
}

export function setUserProperties(props: Record<string, string>) {
  if (!analytics) return;
  firebaseSetUserProperties(analytics, props);
}
