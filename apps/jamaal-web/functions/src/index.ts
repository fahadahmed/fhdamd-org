import { PubSub } from "@google-cloud/pubsub";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getRemoteConfig } from "firebase-admin/remote-config";
import { setGlobalOptions } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as Sentry from "@sentry/node";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { onConfigUpdated } from "firebase-functions/v2/remoteConfig";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { Resend } from "resend";
import { createErrorReporter } from "./errors";
import { createMailingList, messageSchema, needsSync } from "./mailingList";
import type { MailingListMessage, SignupRecord } from "./mailingList";
import { dispatchRebuild } from "./rebuild";
import { createResendContacts } from "./resendContacts";
import { createWebhookHandler } from "./resendWebhook";
import { createRateLimiter } from "./rateLimit";
import type { CounterStore } from "./rateLimit";
import { createSignupHandler, mergeInvite } from "./signup";
import type { SignupStore } from "./signup";
import { createCachedStageSource, stageFromTemplate } from "./stage";

initializeApp();

// Cost control: cap concurrent containers per function. Every function runs in us-central1, next to Firestore;
// without this the Remote Config trigger defaults to us-east1.
setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// The Sentry DSN for these functions comes from .env.jamaal-web; empty switches error reporting off.
const errors = createErrorReporter(() => process.env.SENTRY_DSN ?? "", () => Sentry);

const ALREADY_EXISTS = 6; // gRPC status code
const db = () => getFirestore();

const store: SignupStore = {
  async create({ firstName, email, devices, source, stage }) {
    try {
      await db()
        .collection("signups")
        .doc(email)
        .create({ firstName, email, devices, source, stage, createdAt: FieldValue.serverTimestamp() });
      return "created";
    } catch (error) {
      if ((error as { code?: number }).code === ALREADY_EXISTS) return "exists";
      throw error;
    }
  },
  async requestInvite(email, details) {
    const ref = db().collection("signups").doc(email);
    // One transaction, so two quick submissions can't overwrite each other's devices.
    await db().runTransaction(async (tx) => {
      const current = (await tx.get(ref)).data() ?? {};
      tx.update(ref, { ...mergeInvite(current, details), inviteRequestedAt: FieldValue.serverTimestamp() });
    });
  },
};

const counters: CounterStore = {
  async increment(id, expiresAt) {
    const ref = db().collection("rateLimits").doc(id);
    return db().runTransaction(async (tx) => {
      const count = ((await tx.get(ref)).data()?.count ?? 0) + 1;
      tx.set(ref, { count, expiresAt: Timestamp.fromDate(expiresAt) });
      return count;
    });
  },
};

// The stage is the site_stage parameter in Remote Config, the same one CI reads for the build.
const stage = createCachedStageSource(async () => stageFromTemplate(await getRemoteConfig().getTemplate()), {
  onError: (error) =>
    logger.warn("Could not read the site stage; using the last known one", {
      message: error instanceof Error ? error.message : "unknown",
    }),
});

const handle = createSignupHandler({
  store,
  stage,
  limiter: createRateLimiter(counters),
  onLimiterError: (error) =>
    logger.warn("Rate limiter failed; letting the signup through", {
      message: error instanceof Error ? error.message : "unknown",
    }),
});

/**
 * POST /api/signup (a Firebase Hosting rewrite, so the site calls it
 * same-origin). Stores one document per email in Firestore and answers with
 * the outcome. It does no email or Apple calls itself.
 */
