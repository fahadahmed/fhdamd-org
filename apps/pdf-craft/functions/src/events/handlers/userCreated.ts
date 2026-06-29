import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { UserCreatedPayload } from "../types";
import { welcomeEmailHtml } from "../../email/templates/welcome";
import { log } from "../../utils/logger";

export const handleUserCreated: TypedEventHandler<UserCreatedPayload> = async (payload) => {
  const { userId, userEmail, displayName, requestId } = payload;
  const [firstName, ...rest] = displayName.split(" ");
  const lastName = rest.join(" ");

  const resend = getResend();
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  const results = await Promise.allSettled([
    resend.emails.send({
      to: userEmail,
      from: "Riqa <no-reply@riqa.app>",
      subject: `Welcome to Riqa, ${firstName}!`,
      html: welcomeEmailHtml(displayName),
    }),
    audienceId
      ? resend.contacts.create({ audienceId, email: userEmail, firstName, lastName, unsubscribed: false })
      : Promise.resolve(null),
  ]);

  const [emailResult, contactResult] = results;

  if (emailResult.status === "fulfilled") {
    log.business("📧 email-sent", { requestId, userId, feature: "user-created", status: "success" });
  } else {
    log.exception(emailResult.reason, { requestId, userId, feature: "user-created" });
  }

  if (audienceId && contactResult.status === "rejected") {
    log.exception(contactResult.reason, { requestId, userId, feature: "mailing-list" });
  } else if (audienceId) {
    log.business("📋 mailing-list-added", { requestId, userId, feature: "mailing-list", status: "success" });
  }
};
