import type { AppEventPayload } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppEventHandler = (payload: any) => Promise<void>;

export type TypedEventHandler<T extends AppEventPayload> = (payload: T) => Promise<void>;
