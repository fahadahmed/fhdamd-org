import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@fhdamd/threads";
import { joinedTitle, submitSignup, validateSignup } from "../../utils/signup";
import type { SignupSource } from "../../utils/signup";
import styles from "./WaitlistForm.module.css";

export interface WaitlistFormProps {
  /** `hero` is left-aligned with a note below; `join` is centred in the closing section. */
  variant: "hero" | "join";
  source: SignupSource;
  submitLabel: string;
  /** Small print under the form (hero only). */
  note?: string;
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const TickIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function WaitlistForm({ variant, source, submitLabel, note }: Readonly<WaitlistFormProps>) {
  const id = useId();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  // `?joined` shows the confirmation state, so the design can be reviewed
  // without a working backend.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("joined")) {
      setFirstName((n) => n || "Sam");
      setEmail((e) => e || "you@example.com");
      setJoined(true);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateSignup({ firstName, email });
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitSignup({ firstName, email, company }, source);
      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const rootClass = [styles.root, variant === "join" ? styles.centred : ""].filter(Boolean).join(" ");

  if (joined) {
    return (
      <div className={rootClass} role="status" data-state="joined">
        <div className={styles.joined}>
          {variant === "hero" && (
            <span className={styles.tick}>
              <TickIcon />
            </span>
          )}
          <div className={styles.joinedText}>
            <div className={styles.joinedTitle}>{joinedTitle(firstName)}</div>
            {variant === "hero" && (
              <div className={styles.joinedBody}>We'll write to {email} once, when there's something to open.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const errorId = `${id}-error`;
  return (
    <div className={rootClass}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <input
          className={`${styles.input} ${styles.name}`}
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            setError("");
          }}
          placeholder="First name"
          aria-label="First name"
          autoComplete="given-name"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <input
          className={`${styles.input} ${styles.email}`}
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
        <input
          className={styles.trap}
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <Button type="submit" variant="solid-terra" icon={variant === "hero" ? <ArrowIcon /> : undefined} disabled={submitting}>
          {submitLabel}
        </Button>
      </form>
      {error && (
        <div id={errorId} className={styles.error} role="alert">
          {error}
        </div>
      )}
      {note && <div className={styles.note}>{note}</div>}
    </div>
  );
}