export const signup = onRequest({ cors: false, maxInstances: 5 }, async (request, response) => {
  response.set("Cache-Control", "no-store");
  try {
    const result = await handle({
      method: request.method,
      origin: request.get("origin"),
      ip: request.get("x-forwarded-for")?.split(",")[0].trim() || request.ip,
      body: request.body,
    });
    response.status(result.status).json(result.body);
  } catch (error) {
    // Never log the address or name: log the failure only.
    logger.error("signup failed", { message: error instanceof Error ? error.message : "unknown" });
    await errors.capture(error);
    response.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// A fine-grained GitHub token (this repository, Actions: read and write), stored in Secret Manager.
const githubDispatchToken = defineSecret("GITHUB_DISPATCH_TOKEN");

/**
 * When Remote Config is published (for example `site_stage` is flipped), rebuild
 * and redeploy the static site so the new stage reaches visitors in a couple of
 * minutes. The signup function reads the stage itself and needs no rebuild.
 */
export const rebuildOnConfigChange = onConfigUpdated({ secrets: [githubDispatchToken] }, async (event) => {
  try {
    await dispatchRebuild({
      token: githubDispatchToken.value(),
      owner: "fahadahmed",
      repo: "fhdamd-org",
      workflow: "ci-jamaal-web.yml",
      ref: "main",
    });
    logger.info("Queued a site rebuild", { remoteConfigVersion: event.data.versionNumber });
  } catch (error) {
    logger.error("Could not queue a site rebuild", { message: error instanceof Error ? error.message : "unknown" });
    await errors.capture(error);
  }
});

// ─── The mailing list: Firestore signups kept in step with Resend ───────────────────────────────

// Set in functions/.env.jamaal-web. The Resend API key and the webhook signing secret are in Secret Manager.
const resendApiKey = defineSecret("RESEND_API_KEY");
const resendWebhookSecret = defineSecret("RESEND_WEBHOOK_SECRET");

const MAILING_LIST_TOPIC = "mailing-list";
const NOT_FOUND = 5; // gRPC status code

let pubsub: PubSub | undefined;
const publish = (message: MailingListMessage) => (pubsub ??= new PubSub()).topic(MAILING_LIST_TOPIC).publishMessage({ json: message });

const signups = () => db().collection("signups");

/** Updates a signup that may have been deleted since: a missing one is not an error. */
async function updateSignup(email: string, data: Record<string, unknown>): Promise<void> {
  try {
    await signups().doc(email).update(data);
  } catch (error) {
    if ((error as { code?: number }).code !== NOT_FOUND) throw error;
  }
}

/** A new signup is queued for Resend. Failing to queue is retried, and the daily check would catch it anyway. */
export const queueNewSignup = onDocumentCreated({ document: "signups/{email}", retry: true }, async (event) => {
  await publish({ type: "add", email: event.params.email });
});

/** A removed signup (someone asked to be deleted) is removed from Resend as well. */
export const queueRemovedSignup = onDocumentDeleted({ document: "signups/{email}", retry: true }, async (event) => {
  await publish({ type: "remove", email: event.params.email });
});

/**
 * Works through the queue one message at a time, slowly enough for Resend's rate limit. A failure is
 * thrown, so Pub/Sub retries it with backoff; after six hours it is recorded and reported instead.
 */
export const syncMailingList = onMessagePublished(
  { topic: MAILING_LIST_TOPIC, secrets: [resendApiKey], retry: true, maxInstances: 1, concurrency: 1 },
  async (event) => {
    const parsed = messageSchema.safeParse(event.data.message.json);
    if (!parsed.success) {
      logger.warn("Ignoring a malformed mailing-list message");
      return;
    }
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      // Not set up yet. The daily check queues everyone again once it is.
      logger.warn("RESEND_AUDIENCE_ID is not set; the mailing list is off");
      return;
    }

    const sync = createMailingList({
      signups: {
        get: async (email) => {
          const snapshot = await signups().doc(email).get();
          return snapshot.exists ? (snapshot.data() as SignupRecord) : null;
        },
        markSynced: (email, contactId) => updateSignup(email, { mailingListSyncedAt: FieldValue.serverTimestamp(), resendContactId: contactId }),
        recordFailure: async ({ email, type, message, queuedAt }) => {
          await db().collection("mailingListFailures").add({ email, type, message, queuedAt, failedAt: FieldValue.serverTimestamp() });
          if (type === "add") await updateSignup(email, { mailingListFailedAt: FieldValue.serverTimestamp() });
        },
      },
      contacts: createResendContacts(new Resend(resendApiKey.value()), { audienceId }),
      report: (error) => errors.capture(error),
      now: () => new Date(),
    });
    const outcome = await sync(parsed.data, new Date(event.data.message.publishTime));
    logger.info("Mailing list message handled", { type: parsed.data.type, outcome });
  },
);

/**
 * Every day, queues anyone who is not in Resend yet: the people who were already on the list when this was
 * added, and anything that failed. Anyone given up on (`mailingListFailedAt`) or unsubscribed is left alone.
 */
export const reconcileMailingList = onSchedule({ schedule: "every day 03:00", timeZone: "Australia/Melbourne", timeoutSeconds: 300 }, async () => {
  const snapshot = await signups().select("mailingListSyncedAt", "unsubscribedAt", "mailingListFailedAt").get();
  const emails = snapshot.docs.filter((doc) => needsSync(doc.data() as SignupRecord)).map((doc) => doc.id);
  for (let i = 0; i < emails.length; i += 100) {
    await Promise.all(emails.slice(i, i + 100).map((email) => publish({ type: "add", email })));
  }
  logger.info("Queued signups for the mailing list", { checked: snapshot.size, queued: emails.length });
});

const handleResendWebhook = createWebhookHandler({
  verify: (body, headers) => new Resend(resendApiKey.value()).webhooks.verify({ payload: body, headers, webhookSecret: resendWebhookSecret.value() }) as ReturnType<Parameters<typeof createWebhookHandler>[0]["verify"]>,
  setUnsubscribed: (email, unsubscribed) => updateSignup(email, { unsubscribedAt: unsubscribed ? FieldValue.serverTimestamp() : FieldValue.delete() }),
});

/** Resend calls this when a contact changes, so an unsubscribe is recorded here too. Signed; anything else is refused. */
export const resendWebhook = onRequest({ secrets: [resendApiKey, resendWebhookSecret], cors: false, maxInstances: 2 }, async (request, response) => {
  try {
    const result = await handleResendWebhook({
      method: request.method,
      rawBody: request.rawBody.toString("utf8"),
      headers: { id: request.get("svix-id"), timestamp: request.get("svix-timestamp"), signature: request.get("svix-signature") },
    });
    response.status(result.status).send(result.body);
  } catch (error) {
    logger.error("Resend webhook failed", { message: error instanceof Error ? error.message : "unknown" });
    await errors.capture(error);
    response.status(500).send("error");
  }
});
