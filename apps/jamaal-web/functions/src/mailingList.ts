import { z } from "zod";

/**
 * Keeps the Resend mailing list in step with the `signups` collection. Nothing here
 * talks to Firestore, Pub/Sub or Resend directly: they are passed in, so the rules
 * (what is skipped, when to retry, when to give up) can be tested on their own.
 */

export const messageSchema = z.object({
  type: z.enum(["add", "remove"]),
  email: z.string().trim().toLowerCase().email().max(254),
});

export type MailingListMessage = z.infer<typeof messageSchema>;

/** The fields of a signup document this code reads. */
export interface SignupRecord {
  firstName?: string;
  /** Set when the person unsubscribed from a Resend email. They must never be added again. */
  unsubscribedAt?: unknown;
  /** Set once the person is in the Resend audience. */
  mailingListSyncedAt?: unknown;
  /** Set when the sync was given up on; the daily check leaves these for a person to look at. */
  mailingListFailedAt?: unknown;
}

export interface SignupFailure {
  email: string;
  type: MailingListMessage["type"];
  message: string;
  /** When the message was first queued. */
  queuedAt: Date;
}

export interface MailingListDeps {
  signups: {
    get(email: string): Promise<SignupRecord | null>;
    markSynced(email: string, contactId: string | null): Promise<void>;
    /** Notes that the sync was given up on, both on the document and in the failures collection. */
    recordFailure(failure: SignupFailure): Promise<void>;
  };
  contacts: {
    /** Adds the person to the audience (or finds them if they are there) and returns the contact id. */
    add(contact: { email: string; firstName: string }): Promise<string | null>;
    remove(email: string): Promise<void>;
  };
  report(error: unknown): Promise<void>;
  now(): Date;
  /** How long a message is retried before it is given up on. */
  maxAgeMs?: number;
}

export const DEFAULT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type Outcome = "added" | "removed" | "skipped" | "gave-up";

export function createMailingList(deps: MailingListDeps) {
  const maxAgeMs = deps.maxAgeMs ?? DEFAULT_MAX_AGE_MS;

  async function run(message: MailingListMessage): Promise<Outcome> {
    if (message.type === "remove") {
      await deps.contacts.remove(message.email);
      return "removed";
    }
    const record = await deps.signups.get(message.email);
    // Gone since it was queued (a removal request), already done, or unsubscribed: nothing to do.
    if (!record || record.mailingListSyncedAt || record.unsubscribedAt) return "skipped";
    const contactId = await deps.contacts.add({ email: message.email, firstName: record.firstName?.trim() ?? "" });
    await deps.signups.markSynced(message.email, contactId);
    return "added";
  }

  /**
   * Handles one queued message. A failure is thrown so Pub/Sub retries it with backoff; a message
   * that is still failing after `maxAgeMs` is recorded, reported, and acknowledged so it stops.
   */
  return async function handle(message: MailingListMessage, queuedAt: Date): Promise<Outcome> {
    try {
      return await run(message);
    } catch (error) {
      if (deps.now().getTime() - queuedAt.getTime() < maxAgeMs) throw error;
      await deps.signups.recordFailure({
        email: message.email,
        type: message.type,
        message: error instanceof Error ? error.message : "unknown",
        queuedAt,
      });
      await deps.report(error);
      return "gave-up";
    }
  };
}

/** Which signups the daily check should queue again: not in Resend, not unsubscribed, not given up on. */
export function needsSync(record: SignupRecord): boolean {
  return !record.mailingListSyncedAt && !record.unsubscribedAt && !record.mailingListFailedAt;
}
