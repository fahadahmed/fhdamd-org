import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { PdfOperationPayload } from "../types";
import { pdfOperationEmailHtml, pdfOperationSubject } from "../../email/templates/pdfOperation";
import { log } from "../../utils/logger";

export const handleDecryptPdf: TypedEventHandler<PdfOperationPayload> = async (payload) => {
  const { userId, userEmail, fileId, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "Riqa <no-reply@riqa.app>",
      subject: pdfOperationSubject("pdf-decrypt"),
      html: pdfOperationEmailHtml({ operationType: "pdf-decrypt", fileName, fileUrl }),
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      fileId,
      feature: "pdf-decrypt",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, fileId, feature: "pdf-decrypt" });
  }
};
