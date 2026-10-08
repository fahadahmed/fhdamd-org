import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { createWaitlistHandler } from "./waitlist";
import type { WaitlistStore } from "./waitlist";

initializeApp();

// Cost control: cap concurrent containers per function.
setGlobalOptions({ maxInstances: 10 });

const ALREADY_EXISTS = 6; // gRPC status code

const store: WaitlistStore = {
  async add({ id, firstName, email, source }) {
    try {
      await getFirestore()
        .collection("waitlist")
        .doc(id)
        .create({ firstName, email, source, createdAt: FieldValue.serverTimestamp() });
      return "created";
    } catch (error) {
      if ((error as { code?: number }).code === ALREADY_EXISTS) return "exists";
      throw error;
    }
  },
};

const handle = createWaitlistHandler(store);

/**
 * POST /api/waitlist (a Firebase Hosting rewrite, so the site calls it
 * same-origin). Stores one record per email in Firestore.
 */
export const joinWaitlist = onRequest({ cors: false, maxInstances: 5 }, async (request, response) => {
  response.set("Cache-Control", "no-store");
  try {
    const result = await handle({
      method: request.method,
      origin: request.get("origin"),
      body: request.body,
    });
    response.status(result.status).json(result.body);
  } catch (error) {
    // Never log the address or name: log the failure only.
    logger.error("joinWaitlist failed", { message: error instanceof Error ? error.message : "unknown" });
    response.status(500).json({ error: "Something went wrong. Please try again." });
  }
});
