import { SiteNav } from "@fhdamd/threads";

export interface HeaderProps {
  /** Where the primary call to action points. */
  ctaHref?: string;
  ctaLabel?: string;
}

/** Jamaal wordmark with the Arabic name, used in the header and footer. */
export function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span
        style={{
          fontFamily: "var(--th-font-serif)",
          fontVariationSettings: "var(--th-serif-axes)",
          fontWeight: 500,
          fontSize: "var(--th-text-xl)",
          color: "var(--th-ink)",
        }}
      >
        Jamaal
      </span>
      <span lang="ar" dir="rtl" style={{ color: "var(--th-ink-3)" }}>
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
