import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import nodemailer from "nodemailer";
import { z } from "zod";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const CONTACT_TO_ADDRESS = defineSecret("CONTACT_TO_ADDRESS");
// Set to Resend's shared sandbox sender — no domain verification required.
// Safe to rely on indefinitely here because this function only ever sends to
// CONTACT_TO_ADDRESS, which is the Resend account's own registered email;
// Resend's unverified-domain restriction (senders may only email their own
// account address) is exactly this function's one and only recipient.
const CONTACT_FROM_ADDRESS = defineSecret("CONTACT_FROM_ADDRESS");

const MAX_LENGTHS = {
  name: 200,
  email: 320,
  business: 200,
  interest: 100,
  timeline: 100,
  message: 2000,
} as const;

const trimmed = (max: number) => z.string().trim().max(max);

const ContactSchema = z.object({
  name: trimmed(MAX_LENGTHS.name).min(1, "Invalid name."),
  email: trimmed(MAX_LENGTHS.email).email("Invalid email address."),
  message: trimmed(MAX_LENGTHS.message).min(10, "Invalid message."),
  business: trimmed(MAX_LENGTHS.business).optional(),
  interest: trimmed(MAX_LENGTHS.interest).optional(),
  timeline: trimmed(MAX_LENGTHS.timeline).optional(),
  honeypot: z.string().optional(),
});

type ContactPayload = z.infer<typeof ContactSchema>;

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
  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid request body." };
  }
  return { payload: result.data };
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
    from: CONTACT_FROM_ADDRESS.value(),
    to: CONTACT_TO_ADDRESS.value(),
    replyTo: payload.email,
    subject: `[Contact] New message from ${payload.name}`,
    text: lines.join("\n"),
  });
}

export const sendContactMessage = onRequest(
  { secrets: [RESEND_API_KEY, CONTACT_TO_ADDRESS, CONTACT_FROM_ADDRESS] },
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
