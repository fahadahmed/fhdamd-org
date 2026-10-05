import { SiteNav } from "@fhdamd/threads";

export interface HeaderProps {
  /** Where the primary call to action points. */
  ctaHref?: string;
  ctaLabel?: string;
}

export interface WordmarkProps {
  /** Set when the wordmark sits on the dark `deep` ground (the footer). The
   *  default ink colours are dark and would disappear there. */
  onDeep?: boolean;
}

/** Jamaal wordmark with the Arabic name, used in the header and footer. */
export function Wordmark({ onDeep = false }: Readonly<WordmarkProps>) {
  return (
    <span
      data-tone={onDeep ? "on-deep" : "default"}
      style={{ display: "inline-flex", alignItems: "baseline", gap: "0.5rem" }}
    >
      <span
        style={{
          fontFamily: "var(--th-font-serif)",
          fontVariationSettings: "var(--th-serif-axes)",
          fontWeight: 500,
          fontSize: "var(--th-text-xl)",
          color: onDeep ? "var(--th-on-deep)" : "var(--th-ink)",
        }}
      >
        Jamaal
      </span>
      <span
        lang="ar"
        dir="rtl"
        style={{ color: onDeep ? "var(--th-on-deep-2)" : "var(--th-ink-3)" }}
      >
        جمال
      </span>
    </span>
  );
}

export default function Header({
  ctaHref = "#join",
  ctaLabel = "Join the list",
}: Readonly<HeaderProps>) {
  return (
    <SiteNav
      brand={<Wordmark />}
      brandLabel="Jamaal home"
      ctas={[{ href: ctaHref, label: ctaLabel, variant: "solid-terra" }]}
    />
  );
}
