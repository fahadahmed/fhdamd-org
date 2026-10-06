export interface SignupInput {
  firstName: string;
  email: string;
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
 * Sends the signup to the waitlist endpoint (#388).
 *
 * There is no endpoint yet. Without PUBLIC_WAITLIST_URL this refuses to pretend
 * it worked: it only resolves in local development, and rejects in a production
 * build so nobody is told they are on a list that does not exist.
 */
export async function submitSignup(
  input: SignupInput,
  source: SignupSource,
  options: { endpoint?: string; dev?: boolean } = {
    endpoint: import.meta.env.PUBLIC_WAITLIST_URL,
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
      source,
    }),
  });
  if (!response.ok) throw new Error("Something went wrong. Please try again.");
}
