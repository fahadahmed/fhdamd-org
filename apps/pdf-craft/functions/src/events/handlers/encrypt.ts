import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { PdfOperationPayload } from "../types";
import { pdfOperationEmailHtml, pdfOperationSubject } from "../../email/templates/pdfOperation";
import { log } from "../../utils/logger";

export const handleEncryptPdf: TypedEventHandler<PdfOperationPayload> = async (payload) => {
  const { userId, userEmail, fileId, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: pdfOperationSubject("pdf-encrypt"),
      html: pdfOperationEmailHtml({ operationType: "pdf-encrypt", fileName, fileUrl }),
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      fileId,
      feature: "pdf-encrypt",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, fileId, feature: "pdf-encrypt" });
  }
};
