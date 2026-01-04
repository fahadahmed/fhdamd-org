import { getResend } from '../../email/resend';
import { AppEventHandler } from './types';

export const handleImageToPdf: AppEventHandler = async (payload) => {
  const { userEmail, fileName, fileUrl } = payload;

  // Send email notification using Resend
  try {
    const resend = getResend();
    await resend.emails.send({
      to: userEmail,
      from: 'PDF Craft <no-reply@pdf-craft.app>',
      subject: 'Your Image to PDF is Ready!',
      html: `
        <p>Hi there,</p>
        <p>Your images have been successfully converted to a PDF file named <strong>${fileName}</strong>.</p>
        <p>You can download your PDF using the link below:</p>
        <p><a href="${fileUrl}">Download PDF</a></p>
        <p>Thank you for using PDF Craft!</p>
      `,
    });
    console.log(`✅ Email sent to ${userEmail} for file ${fileName}`);
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
  }
};
