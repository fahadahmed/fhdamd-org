import type { Resend } from "resend";

/** What the sync needs from Resend: contacts only. A smaller type than the whole SDK, so tests can fake it. */
export type ResendContacts = Pick<Resend, "contacts">;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resend allows about two requests a second. Every call waits until at least `gapMs` has passed since the
 * previous one starts (one worker, one call at a time), so a backfill of thousands never trips the limit.
 */
export function pacer(gapMs: number, wait: (ms: number) => Promise<void> = sleep, now: () => number = Date.now) {
  let next = 0;
  return async function pace(): Promise<void> {
    const start = Math.max(now(), next);
    next = start + gapMs;
    if (start > now()) await wait(start - now());
  };
}

export interface ContactsOptions {
  audienceId: string;
  /** Minimum milliseconds between Resend calls. */
  gapMs?: number;
  wait?: (ms: number) => Promise<void>;
  now?: () => number;
}

const notFound = (error: { statusCode: number | null; name: string }) => error.statusCode === 404 || error.name === "not_found";

/**
 * The contact operations the mailing list uses, on Resend:
 * - `add` finds the contact if it exists (and leaves its unsubscribed state alone) and creates it otherwise;
 * - `remove` deletes it, and a contact that is already gone is fine.
 * Any other error is thrown, so the queue retries.
 */
export function createResendContacts(resend: ResendContacts, { audienceId, gapMs = 600, wait, now }: ContactsOptions) {
  const pace = pacer(gapMs, wait, now);

  return {
    async add({ email, firstName }: { email: string; firstName: string }): Promise<string | null> {
      await pace();
      const existing = await resend.contacts.get({ audienceId, email });
      if (existing.data) return existing.data.id;
      if (existing.error && !notFound(existing.error)) throw new Error(`Resend could not look up a contact: ${existing.error.message}`);

      await pace();
      const created = await resend.contacts.create({ audienceId, email, firstName: firstName || undefined, unsubscribed: false });
      if (created.error) throw new Error(`Resend could not add a contact: ${created.error.message}`);
      return created.data.id;
    },

    async remove(email: string): Promise<void> {
      await pace();
      const removed = await resend.contacts.remove({ audienceId, email });
      if (removed.error && !notFound(removed.error)) throw new Error(`Resend could not remove a contact: ${removed.error.message}`);
    },
  };
}

/** What a Resend `contact.updated` webhook says about someone's subscription. Anything else is not our business. */
export function unsubscribeChange(event: { type: string; data?: { email?: string; unsubscribed?: boolean } }): { email: string; unsubscribed: boolean } | null {
  if (event.type !== "contact.updated") return null;
  const { email, unsubscribed } = event.data ?? {};
  if (typeof email !== "string" || typeof unsubscribed !== "boolean") return null;
  return { email: email.trim().toLowerCase(), unsubscribed };
}
