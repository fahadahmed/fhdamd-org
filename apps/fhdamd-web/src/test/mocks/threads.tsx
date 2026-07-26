import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Lightweight stand-ins for the @fhdamd/threads components fhdamd-web
 * actually consumes, matching pdf-craft's own vitest setup — decouples
 * component-logic tests from the real design system's CSS modules and
 * internal behavior, which has its own test suite in packages/threads.
 * Only covers what's imported by currently-tested components; extend as
 * more components gain test coverage.
 */

export type BadgeVariant =
  | "terra"
  | "sage"
  | "neutral"
  | "warning"
  | "error"
  | "info"
  | "inverse";

export const Stack = ({ children, as: As = "div" }: any) => <As>{children}</As>;
export const Cluster = ({ children, as: As = "div" }: any) => (
  <As>{children}</As>
);

export const Grid = ({ children, as: As = "div" }: any) => <As>{children}</As>;

export const Badge = ({ children, variant }: any) => (
  <span data-variant={variant}>{children}</span>
);
export const Tag = ({ children }: any) => <span>{children}</span>;

export const Button = ({
  children,
  href,
  type = "button",
  onClick,
  disabled,
  icon,
}: any) =>
  href ? (
    <a href={href}>
      {children}
      {icon}
    </a>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
      {icon}
    </button>
  );

export const ContentCard = ({
  badges = [],
  title,
  description,
  date,
  href,
  comingSoon,
}: any) => {
  const Wrapper = comingSoon || !href ? "div" : "a";
  return (
    <Wrapper
      href={comingSoon ? undefined : href}
      data-coming-soon={comingSoon || undefined}
    >
      {badges.map((b: any) => (
        <span key={b.label} data-variant={b.variant}>
          {b.label}
        </span>
      ))}
      <div>{title}</div>
      {description && <p>{description}</p>}
      <span>{date}</span>
    </Wrapper>
  );
};

export const TagFilterBar = ({ tags, allLabel = "All", onChange }: any) => (
  <div>
    <button type="button" onClick={() => onChange?.("all")}>
      {allLabel}
    </button>
    {tags.map((tag: any) => (
      <button
        key={tag.value}
        type="button"
        onClick={() => onChange?.(tag.value)}
      >
        {tag.label}
      </button>
    ))}
  </div>
);

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  [key: string]: any;
}

export const Input = ({
  label,
  hint,
  error,
  id: providedId,
  ...rest
}: FieldProps) => {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...rest} />
      {hint && !error && <span>{hint}</span>}
      {error && <span role="alert">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  hint,
  error,
  id: providedId,
  children,
  ...rest
}: FieldProps & { children: ReactNode }) => {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} {...rest}>
        {children}
      </select>
      {hint && !error && <span>{hint}</span>}
      {error && <span role="alert">{error}</span>}
    </div>
  );
};

export const Textarea = ({
  label,
  hint,
  error,
  id: providedId,
  ...rest
}: FieldProps) => {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <textarea id={id} {...rest} />
      {hint && !error && <span>{hint}</span>}
      {error && <span role="alert">{error}</span>}
    </div>
  );
};

export const FormSuccessPanel = ({ title, message }: any) => (
  <div role="status">
    <div>{title}</div>
    <div>{message}</div>
  </div>
);

export const SiteFooter = ({ brand, links = [], copyright }: any) => (
  <footer>
    <div>{brand}</div>
    <nav aria-label="Footer navigation">
      <ul>
        {links.map((link: any) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
    {copyright && <p>{copyright}</p>}
  </footer>
);

export const ReadingProgressBar = ({ targetRef }: any) => (
  <div
    data-testid="reading-progress-bar"
    data-has-target={targetRef?.current != null}
  />
);

export const SiteNav = ({ brand, links = [], ctas = [] }: any) => (
  <nav>
    {brand}
    <ul>
      {links.map((link: any) => (
        <li key={link.href}>
          <a href={link.href} aria-current={link.active ? "page" : undefined}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
    {ctas.map((cta: any) => (
      <button key={cta.label} type="button" onClick={cta.onClick}>
        {cta.label}
      </button>
    ))}
  </nav>
);
