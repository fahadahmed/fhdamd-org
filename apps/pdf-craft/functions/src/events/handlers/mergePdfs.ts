import { getResend } from "../../email/resend";
import type { AppEventHandler } from "./types";
import { log } from "../../utils/logger";

export const handleMergePdfs: AppEventHandler = async (payload) => {
  const { userEmail, fileName, fileUrl, requestId } = payload;

  // Send email notification using Resend
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
    log.info(
      `✅ RequestID: ${requestId} - Email sent to ${userEmail} for file ${fileName}`,
    );
  } catch (error) {
    log.error(`❌ RequestID: ${requestId} - Error sending email notification`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
