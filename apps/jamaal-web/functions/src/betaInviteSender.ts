import type { Resend } from "resend";
import { BETA_INVITE_SUBJECT, betaInviteHtml, betaInviteText } from "./betaInviteEmail";

/** What sending needs from Resend: the emails API only. A smaller type than the whole SDK, so tests can fake it. */
export type ResendEmails = Pick<Resend, "emails">;

export interface InviteSenderOptions {
  /** The sender, for example `Jamaal <support@jamaal.app>`. */
  from: string;
  /** Replies go to a mailbox the owner reads. */
  replyTo: string;
  /** The TestFlight public link. */
  testflightUrl: string;
  /** The site's origin, no trailing slash. */
  siteUrl: string;
  unsubscribeUrl: string;
}

/** Sends the invite through Resend. An error from Resend is thrown, so the caller retries. */
export function createInviteSender(resend: ResendEmails, options: InviteSenderOptions) {
  return async function send({ email, firstName, idempotencyKey }: { email: string; firstName: string; idempotencyKey: string }): Promise<void> {
    const content = {
      firstName,
      testflightUrl: options.testflightUrl,
      siteUrl: options.siteUrl,
      unsubscribeUrl: options.unsubscribeUrl,
    };
    const { error } = await resend.emails.send(
      {
        from: options.from,
        to: email,
        replyTo: options.replyTo,
        subject: BETA_INVITE_SUBJECT,
        html: betaInviteHtml(content),
        text: betaInviteText(content),
      },
      { idempotencyKey },
    );
    if (error) throw new Error(`Resend could not send the beta invite: ${error.message}`);
  };
}
