export interface NavLinkDef {
  href: string;
  label: string;
}

/**
 * Primary nav links. Deliberately code-level config, not a content
 * collection entry — each entry maps 1:1 to a real Astro route, so an
 * editable nav item without a matching page (or vice versa) can't happen. See #264.
 */
export const NAV_LINKS: NavLinkDef[] = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  // Lab temporarily pulled from nav — content model still being refined. See #334.
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
