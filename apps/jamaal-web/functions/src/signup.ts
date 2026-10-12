import { z } from "zod";
import type { RateLimiter } from "./rateLimit";
import type { Stage, StageSource } from "./stage";

export const DEVICES = ["iphone", "ipad", "mac"] as const;

/**
 * What the site posts. `company` is a honeypot: real people never see or fill
 * it. `phase` is accepted but ignored: the stage comes from Remote Config, so
 * a stale page can't skip the invite.
 */
export const signupSchema = z.object({
  firstName: z.string().trim().max(80).default(""),
  email: z.string().trim().toLowerCase().email().max(254),
  devices: z.array(z.enum(DEVICES)).max(DEVICES.length).default([]),
  source: z.enum(["hero", "join", "landing"]).default("landing"),
  phase: z.unknown().optional(),
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

export interface SignupEntry {
  firstName: string;
  email: string;
  devices: Signup["devices"];
  source: Signup["source"];
  stage: Stage;
}

/** One document per address (`signups/{email}`), so a repeat signup never overwrites. */
export interface SignupStore {
  create(entry: SignupEntry): Promise<"created" | "exists">;
  /** The address signed up before. In the beta, record that the invite should be sent, keeping the devices and name they gave now. */
  requestInvite(email: string, details: InviteDetails): Promise<void>;
}

/** What someone already on the list tells us when they join the beta. */
export interface InviteDetails {
  firstName: string;
  devices: Signup["devices"];
}

/**
 * What to store when an address that is already on the list joins the beta: the
 * devices they have now chosen are added to any they gave before (in a fixed
 * order, no duplicates), and the name is filled in only if it was blank.
 */
export function mergeInvite(
  existing: { firstName?: unknown; devices?: unknown },
  incoming: InviteDetails,
): InviteDetails {
  const before = Array.isArray(existing.devices) ? existing.devices : [];
  const firstName = typeof existing.firstName === "string" && existing.firstName.trim() ? existing.firstName : incoming.firstName;
  return { firstName, devices: DEVICES.filter((device) => before.includes(device) || incoming.devices.includes(device)) };
}

export interface SignupRequest {
  method: string;
  origin?: string;
  /** The client's address, from the proxy chain. */
  ip?: string;
  body: unknown;
}

export type SignupResult =
  | { status: 200; body: { status: "added" | "invited" } }
  | { status: 409; body: { status: "exists" } }
  | { status: 400 | 403 | 405 | 429; body: { error: string; field?: string } };

const fail = (status: 400 | 403 | 405 | 429, error: string, field?: string): SignupResult => ({
  status,
  body: field ? { error, field } : { error },
});

export interface SignupDeps {
  store: SignupStore;
  stage: StageSource;
  limiter: RateLimiter;
  /** Called when the limiter itself breaks; signups then go through rather than being refused. */
  onLimiterError?: (error: unknown) => void;
}

/**
 * The signup logic, free of the Functions runtime so it can be tested.
 * Waitlist and launched signups are `added`; in the beta they are `invited`
 * (the invite itself is sent by a separate function). A repeat address is a 409
 * and, in the beta, asks for the invite to be sent again.
 */
export function createSignupHandler({ store, stage, limiter, onLimiterError }: SignupDeps) {
  return async function handle(request: SignupRequest): Promise<SignupResult> {
    if (!isAllowedOrigin(request.origin)) return fail(403, "Origin not allowed");
    if (request.method !== "POST") return fail(405, "Method not allowed");

    if (request.ip) {
      let allowed = true;
      try {
        allowed = await limiter.allow(request.ip);
      } catch (error) {
        onLimiterError?.(error);
      }
      if (!allowed) return fail(429, "Too many attempts. Please try again in a few minutes.");
    }

    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      const field = String(parsed.error.issues[0]?.path[0] ?? "");
      const message =
        field === "email" ? "That address looks incomplete." : "Check your details and try again.";
      return fail(400, message, field || undefined);
    }

    const { firstName, email, devices, source, company } = parsed.data;
    const current = await stage.get();
    const status = current === "testflight" ? "invited" : "added";

    if (company) return { status: 200, body: { status } }; // a bot filled the honeypot: pretend it worked, store nothing
    if (current === "testflight" && devices.length === 0) {
      return fail(400, "Choose at least one device to test on.", "devices");
    }

    const outcome = await store.create({ firstName, email, devices, source, stage: current });
    if (outcome === "exists") {
      if (current === "testflight") await store.requestInvite(email, { firstName, devices });
      return { status: 409, body: { status: "exists" } };
    }
    return { status: 200, body: { status } };
  };
}
