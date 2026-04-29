import { getResend } from "../../email/resend";
import type { AppEventHandler } from "./types";
import { log } from "../../utils/logger";

export const handleImageToPdf: AppEventHandler = async (payload) => {
  const { userEmail, fileName, fileUrl, requestId } = payload;

  // Send email notification using Resend
  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: "Your Image to PDF is Ready!",
      html: `
        <p>Hi there,</p>
        <p>Your images have been successfully converted to a PDF file named <strong>${fileName}</strong>.</p>
        <p>You can download your PDF using the link below:</p>
        <p><a href="${fileUrl}">Download PDF</a></p>
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
