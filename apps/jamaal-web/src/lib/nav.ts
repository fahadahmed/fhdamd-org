import type { Stage } from "../data/stage";

export interface NavLink {
  href: string;
  label: string;
}

export interface Features {
  readonly journal: boolean;
  readonly pressKit: boolean;
}

/** Section links use "/#id" so they work from any page, not just the home page. */
export function navLinks(features: Features): NavLink[] {
  return [
    { href: "/#day", label: "A day" },
    { href: "/#everywhere", label: "Everywhere" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
    ...(features.journal ? [{ href: "/journal", label: "Journal" }] : []),
  ];
}

/** The filled call to action in the nav always goes to the join section; its words (per stage) come from the site settings. */
export const NAV_CTA_HREF = "/#join";

export function navCta(buttons: Record<Stage, string>, stage: Stage): NavLink {
  return { href: NAV_CTA_HREF, label: buttons[stage] };
}

export function footerLinks(features: Features, contactEmail: string): NavLink[] {
  return [
    ...(features.journal ? [{ href: "/journal", label: "Journal" }] : []),
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/support", label: "Support" },
    ...(features.pressKit ? [{ href: "/press", label: "Press kit" }] : []),
    { href: `mailto:${contactEmail}`, label: "Contact" },
    { href: "https://fhdamd.dev", label: "fhdamd.dev" },
  ];
}
