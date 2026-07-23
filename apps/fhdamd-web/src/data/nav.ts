export interface NavLinkDef {
  href: string;
  label: string;
}

/**
 * Primary nav links. Deliberately code-level config, not DatoCMS content —
 * each entry maps 1:1 to a real Astro route, so a CMS-editable nav item
 * without a matching page (or vice versa) can't happen. See #264.
 */
export const NAV_LINKS: NavLinkDef[] = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/lab", label: "Lab" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
