export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Contact form select options. Deliberately code-level config, not DatoCMS
 * content — these are structural form choices, not editorial copy. See #264.
 */
export const INTEREST_OPTIONS: SelectOption[] = [
  { value: "website", label: "Custom website — brochure, content, or commerce" },
  { value: "app", label: "App or product build" },
  { value: "advisory", label: "Architecture & advisory" },
  { value: "retainer", label: "Ongoing retainer" },
  { value: "migration", label: "Migration from WordPress / Shopify" },
  { value: "strategic", label: "Strategic discovery session" },
  { value: "unsure", label: "Not sure yet — let's talk" },
  { value: "other", label: "Something else" },
];

export const TIMELINE_OPTIONS: SelectOption[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3", label: "1–3 months" },
  { value: "3-6", label: "3–6 months" },
  { value: "flexible", label: "Flexible — no hard deadline" },
];
