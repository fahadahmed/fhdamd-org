import { getResend } from "../../email/resend";
import type { AppEventHandler } from "./types";
import { log } from "../../utils/logger";

export const handleMergePdfs: AppEventHandler = async (payload) => {
  const { userId, userEmail, fileId, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: "Your Merged PDF is Ready!",
      html: `
        <p>Hi there,</p>
        <p>Your PDF files have been successfully merged into a single PDF file named <strong>${fileName}</strong>.</p>
        <p>You can download your merged PDF using the link below:</p>
        <p><a href="${fileUrl}">Download Merged PDF</a></p>
        <p>Thank you for using PDF Craft!</p>
      `,
    });
    log.business("📧 email-sent", {
      requestId,
      userId,
      fileId,
      feature: "pdf-merge",
      status: "success",
    });
  } catch (error) {
    log.exception(error as Error, { requestId, userId, fileId, feature: "pdf-merge" });
  }
};
