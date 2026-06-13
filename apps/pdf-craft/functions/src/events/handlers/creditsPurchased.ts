import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { CreditsPurchasedPayload } from "../types";
import { creditsPurchasedEmailHtml } from "../../email/templates/creditsPurchased";
import { log } from "../../utils/logger";

export const handleCreditsPurchased: TypedEventHandler<CreditsPurchasedPayload> = async (payload) => {
  const { userId, userEmail, displayName, creditsPurchased, creditsTotal, amountCents, currency, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: `${creditsPurchased} credits added to your account`,
      html: creditsPurchasedEmailHtml({ displayName, creditsPurchased, creditsTotal, amountCents, currency }),
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      creditsPurchased,
      creditsTotal,
      feature: "credits-purchased",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, feature: "credits-purchased" });
  }
};
