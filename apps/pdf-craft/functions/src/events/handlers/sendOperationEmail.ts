import { getResend } from "../../email/resend";
import { pdfOperationEmailHtml, pdfOperationSubject } from "../../email/templates/pdfOperation";
import { log } from "../../utils/logger";
import type { PdfOperationPayload } from "../types";

/**
 * Sends the post-operation email for any PDF operation.
 * Extracted so each individual handler delegates here rather than
 * duplicating the same try/catch + resend.emails.send pattern.
 */
export async function sendOperationEmail(payload: PdfOperationPayload): Promise<void> {
  const { userId, userEmail, fileId, fileName, fileUrl, eventType, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "Riqa <no-reply@riqa.app>",
      subject: pdfOperationSubject(eventType),
      html: pdfOperationEmailHtml({ operationType: eventType, fileName, fileUrl }),
    });
    log.business("📧 email-sent", { requestId, userId, fileId, feature: eventType, status: "success" });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, fileId, feature: eventType });
  }
}
