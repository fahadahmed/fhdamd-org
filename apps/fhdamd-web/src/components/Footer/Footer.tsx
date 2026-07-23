import { SiteFooter } from "@fhdamd/threads";
import { BrandWordmark } from "../Brand/Brand";
import { NAV_LINKS } from "../../data/nav";

export interface FooterProps {
  copyright: string;
}

export default function Footer({ copyright }: FooterProps) {
  return (
    <SiteFooter
      brand={<BrandWordmark variant="faint" />}
      links={NAV_LINKS}
      copyright={copyright}
    />
  );
}
