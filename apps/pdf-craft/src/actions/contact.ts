import { defineAction } from "astro:actions";
import { ContactActionSchema, SUBJECT_LABELS } from "../lib/contactSchema";
import { log } from "../utils/lib/logger";

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = import.meta.env.PUBLIC_RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // skip in environments without the key
  const body = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body,
  });
  const data = await res.json();
  return data.success === true && data.score >= 0.3;
}

async function sendViaResend(payload: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const { fromName, fromEmail, subject, message } = payload;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PDF Craft <no-reply@pdf-craft.app>",
      to: ["support@pdf-craft.app"],
      reply_to: fromEmail,
      subject: `[Contact] ${subject} — from ${fromName}`,
      text: `From: ${fromName} <${fromEmail}>\nSubject: ${subject}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

export const contact = {
  sendMessage: defineAction({
    accept: "json",
    input: ContactActionSchema,
    handler: async (input) => {
      const { name, email, subject, message, captchaToken } = input;
      const subjectLabel = SUBJECT_LABELS[subject] ?? subject;

      log.event("📬 contact-form", { feature: "contact", status: "start" });

      const isHuman = await verifyRecaptcha(captchaToken);
      if (!isHuman) {
        log.warn("📬 contact-form: captcha failed", {
          feature: "contact",
          status: "fail",
        });
        return {
          success: false,
          error: "Captcha verification failed. Please try again.",
        };
      }

      try {
        await sendViaResend({
          fromName: name,
          fromEmail: email,
          subject: subjectLabel,
          message,
        });
        log.business("📬 contact-form-sent", {
          feature: "contact",
          status: "success",
        });
        return { success: true };
      } catch (error) {
        log.exception(error as Error, { feature: "contact" });
        return {
          success: false,
          error:
            "Failed to send message. Please try again or email us directly.",
        };
      }
    },
  }),
};
