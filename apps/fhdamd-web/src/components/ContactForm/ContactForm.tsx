import { useState } from "react";
import type { FormEvent } from "react";
import { Input, Select, Textarea, Button, Stack, FormSuccessPanel } from "@fhdamd/threads";
import type { SelectOption } from "../../data/contactOptions";
import { ArrowRightIcon } from "../icons/icons";

interface ContactFormProps {
  formNote: string;
  interestOptions: SelectOption[];
  timelineOptions: SelectOption[];
}

type Status = "idle" | "submitting" | "error";

const DEFAULT_ERROR = "Failed to send message. Please try again or email me directly.";

export function ContactForm({ formNote, interestOptions, timelineOptions }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (submitted) {
    return (
      <FormSuccessPanel
        title="Message sent."
        message="I'll be in touch within one business day."
      />
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const functionUrl = import.meta.env.PUBLIC_CONTACT_FUNCTION_URL;
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      business: formData.get("business"),
      interest: formData.get("interest"),
      timeline: formData.get("timeline"),
      message: formData.get("message"),
      honeypot: formData.get("honeypot"),
    };

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch(functionUrl ?? "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSubmitted(true);
        return;
      }

      setStatus("error");
      setErrorMessage(data?.error ?? DEFAULT_ERROR);
    } catch {
      setStatus("error");
      setErrorMessage(DEFAULT_ERROR);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={5}>
        <div className="form-row">
          <Input label="Name" name="name" placeholder="Your name" autoComplete="name" required />
          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <Input label="Business name" name="business" placeholder="Your business or organisation" />

        <Select label="What are you interested in?" name="interest" defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          {interestOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select label="Ideal timeline" name="timeline" defaultValue="">
          <option value="" disabled>
            When do you want to launch?
          </option>
          {timelineOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Tell me about your project"
          name="message"
          placeholder="What does your business do, what do you need, and what's the context? The more you share, the better I can help."
          rows={5}
          required
        />

        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor="contact-honeypot">Leave this field empty</label>
          <input id="contact-honeypot" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <p className="form-note">{formNote}</p>

        {status === "error" && (
          <p role="alert" className="form-error">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          variant="solid-ink"
          icon={<ArrowRightIcon />}
          style={{ alignSelf: "flex-start" }}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
      </Stack>
    </form>
  );
}
