export type Device = "iphone" | "ipad" | "mac";

export const DEVICES: readonly { id: Device; label: string }[] = [
  { id: "iphone", label: "iPhone" },
  { id: "ipad", label: "iPad" },
  { id: "mac", label: "Mac" },
];

export interface SignupInput {
  firstName: string;
  email: string;
  /** What they will test on. Required in the beta. */
  devices?: readonly Device[];
  /** The honeypot: real people never see or fill it. */
  company?: string;
}

export type SignupErrors = Partial<Record<keyof SignupInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns the first problem, in the order the form fields appear, or null. `needDevices` is true in the beta. */
export function validateSignup({ firstName, email, devices }: SignupInput, needDevices = false): string | null {
  if (!firstName.trim()) return "Add your first name so we know who to write to.";
  if (!EMAIL.test(email.trim())) return "That address looks incomplete.";
  if (needDevices && !devices?.length) return "Choose at least one device to test on.";
  return null;
}

export type SignupOutcome = "added" | "invited" | "exists";

/** The confirmation line. The name is optional, and "exists" never says "thank you" for a second signup. */
export function joinedTitle(firstName: string, outcome: SignupOutcome = "added"): string {
  const name = firstName.trim();
  if (outcome === "exists") return `${name ? `${name}, you're` : "You're"} already on the list.`;
  const line = outcome === "invited" ? "Your invite is on its way." : "You're on the list.";
  return `${name ? `Thank you, ${name}. ` : ""}${line}`;
}

/** What sits under the confirmation line in the hero. */
export function joinedBody(email: string, outcome: SignupOutcome): string {
  if (outcome === "invited") return "Apple sends your invite from TestFlight, usually within a few minutes.";
  if (outcome === "exists") return `No need to do anything: ${email.trim()} is already on our list.`;
  return `We'll write to ${email.trim()} once, when there's something to open.`;
}

export type SignupSource = "hero" | "join";

const GENERIC_ERROR = "Something went wrong. Please try again.";

/** A refusal the server explained (a bad address, a rate limit), with the field it is about. */
export class SignupError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "SignupError";
  }
}

/**
 * Sends the signup to /api/signup (a Hosting rewrite to the signup function).
 *
 * PUBLIC_WAITLIST_URL overrides the endpoint. With none set, a production build
 * uses /api/signup and local development pretends it worked, since there is no
 * backend behind `astro dev`.
 *
 * A 409 means the address is already on the list, which is an outcome and not
 * an error. The server's own message is shown for a bad address or a rate limit.
 */
export async function submitSignup(
  input: SignupInput,
  source: SignupSource,
  options: { endpoint?: string; dev?: boolean } = {
    endpoint: import.meta.env.PUBLIC_WAITLIST_URL || (import.meta.env.DEV ? undefined : "/api/signup"),
    dev: import.meta.env.DEV,
  },
): Promise<SignupOutcome> {
  if (!options.endpoint) {
    if (!options.dev) throw new Error("Signup isn't open yet. Please try again soon.");
    // Local development has no backend: an address containing "already" or "fail" tries those outcomes.
    if (/already/i.test(input.email)) return "exists";
    if (/fail/i.test(input.email)) throw new Error(GENERIC_ERROR);
    return input.devices?.length ? "invited" : "added";
  }
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      email: input.email.trim(),
      ...(input.devices?.length ? { devices: input.devices } : {}),
      ...(input.company ? { company: input.company } : {}),
      source,
    }),
  });
  if (response.status === 409) return "exists";
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const showable = response.status === 400 || response.status === 429;
    if (showable && typeof body.error === "string") throw new SignupError(body.error, body.field);
    throw new Error(GENERIC_ERROR);
  }
  return body.status === "invited" ? "invited" : "added";
}
