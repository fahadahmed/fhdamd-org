import { SiteFooter } from "@fhdamd/threads";
import { COMPANY_TAGLINE, CONTACT_EMAIL, LAUNCHED } from "../../data/site";
import { Wordmark } from "../Header/Header";

export interface FooterProps {
  /** Defaults to the site-wide flag. */
  launched?: boolean;
}

export default function Footer({ launched = LAUNCHED }: Readonly<FooterProps>) {
  const links = [
    // Journal and Press kit return when those pages exist.
    ...(launched ? [{ href: "/support", label: "Support" }] : []),
    { href: "/privacy", label: "Privacy" },
    ...(launched ? [{ href: "/terms", label: "Terms" }] : []),
    { href: `mailto:${CONTACT_EMAIL}`, label: "Contact" },
  ];

  // The simple SiteFooter layout renders `copyright` (a mono label) but not
  // `tagline`, so the company line goes there.
  return <SiteFooter brand={<Wordmark onDeep />} links={links} copyright={COMPANY_TAGLINE} />;
}
