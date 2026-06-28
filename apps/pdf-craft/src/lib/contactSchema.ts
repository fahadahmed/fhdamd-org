import { z } from "astro:schema";

export const SUBJECT_VALUES = [
  "general",
  "billing",
  "technical",
  "feature",
  "other",
] as const;

export const SUBJECT_LABELS: Record<(typeof SUBJECT_VALUES)[number], string> = {
  general: "General enquiry",
  billing: "Billing & credits",
  technical: "Technical issue",
  feature: "Feature request",
  other: "Other",
};

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.enum(SUBJECT_VALUES),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
});

export const ContactActionSchema = ContactFormSchema.extend({
  captchaToken: z.string().min(1),
  // Lets e2e tests skip reCAPTCHA scoring, which scores headless traffic too
  // low to pass. Only honored outside production — see contact.ts.
  e2eBypassToken: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
