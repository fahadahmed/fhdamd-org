import { getResend } from "../../email/resend";
import type { AppEventHandler } from "./types";
import { log } from "../../utils/logger";

export const handleEncryptPdf: AppEventHandler = async (payload) => {
  const { userEmail, fileName, fileUrl, requestId } = payload;

  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: "PDF Craft <no-reply@pdf-craft.app>",
      subject: "Your Protected PDF is Ready!",
      html: `
        <p>Hi there,</p>
        <p>Your PDF <strong>${fileName}</strong> has been successfully encrypted and password protected.</p>
        <p>You can download it using the link below:</p>
        <p><a href="${fileUrl}">Download Protected PDF</a></p>
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
