import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { UserCreatedPayload } from "../types";
import { welcomeEmailHtml } from "../../email/templates/welcome";
import { log } from "../../utils/logger";

export const handleUserCreated: TypedEventHandler<UserCreatedPayload> = async (payload) => {
  const { userId, userEmail, displayName, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: `Welcome to PDF Craft, ${displayName.split(" ")[0]}!`,
      html: welcomeEmailHtml(displayName),
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      feature: "user-created",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, feature: "user-created" });
  }
};
