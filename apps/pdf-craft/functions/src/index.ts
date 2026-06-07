import { onRequest } from "firebase-functions/v2/https";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import cors from "cors";
import type { AppEventPayload } from "./events/types";
import { eventHandlers } from "./events/handlers";
import { fetchCMSData, getCmsQuery, datocmsApiToken, datocmsEnv } from "./cms";
import { log } from "./utils/logger";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  environment: process.env.PUBLIC_APP_ENV || "dev",
  tracesSampleRate: 0.2,
});

admin.initializeApp();

const db = getFirestore();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const APP_BASE_URL = defineSecret("APP_BASE_URL");

function getStripe() {
  const secretKey = STRIPE_SECRET_KEY.value();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

function getAppBaseUrl() {
  const baseUrl = APP_BASE_URL.value();
  if (!baseUrl) {
    throw new Error("APP_BASE_URL is not configured");
  }
  return baseUrl;
}

const corsHandler = cors({
  origin: [
    "http://localhost:4321",
    "https://dev.pdf-craft.app",
    "https://stg.pdf-craft.app",
    "https://pdf-craft.app",
  ],
});

const processPayment = onRequest(
  {
    secrets: [STRIPE_SECRET_KEY, APP_BASE_URL],
  },
  async (request, response) => {
    corsHandler(request, response, async () => {
      // Parse the initial request object
      const data =
        typeof request.body === "string"
          ? JSON.parse(request.body)
          : request.body;
      const {
        credits,
        amount,
        quantity,
        currency,
        productName,
        userId,
        userEmail,
        requestId,
      } = data;

      // pre-payment processing checks

      if (request.method === "OPTIONS") {
        log.debug("💳 process-payment: preflight", { requestId, userId, feature: "payment" });
        response.set(204).send("");
        return;
      }
      if (request.method !== "POST") {
        log.warn("💳 process-payment: method not allowed", {
          requestId,
          userId,
          method: request.method,
          feature: "payment",
          status: "fail",
        });
        response.status(405).send("Method not allowed");
        return;
      }

      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        log.warn("💳 process-payment: no bearer token", {
          requestId,
          userId,
          feature: "payment",
          status: "fail",
        });
        response.status(401).send("Unauthorized: No Bearer token provided");
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const baseUrl = getAppBaseUrl();
      if (!baseUrl) {
        log.error("💳 process-payment: APP_BASE_URL not configured", { requestId, userId, feature: "payment" });
        throw new Error("BASE_URL is not configured");
      }

      log.event("💳 process-payment", {
        requestId,
        userId,
        credits,
        amount,
        currency,
        productName,
        feature: "payment",
        status: "start",
      });

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        if (uid === userId) {
          try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              mode: "payment",
              line_items: [
                {
                  price_data: {
                    currency: currency,
                    unit_amount: amount,
                    product_data: { name: productName },
                  },
                  quantity: quantity,
                },
              ],
              success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${baseUrl}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
              metadata: {
                userId: userId,
                userEmail: userEmail,
                credits: credits,
                requestId: requestId,
              },
            });
            log.business("💳 payment-session-created", {
              requestId,
              userId,
              sessionId: session.id,
              credits,
              amount,
              currency,
              feature: "payment",
              status: "success",
            });
            response.status(200).json({ url: session.url });
            return;
          } catch (error) {
            log.exception(error as Error, { requestId, userId, feature: "payment" });
            response.status(500).json({ error: "Payment processing failed" });
            return;
          }
        } else {
          log.warn("💳 process-payment: user id mismatch", {
            requestId,
            tokenUserId: uid,
            payloadUserId: userId,
            feature: "payment",
            status: "fail",
          });
          response.status(403).send("Forbidden: User ID does not match token");
          return;
        }
      } catch (error) {
        log.warn("💳 process-payment: invalid token", {
          requestId,
          userId,
          feature: "payment",
          status: "fail",
        });
        response.status(401).send("Unauthorized: Invalid token");
        return;
      }
    });
  },
);

