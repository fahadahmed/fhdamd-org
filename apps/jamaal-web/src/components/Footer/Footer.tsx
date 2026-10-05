import { SiteFooter } from "@fhdamd/threads";
import { Wordmark } from "../Header/Header";

export interface FooterProps {
  year?: number;
}

export default function Footer({
  year = new Date().getFullYear(),
}: Readonly<FooterProps>) {
  return (
    <SiteFooter
      brand={<Wordmark />}
      tagline="A considered app by fhdamd"
      links={[
        { href: "/privacy", label: "Privacy" },
        { href: "mailto:hello@jamaal.app", label: "Contact" },
      ]}
      copyright={`© ${year} · jamaal.app`}
    />
  );
}
