/**
 * Emails the TestFlight public link to someone who signed up for the beta. Nothing here talks to
 * Firestore or Resend directly: they are passed in, so the rules (who gets an email, when it is
 * sent again, when to give up) can be tested on their own.
 */

/** The fields of a signup document this code reads. Timestamps are Firestore's, read through `toMillis`. */
export interface InviteRecord {
  firstName?: string;
  /** The beta stage the person signed up in. */
  stage?: string;
  /** Set when someone already on the list asked to join the beta. */
  inviteRequestedAt?: unknown;
  inviteSentAt?: unknown;
  /** Set when sending was given up on; a person looks at these. */
  inviteFailedAt?: unknown;
  unsubscribedAt?: unknown;
}

/** An address can be sent the invite again, at most this often, so a form can't be used to flood one inbox. */
export const MIN_RESEND_MS = 60 * 60 * 1000;

/** How long a failing send is retried before it is given up on. */
export const DEFAULT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

/** Milliseconds for a Firestore Timestamp, a Date or nothing. */
export function toMillis(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  const timestamp = value as { toMillis?: () => number } | null | undefined;
  return typeof timestamp?.toMillis === "function" ? timestamp.toMillis() : null;
}

/**
 * Whether this signup should be sent the invite now: they signed up in the beta, or asked again
 * since the last send; they haven't unsubscribed or been given up on; and it isn't too soon after the last one.
 */
export function needsInvite(record: InviteRecord, now: Date): boolean {
  if (record.unsubscribedAt || record.inviteFailedAt) return false;
  const sent = toMillis(record.inviteSentAt);
  const requested = toMillis(record.inviteRequestedAt);
  if (sent === null) return record.stage === "testflight" || requested !== null;
  if (requested === null || requested <= sent) return false;
  return now.getTime() - sent >= MIN_RESEND_MS;
}

export interface BetaInviteDeps {
  signups: {
    get(email: string): Promise<InviteRecord | null>;
    markSent(email: string): Promise<void>;
    /** Notes that sending was given up on, both on the document and in the failures collection. */
    recordFailure(failure: { email: string; message: string; queuedAt: Date }): Promise<void>;
  };
  /** Sends the email. The key makes a retry of the same request a no-op at Resend. */
  send(invite: { email: string; firstName: string; idempotencyKey: string }): Promise<void>;
  report(error: unknown): Promise<void>;
  now(): Date;
  maxAgeMs?: number;
}

export type InviteOutcome = "sent" | "skipped" | "gave-up";

export function createBetaInvite(deps: BetaInviteDeps) {
  const maxAgeMs = deps.maxAgeMs ?? DEFAULT_MAX_AGE_MS;

  async function run(email: string): Promise<InviteOutcome> {
    const record = await deps.signups.get(email);
    // Gone since (a removal request), unsubscribed, already sent, or not a beta signup: nothing to do.
    if (!record || !needsInvite(record, deps.now())) return "skipped";
    const requested = toMillis(record.inviteRequestedAt);
    await deps.send({
      email,
      firstName: record.firstName?.trim() ?? "",
      // One key per request, so a retry or a second trigger for the same signup can't send twice.
      idempotencyKey: `beta-invite/${email}/${requested ?? "signup"}`,
    });
    await deps.signups.markSent(email);
    return "sent";
  }

  /**
   * Handles one change to a signup. A failure is thrown so the trigger retries it; one still failing
   * after `maxAgeMs` is recorded, reported and acknowledged so it stops.
   */
  return async function handle(email: string, queuedAt: Date): Promise<InviteOutcome> {
    try {
      return await run(email);
    } catch (error) {
      if (deps.now().getTime() - queuedAt.getTime() < maxAgeMs) throw error;
      await deps.signups.recordFailure({
        email,
        message: error instanceof Error ? error.message : "unknown",
        queuedAt,
      });
      await deps.report(error);
      return "gave-up";
    }
  };
}
