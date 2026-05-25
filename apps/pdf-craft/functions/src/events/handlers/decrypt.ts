import { getResend } from "../../email/resend";
import type { AppEventHandler } from "./types";
import { log } from "../../utils/logger";

export const handleDecryptPdf: AppEventHandler = async (payload) => {
  const { userEmail, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: "Your Unlocked PDF is Ready!",
      html: `
        <p>Hi there,</p>
        <p>Your PDF <strong>${fileName}</strong> has been successfully unlocked and password protection has been removed.</p>
        <p>You can download it using the link below:</p>
        <p><a href="${fileUrl}">Download Unlocked PDF</a></p>
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
