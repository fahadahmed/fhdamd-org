import { useState } from "react";
import { Input, Select, Textarea, Button, Stack, FormSuccessPanel } from "@fhdamd/threads";
import type { SelectOption } from "../../data/contactOptions";
import { ArrowRightIcon } from "../icons/icons";

interface ContactFormProps {
  formNote: string;
  interestOptions: SelectOption[];
  timelineOptions: SelectOption[];
}

/**
 * Real submission (email/backend service) wiring is deferred until that
 * service exists — see #294. Submitting just shows FormSuccessPanel,
 * matching the source design's own client-side demo behavior.
 */
export function ContactForm({ formNote, interestOptions, timelineOptions }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <FormSuccessPanel
        title="Message sent."
        message="I'll be in touch within one business day."
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
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

        <p className="form-note">{formNote}</p>

        <Button type="submit" variant="solid-ink" icon={<ArrowRightIcon />} style={{ alignSelf: "flex-start" }}>
          Send message
        </Button>
      </Stack>
    </form>
  );
}
