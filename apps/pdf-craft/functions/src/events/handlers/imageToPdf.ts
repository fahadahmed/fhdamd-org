import { getResend } from "../../email/resend";
import type { TypedEventHandler } from "./types";
import type { PdfOperationPayload } from "../types";
import { pdfOperationEmailHtml, pdfOperationSubject } from "../../email/templates/pdfOperation";
import { log } from "../../utils/logger";

export const handleImageToPdf: TypedEventHandler<PdfOperationPayload> = async (payload) => {
  const { userId, userEmail, fileId, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: pdfOperationSubject("image-to-pdf"),
      html: pdfOperationEmailHtml({ operationType: "image-to-pdf", fileName, fileUrl }),
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      fileId,
      feature: "image-to-pdf",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, fileId, feature: "image-to-pdf" });
  }
};
