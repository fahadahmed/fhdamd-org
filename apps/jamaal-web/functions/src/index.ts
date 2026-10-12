import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getRemoteConfig } from "firebase-admin/remote-config";
import { setGlobalOptions } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as Sentry from "@sentry/node";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { onConfigUpdated } from "firebase-functions/v2/remoteConfig";
import { createErrorReporter } from "./errors";
import { dispatchRebuild } from "./rebuild";
import { createRateLimiter } from "./rateLimit";
import type { CounterStore } from "./rateLimit";
import { createSignupHandler } from "./signup";
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
  async requestInvite(email) {
    await db().collection("signups").doc(email).update({ inviteRequestedAt: FieldValue.serverTimestamp() });
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
