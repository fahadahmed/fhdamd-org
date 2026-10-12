import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@fhdamd/threads";
import { track } from "../../lib/analytics";
import type { FormCopy } from "../../lib/cms/models";
import { DEVICES, SignupError, joinedBody, joinedTitle, submitSignup, validateSignup } from "../../utils/signup";
import type { Device, SignupOutcome, SignupSource } from "../../utils/signup";
import styles from "./SignupForm.module.css";

export interface SignupFormProps {
  /** `hero` is left-aligned on the light ground; `join` is centred on the deep ground. */
  variant: "hero" | "join";
  /** The beta also asks which devices they will test on. */
  stage: "waitlist" | "testflight";
  source: SignupSource;
  /** The button and small print for this stage, from DatoCMS. */
  copy: FormCopy;
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

/** `?joined`, `?joined=invited` or `?joined=exists` show a confirmation so the design can be reviewed without a backend. */
function previewOutcome(): SignupOutcome | null {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("joined")) return null;
  const value = params.get("joined");
  return value === "invited" || value === "exists" ? value : "added";
}

export default function SignupForm({ variant, stage, source, copy }: Readonly<SignupFormProps>) {
  const id = useId();
  const beta = stage === "testflight";
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [devices, setDevices] = useState<Device[]>(["iphone"]);
  const [company, setCompany] = useState("");
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<SignupOutcome | null>(null);

  useEffect(() => {
    const preview = previewOutcome();
    if (preview) {
      setFirstName((n) => n || "Sam");
      setEmail((e) => e || "you@example.com");
      setDone(preview);
      return;
    }
    // One "view" per form on screen, so the funnel starts from people who saw it.
    track({ name: "signup_view" });
  }, []);

  function toggleDevice(device: Device) {
    setDevices((current) => (current.includes(device) ? current.filter((d) => d !== device) : [...current, device]));
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateSignup({ firstName, email, devices }, beta);
    if (problem) {
      const field = problem.startsWith("Add your") ? "firstName" : problem.startsWith("That address") ? "email" : "devices";
      setError({ message: problem, field });
      return;
    }
    setError(null);
    setSubmitting(true);
    track({ name: "signup_submit" });
    try {
      const outcome = await submitSignup({ firstName, email, devices: beta ? devices : undefined, company }, source);
      track({ name: "signup_result", status: outcome });
      setDone(outcome);
    } catch (e) {
      track({ name: "signup_result", status: "error" });
      setError({
        message: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        field: e instanceof SignupError ? e.field : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const rootClass = [styles.root, variant === "join" ? styles.centred : "", variant === "join" ? styles.deep : ""]
    .filter(Boolean)
    .join(" ");

  if (done) {
    return (
      <div className={rootClass} role="status" data-state="done">
        <div className={styles.joined}>
          <span className={styles.tick}>
            <TickIcon />
          </span>
          <div className={styles.joinedText}>
            <div className={styles.joinedTitle}>{joinedTitle(firstName, done)}</div>
            <div className={styles.joinedBody}>{joinedBody(email, done)}</div>
            {done === "invited" && (
              <ol className={styles.steps}>
                {copy.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    );
  }

  const errorId = `${id}-error`;
  const invalid = (field: string) => (error?.field === field ? true : undefined);
  const describedBy = (field: string) => (error?.field === field ? errorId : undefined);
  const clear = () => setError(null);

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
            clear();
          }}
          placeholder="First name"
          aria-label="First name"
          autoComplete="given-name"
          aria-invalid={invalid("firstName")}
          aria-describedby={describedBy("firstName")}
        />
        <input
          className={`${styles.input} ${styles.email}`}
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear();
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          autoComplete="email"
          aria-invalid={invalid("email")}
          aria-describedby={describedBy("email")}
        />

        {/* The honeypot: out of sight and out of the tab order. A bot that fills it is dropped on the server. */}
        <input
          className={styles.hp}
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {beta && (
          <fieldset className={styles.devices} aria-describedby={describedBy("devices")}>
            <legend className={styles.legend}>I'll test on</legend>
            {DEVICES.map((device) => (
              <label key={device.id} className={styles.chip}>
                <input
                  type="checkbox"
                  checked={devices.includes(device.id)}
                  onChange={() => toggleDevice(device.id)}
                  aria-invalid={invalid("devices")}
                />
                <span>{device.label}</span>
              </label>
            ))}
          </fieldset>
        )}

        <Button type="submit" variant="solid-terra" icon={variant === "hero" ? <ArrowIcon /> : undefined} disabled={submitting}>
          {submitting ? copy.sendingLabel : copy.submitLabel}
        </Button>
      </form>
      {error && (
        <div id={errorId} className={styles.error} role="alert">
          {error.message}
        </div>
      )}
      <div className={styles.note}>{copy.note}</div>
    </div>
  );
}
