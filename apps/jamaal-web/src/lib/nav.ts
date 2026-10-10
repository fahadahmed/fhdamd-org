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

/** The filled call to action in the nav: what it says depends on the stage. */
export const NAV_CTA: Record<Stage, NavLink> = {
  waitlist: { href: "/#join", label: "Join the waitlist" },
  testflight: { href: "/#join", label: "Join the beta" },
  launched: { href: "/#join", label: "Get Jamaal" },
};

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
