import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import nodemailer from "nodemailer";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const TO_ADDRESS = defineString("CONTACT_TO_ADDRESS", {
  default: "contact@fhdamd.dev",
});
// Defaults to Resend's shared sandbox sender — no domain verification
// required. Safe to rely on indefinitely here because this function only
// ever sends to TO_ADDRESS, which is the Resend account's own registered
// email; Resend's unverified-domain restriction (senders may only email
// their own account address) is exactly this function's one and only
// recipient. Override either param per-environment via a functions/.env.<project-id> file.
const FROM_ADDRESS = defineString("CONTACT_FROM_ADDRESS", {
  default: "Fahad Ahmed <onboarding@resend.dev>",
});

const MAX_LENGTHS = {
  name: 200,
  email: 320,
  business: 200,
  interest: 100,
  timeline: 100,
  message: 2000,
} as const;

interface ContactPayload {
  name: string;
  email: string;
  business?: string;
  interest?: string;
  timeline?: string;
  message: string;
  honeypot?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPreviewOrigin(origin: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/.test(origin);
}

const corsHandler = cors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      origin === "http://localhost:4321" ||
      origin === "https://fhdamd.dev" ||
      isPreviewOrigin(origin);
    callback(allowed ? null : new Error("Not allowed by CORS"), allowed);
  },
});

function validate(body: unknown): { payload: ContactPayload } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body." };
  }

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const business = typeof data.business === "string" ? data.business.trim() : undefined;
  const interest = typeof data.interest === "string" ? data.interest.trim() : undefined;
  const timeline = typeof data.timeline === "string" ? data.timeline.trim() : undefined;
  const honeypot = typeof data.honeypot === "string" ? data.honeypot : "";

  if (!name || name.length > MAX_LENGTHS.name) return { error: "Invalid name." };
  if (!email || email.length > MAX_LENGTHS.email || !EMAIL_PATTERN.test(email)) {
    return { error: "Invalid email address." };
  }
  if (!message || message.length < 10 || message.length > MAX_LENGTHS.message) {
    return { error: "Invalid message." };
  }
  if (business && business.length > MAX_LENGTHS.business) return { error: "Invalid business name." };
  if (interest && interest.length > MAX_LENGTHS.interest) return { error: "Invalid interest." };
  if (timeline && timeline.length > MAX_LENGTHS.timeline) return { error: "Invalid timeline." };

  return { payload: { name, email, business, interest, timeline, message, honeypot } };
}

async function sendViaResend(payload: ContactPayload): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: "resend",
      pass: RESEND_API_KEY.value(),
    },
  });

  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.business ? `Business: ${payload.business}` : undefined,
    payload.interest ? `Interested in: ${payload.interest}` : undefined,
    payload.timeline ? `Timeline: ${payload.timeline}` : undefined,
    "",
    payload.message,
  ].filter((line): line is string => line !== undefined);

  await transporter.sendMail({
    from: FROM_ADDRESS.value(),
    to: TO_ADDRESS.value(),
    replyTo: payload.email,
    subject: `[Contact] New message from ${payload.name}`,
    text: lines.join("\n"),
  });
}

export const sendContactMessage = onRequest(
  { secrets: [RESEND_API_KEY] },
  (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(405).json({ success: false, error: "Method not allowed." });
        return;
      }

      const result = validate(request.body);
      if ("error" in result) {
        response.status(400).json({ success: false, error: result.error });
        return;
      }

      const { payload } = result;

      // Bots that fill the honeypot get a fake success so they don't learn to leave it empty.
      if (payload.honeypot) {
        logger.warn("contact-form: honeypot triggered, silently discarding");
        response.status(200).json({ success: true });
        return;
      }

      try {
        await sendViaResend(payload);
        logger.info("contact-form: message sent");
        response.status(200).json({ success: true });
      } catch (error) {
        logger.error("contact-form: send failed", error);
        response.status(500).json({
          success: false,
          error: "Failed to send message. Please try again or email us directly.",
        });
      }
    });
  },
);
