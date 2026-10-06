import { Button, SiteNav } from "@fhdamd/threads";
import { LAUNCHED } from "../../data/site";
import styles from "./Header.module.css";

export interface WordmarkProps {
  /** Set when the wordmark sits on the dark `deep` ground (the footer). The
   *  default ink colours are dark and would disappear there. */
  onDeep?: boolean;
}

/** App icon, "Jamaal" and the Arabic name, used in the header and footer. */
export function Wordmark({ onDeep = false }: Readonly<WordmarkProps>) {
  return (
    <span
      data-tone={onDeep ? "on-deep" : "default"}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--th-space-tight)" }}
    >
      <img
        src="/icon-small.svg"
        alt=""
        width={32}
        height={32}
        style={{ display: "block", borderRadius: "var(--th-radius-field)" }}
      />
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: "var(--th-space-2)" }}>
        <span
          style={{
            fontFamily: "var(--th-font-serif)",
            fontVariationSettings: "var(--th-serif-axes)",
            fontWeight: 500,
            fontSize: "var(--th-text-xl)",
            lineHeight: 1,
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
    </span>
  );
}

export interface HeaderProps {
  /** Defaults to the site-wide flag. */
  launched?: boolean;
}

export default function Header({ launched = LAUNCHED }: Readonly<HeaderProps>) {
  if (!launched) {
    return (
      <header className={styles.bar}>
        <div className={styles.inner}>
          <a className={styles.brand} href="/" aria-label="Jamaal home">
            <Wordmark />
          </a>
          <Button href="#join" variant="ghost" size="sm">
            Join the list
          </Button>
        </div>
      </header>
    );
  }

  return (
    <SiteNav
      brand={<Wordmark />}
      brandLabel="Jamaal home"
      links={[
        { href: "#pricing", label: "Pricing" },
        { href: "/support", label: "Support" },
        { href: "/journal", label: "Journal" },
      ]}
      ctas={[{ href: "#download", label: "Download", variant: "ghost" }]}
    />
  );
}
