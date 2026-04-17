import { onRequest } from "firebase-functions/v2/https";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import cors from "cors";
import { AppEventPayload } from "./events/types";
import { eventHandlers } from "./events/handlers";
import { fetchCMSData, getCmsQuery, datocmsApiToken, datocmsEnv } from "./cms";
import { log } from "./utils/logger";

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
        log.info(
          `RequestId: ${requestId} - Preflight request received for user: ${userId}`,
        );
        response.set(204).send("");
        return;
      }
      if (request.method !== "POST") {
        log.warn(
          `RequestId: ${requestId} - Request method not allowed for user: ${userId}`,
          { method: request.method },
        );
        response.status(405).send("Method not allowed");
        return;
      }

      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        log.warn(
          `RequestId: ${requestId} - Unauthorized request: No Bearer token provided`,
        );
        response.status(401).send("Unauthorized: No Bearer token provided");
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const baseUrl = getAppBaseUrl();
      if (!baseUrl) {
        log.error(
          `RequestId: ${requestId} - BASE_URL is not configured for user: ${userId}`,
        );
        throw new Error("BASE_URL is not configured");
      }
      log.info(
        `RequestId: ${requestId} - Payment request received for user: ${userId}`,
        {
          requestId,
          userId,
          credits,
          amount,
          currency,
          productName,
        },
      );
      try {
        // Verify token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Now you know the user is authenticated
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
            log.info(
              `RequestId: ${requestId} - Payment session created for user: ${userId} - session: ${session.id}`,
              {
                requestId,
                sessionId: session.id,
              },
            );
            response.status(200).json({ url: session.url });
            return;
          } catch (error) {
            log.error(
              `RequestId: ${requestId} - Payment processing error for user: ${userId}`,
              {
                requestId,
                error: error instanceof Error ? error.message : String(error),
              },
            );
            response.status(500).json({ error: "Payment processing failed" });
            return;
          }
        } else {
          log.warn("Unauthorized request: User ID does not match token", {
            requestId,
            tokenUserId: uid,
            payloadUserId: userId,
          });
          response.status(403).send("Forbidden: User ID does not match token");
          return;
        }
      } catch (error) {
        log.warn(
          `RequestId: ${requestId} - Unauthorized request: Invalid token for user: ${userId}`,
          {
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
        );
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
        rawBody as Buffer, // 👈 force it to Buffer
        sig,
        STRIPE_WEBHOOK_SECRET.value(),
      );
    } catch (err: any) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    log.info("Stripe webhook received", {
      eventId: event.id,
      eventType: event.type,
    });
    let requestId = "N/A";
    if (event.data.object && "metadata" in event.data.object) {
      requestId = (event.data.object as any).metadata?.requestId || "N/A";
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      log.info("✅ Event received:", { eventId: event.id, requestId });

      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || "0", 10);
      log.info(`User ID: ${userId}, Credits to add: ${credits}`, { requestId });
      if (userId && credits > 0) {
        const userRef = db.collection("users").doc(userId);
        log.info(`User reference: ${userRef.path}`, { requestId });
        try {
          await userRef.update({
            "profile.credits": FieldValue.increment(credits),
          });
          log.info(`✅ Updated user ${userId} with ${credits} credits.`, {
            requestId,
          });
        } catch (err) {
          log.error("❌ Error updating user credits:", {
            error: err instanceof Error ? err.message : String(err),
            requestId,
          });
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
      log.warn(`Received Pub/Sub message without data`);
      return;
    }
    const buffer = Buffer.from(message.data, "base64");
    const payload = JSON.parse(buffer.toString("utf8")) as AppEventPayload;
    const { eventType, requestId } = payload;

    try {
      log.info(`RequestId: ${requestId} - Received Pub/Sub payload`, {
        eventType,
        requestId,
      });
      const handler = eventHandlers[eventType];
      if (!handler) {
        log.warn(
          `RequestId: ${requestId} - No handler registered for eventType: ${eventType}`,
          {
            requestId,
          },
        );
        return;
      }

      await handler(payload);
      log.info(
        `RequestId: ${requestId} - Successfully processed eventType: ${eventType}`,
        {
          requestId,
        },
      );
    } catch (error) {
      log.error(`RequestId: ${requestId} - Failed processing Pub/Sub event`, {
        error: error instanceof Error ? error.message : String(error),
        requestId,
      });
      throw error; // important → enables retry
    }
  },
);

const cms = onRequest(
  { secrets: [datocmsApiToken, datocmsEnv] },
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        log.info("CMS preflight request received");
        response.status(204).send("");
        return;
      }
      if (request.method !== "POST") {
        log.warn("CMS request method not allowed", { method: request.method });
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
        log.info("CMS data fetched successfully", { queryKey, variables });
        response.status(200).json(cmsData);
      } catch (error) {
        log.error("CMS request error", {
          error: error instanceof Error ? error.message : String(error),
        });
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

            try {
              await admin.storage().bucket().file(storagePath).delete();
              logger.info(`Deleted file from storage: ${storagePath}`);
            } catch (err) {
              logger.error(
                `Error deleting file from storage: ${storagePath}`,
                err,
              );
            }

            batch.update(fileDoc.ref, { deleted: true });
          },
        );

        await Promise.all(deletionPromises);
        await batch.commit();
        logger.info(
          `Marked ${expiredFilesSnapshot.size} files as deleted for user ${userId}`,
        );
      }
    } catch (err) {
      logger.error("Error deleting expired files", err);
    }
  },
);
export { processPayment, stripeWebhook, onAppEvent, cms, deleteExpiredFiles };