const stripeWebhook = onRequest(
  { cors: true, secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (request, response) => {
    const sig = request.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    const rawBody = request.rawBody;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        rawBody as Buffer,
        sig,
        STRIPE_WEBHOOK_SECRET.value(),
      );
    } catch (err: any) {
      log.warn("💳 stripe-webhook: invalid signature", {
        feature: "payment",
        status: "fail",
        error: err.message,
      });
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    let requestId = "N/A";
    if (event.data.object && "metadata" in event.data.object) {
      requestId = (event.data.object as any).metadata?.requestId || "N/A";
    }

    log.event("💳 stripe-webhook", {
      feature: "payment",
      eventId: event.id,
      eventType: event.type,
      requestId,
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || "0", 10);

      if (userId && credits > 0) {
        const userRef = db.collection("users").doc(userId);
        try {
          await userRef.update({
            "profile.credits": FieldValue.increment(credits),
          });
          log.business("💰 credits-purchased", {
            requestId,
            userId,
            credits,
            sessionId: session.id,
            feature: "payment",
            status: "success",
          });
        } catch (err) {
          log.exception(err as Error, { requestId, userId, feature: "payment" });
        }
      }
    }
    // Acknowledge immediately so Stripe doesn’t retry
    response.status(200).send("ok");
  },
);

const onAppEvent = onMessagePublished(
  { topic: "app-event", secrets: ["RESEND_API_KEY"] },
  async (event) => {
    const message = event.data.message;

    if (!message?.data) {
      log.warn("🔄 app-event: message without data", { feature: "events" });
      return;
    }
    const buffer = Buffer.from(message.data, "base64");
    const payload = JSON.parse(buffer.toString("utf8")) as AppEventPayload;
    const { eventType, requestId, userId } = payload;

    try {
      log.event("🔄 app-event", {
        requestId,
        userId,
        eventType,
        feature: eventType,
        status: "start",
      });
      const handler = eventHandlers[eventType];
      if (!handler) {
        log.warn("🔄 app-event: no handler registered", {
          requestId,
          userId,
          eventType,
          feature: eventType,
          status: "fail",
        });
        return;
      }

      await handler(payload);
      log.business("🔄 app-event", {
        requestId,
        userId,
        eventType,
        feature: eventType,
        status: "success",
      });
    } catch (error) {
      log.exception(error as Error, { requestId, userId, eventType, feature: eventType });
      throw error; // important → enables retry
    }
  },
);

const cms = onRequest(
  { secrets: [datocmsApiToken, datocmsEnv] },
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        log.debug("📦 cms: preflight", { feature: "cms" });
        response.status(204).send("");
        return;
      }
      if (request.method !== "POST") {
        log.warn("📦 cms: method not allowed", { method: request.method, feature: "cms", status: "fail" });
        response.status(405).send("Method not allowed");
        return;
      }

      try {
        const data =
          typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body;
        const { queryKey, variables } = data;

        const query = getCmsQuery(queryKey);
        const cmsData = await fetchCMSData(query, variables);
        log.debug("📦 cms: data fetched", { queryKey, feature: "cms" });
        response.status(200).json(cmsData);
      } catch (error) {
        log.exception(error as Error, { feature: "cms" });
        response.status(500).json({ error: "CMS request failed" });
      }
    });
  },
);

const deleteExpiredFiles = onSchedule(
  {
    schedule: "every 60 minutes",
    timeZone: "UTC",
  },
  async () => {
    const now = new Date();

    try {
      const usersSnapshot = await db.collection("users").get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const filesRef = db.collection("users").doc(userId).collection("files");
        const expiredFilesSnapshot = await filesRef
          .where("deleted", "==", false)
          .where("expiresAt", "<=", now)
          .limit(500)
          .get();

        if (expiredFilesSnapshot.empty) continue;

        const batch = db.batch();

        const deletionPromises = expiredFilesSnapshot.docs.map(
          async (fileDoc) => {
            const data = fileDoc.data();
            const storagePath = data.storagePath;
            const fileId = fileDoc.id;

            try {
              await admin.storage().bucket().file(storagePath).delete();
              log.info("🗑️ file-storage-deleted", { userId, fileId, storagePath, feature: "cleanup" });
            } catch (err) {
              log.exception(err as Error, { userId, fileId, storagePath, feature: "cleanup" });
            }

            batch.update(fileDoc.ref, {
              deleted: true,
              deletedAt: FieldValue.serverTimestamp(),
              deletedReason: "Delete Cron Job",
            });
          },
        );

        await Promise.all(deletionPromises);
        await batch.commit();
        log.info("🗑️ files-batch-expired", {
          userId,
          count: expiredFilesSnapshot.size,
          feature: "cleanup",
        });
      }
    } catch (err) {
      log.exception(err as Error, { feature: "cleanup" });
    }
  },
);
export { processPayment, stripeWebhook, onAppEvent, cms, deleteExpiredFiles };
