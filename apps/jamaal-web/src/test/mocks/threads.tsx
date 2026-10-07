import type { ReactNode } from "react";

/**
 * Lightweight stand-ins for the @fhdamd/threads components jamaal-web
 * consumes. Decouples component-logic tests from the design system's CSS
 * modules, which have their own test suite in packages/threads. Extend as
 * more components gain test coverage.
 */

interface NavLinkLike {
  href: string;
  label: string;
}

export const SiteNav = ({
  brand,
  brandLabel = "Home",
  links = [],
  ctas = [],
}: {
  brand?: ReactNode;
  brandLabel?: string;
  links?: NavLinkLike[];
  ctas?: NavLinkLike[];
}) => (
  <header>
    <a href="/" aria-label={brandLabel}>
      {brand}
    </a>
    <nav>
      {links.map((l) => (
        <a key={l.href} href={l.href}>
          {l.label}
        </a>
      ))}
      {ctas.map((c) => (
        <a key={c.href} href={c.href}>
          {c.label}
        </a>
      ))}
    </nav>
  </header>
);

export const SiteFooter = ({
  brand,
  tagline,
  links = [],
  copyright,
}: {
  brand?: ReactNode;
  tagline?: string;
  links?: NavLinkLike[];
  copyright?: string;
}) => (
  <footer>
    {brand}
    {tagline && <p>{tagline}</p>}
    <ul>
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href}>{l.label}</a>
        </li>
      ))}
    </ul>
    {copyright && <p>{copyright}</p>}
  </footer>
);

export const ThemeToggle = () => <button type="button">Toggle theme</button>;

export const Container = ({ children }: { children: ReactNode }) => <div>{children}</div>;

export const Hero = ({
  eyebrow,
  heading,
  subheading,
  body,
  actions,
}: {
  eyebrow?: string;
  heading: ReactNode;
  subheading?: ReactNode;
  body?: string;
  actions?: ReactNode;
}) => (
  <section>
    {eyebrow && <div>{eyebrow}</div>}
    <h1>{heading}</h1>
    {subheading && <h2>{subheading}</h2>}
    {body && <p>{body}</p>}
    {actions}
  </section>
);

export const Button = ({
  children,
  href,
  type = "button",
  disabled,
  icon,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}) =>
  href ? (
    <a href={href}>
      {icon}
      {children}
    </a>
  ) : (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
      {icon}
    </button>
  );
