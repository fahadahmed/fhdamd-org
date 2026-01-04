import { AppEventPayload } from '../types';

export type AppEventHandler = (payload: AppEventPayload) => Promise<void>;
