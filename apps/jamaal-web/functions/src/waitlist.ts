import { createHash } from "node:crypto";
import { z } from "zod";

/** What the site posts. `company` is a honeypot: real people never see or fill it. */
export const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.enum(["hero", "join"]),
  company: z.string().max(200).optional(),
});

export type Signup = z.infer<typeof signupSchema>;

/** Where signups may come from: the live site, its Firebase hosts and preview channels, and local dev. */
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?jamaal\.app$/,
  /^https:\/\/jamaal-web(--[a-z0-9-]+)?\.(web\.app|firebaseapp\.com)$/,
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
];

/** A missing Origin (server-to-server, curl) is let through; a present one must be ours. */
export function isAllowedOrigin(origin: string | undefined): boolean {
  return origin === undefined || ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

/** One document per address: the id is a hash of the lower-cased email, so a repeat signup is a no-op. */
export function signupId(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export interface WaitlistEntry {
  id: string;
  firstName: string;
  email: string;
  source: Signup["source"];
}

export interface WaitlistStore {
  /** Resolves "exists" instead of overwriting when the address is already on the list. */
  add(entry: WaitlistEntry): Promise<"created" | "exists">;
}

export interface WaitlistRequest {
  method: string;
  origin?: string;
  body: unknown;
}

export interface WaitlistResponse {
  status: number;
  body: { ok: true } | { error: string };
}

const ok: WaitlistResponse = { status: 200, body: { ok: true } };
const fail = (status: number, error: string): WaitlistResponse => ({ status, body: { error } });

/**
 * The signup logic, free of the Functions runtime so it can be tested.
 * It answers 200 for new and repeat addresses alike, so the response never
 * reveals who is already on the list, and it quietly drops honeypot hits.
 */
export function createWaitlistHandler(store: WaitlistStore) {
  return async function handle(request: WaitlistRequest): Promise<WaitlistResponse> {
    if (!isAllowedOrigin(request.origin)) return fail(403, "Origin not allowed");
    if (request.method !== "POST") return fail(405, "Method not allowed");

    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) return fail(400, "Check your name and email address and try again.");

    const { firstName, email, source, company } = parsed.data;
    if (company) return ok; // a bot filled the honeypot: pretend it worked, store nothing

    await store.add({ id: signupId(email), firstName, email, source });
    return ok;
  };
}
