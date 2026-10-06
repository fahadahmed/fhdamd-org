import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";

// Cost control: cap concurrent containers per function.
setGlobalOptions({ maxInstances: 10 });

/**
 * Placeholder endpoint that proves the Functions setup end to end.
 * Replace with the waitlist signup function in #388.
 */
export const healthCheck = onRequest({ cors: true }, (request, response) => {
  if (request.method !== "GET") {
    response.set("Allow", "GET").status(405).json({ error: "Method not allowed" });
    return;
  }
  response.json({
    ok: true,
    service: "jamaal-web",
    time: new Date().toISOString(),
  });
});
