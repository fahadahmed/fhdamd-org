export interface SignupInput {
  firstName: string;
  email: string;
  /** Honeypot: a hidden field real people never fill. Sent so the backend can drop bots. */
  company?: string;
}

export type SignupErrors = Partial<Record<keyof SignupInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns the first problem, in the order the form fields appear, or null. */
export function validateSignup({ firstName, email }: SignupInput): string | null {
  if (!firstName.trim()) return "Add your first name so we know who to write to.";
  if (!EMAIL.test(email.trim())) return "That address looks incomplete.";
  return null;
}

/** "Thank you, Sam. You're on the list." (the name is optional once joined). */
export function joinedTitle(firstName: string): string {
  const name = firstName.trim();
  return `${name ? `Thank you, ${name}. ` : ""}You're on the list.`;
}

export type SignupSource = "hero" | "join";

/**
 * Sends the signup to the waitlist endpoint: /api/waitlist, a Firebase Hosting
 * rewrite to the joinWaitlist function (set PUBLIC_WAITLIST_URL to override).
 *
 * Local development has no rewrite, so without an endpoint it only pretends in
 * dev. A production build never pretends: if the request fails the person sees
 * an error instead of being told they are on a list that does not exist.
 */
export async function submitSignup(
  input: SignupInput,
  source: SignupSource,
  options: { endpoint?: string; dev?: boolean } = {
    endpoint: import.meta.env.PUBLIC_WAITLIST_URL ?? (import.meta.env.DEV ? undefined : "/api/waitlist"),
    dev: import.meta.env.DEV,
  },
): Promise<void> {
  if (!options.endpoint) {
    if (options.dev) return;
    throw new Error("Signup isn't open yet. Please try again soon.");
  }
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      email: input.email.trim(),
      company: input.company ?? "",
      source,
    }),
  });
  if (!response.ok) throw new Error("Something went wrong. Please try again.");
}
