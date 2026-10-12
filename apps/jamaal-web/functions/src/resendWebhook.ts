import { unsubscribeChange } from "./resendContacts";

export interface WebhookRequest {
  method: string;
  rawBody: string;
  headers: { id?: string; timestamp?: string; signature?: string };
}

export interface WebhookDeps {
  /** Checks Resend's signature and returns the event; throws when it is not genuine. */
  verify(body: string, headers: { id: string; timestamp: string; signature: string }): { type: string; data?: { email?: string; unsubscribed?: boolean } };
  /** Records that the person unsubscribed (or came back). A signup that no longer exists is fine. */
  setUnsubscribed(email: string, unsubscribed: boolean): Promise<void>;
}

/** Resend tells us when someone unsubscribes from one of our emails, so the list in Firestore matches. */
export function createWebhookHandler({ verify, setUnsubscribed }: WebhookDeps) {
  return async function handle(request: WebhookRequest): Promise<{ status: 200 | 400 | 405; body: string }> {
    if (request.method !== "POST") return { status: 405, body: "Method not allowed" };
    const { id, timestamp, signature } = request.headers;
    if (!id || !timestamp || !signature) return { status: 400, body: "Missing signature" };

    let event: ReturnType<WebhookDeps["verify"]>;
    try {
      event = verify(request.rawBody, { id, timestamp, signature });
    } catch {
      return { status: 400, body: "Invalid signature" };
    }

    const change = unsubscribeChange(event);
    if (change) await setUnsubscribed(change.email, change.unsubscribed);
    return { status: 200, body: "ok" };
  };
}
