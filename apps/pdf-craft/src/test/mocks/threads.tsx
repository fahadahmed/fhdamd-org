import { useState } from "react";

export const Container = ({ children }: any) => <div>{children}</div>;
export const Stack = ({ children, as: As = "div" }: any) => <As>{children}</As>;
export const AutoGrid = ({ children }: any) => <div>{children}</div>;
export const Card = ({ children }: any) => <div>{children}</div>;
export const CardTitle = ({ children }: any) => <div>{children}</div>;
export const CardBody = ({ children }: any) => <div>{children}</div>;
export const Divider = () => <hr />;
export const Section = ({ children }: any) => <section>{children}</section>;
export const SectionHeader = ({ children }: any) => <div>{children}</div>;
export const Hero = ({ children }: any) => <div>{children}</div>;
export const DarkStrip = ({ children }: any) => <div>{children}</div>;

export const Text = ({ children, as: As = "span" }: any) => <As>{children}</As>;

export const Badge = ({ children, variant }: any) => (
  <span data-variant={variant}>{children}</span>
);

export const Callout = ({ children, variant, title }: any) => (
  <div role="alert" data-variant={variant}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

export const Button = ({
  children,
  href,
  type = "button",
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: any) =>
  href ? (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );

export const Input = ({
  type,
  name,
  id,
  label,
  value,
  onChange,
  required,
  hint,
  autoComplete,
}: any) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
    />
    {hint && <span>{hint}</span>}
  </div>
);

export const FileDropzone = ({ label, accept, multiple, onFiles }: any) => (
  <div>
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      data-testid="file-input"
      aria-label={label}
      onChange={(e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length) onFiles(files);
      }}
    />
  </div>
);

export const Radio = ({ name, value, checked, onChange }: any) => (
  <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
);

export const OpCard = ({ name, description, credits, href, ctaLabel, iconVariant, status }: any) => (
  <div data-status={status} data-icon-variant={iconVariant}>
    <span>{name}</span>
    <span>{description}</span>
    <span>{credits}</span>
    {href ? <a href={href}>{ctaLabel}</a> : <span>{ctaLabel}</span>}
  </div>
);

export const DataTable = ({ columns, rows, rowKey, emptyState }: any) => {
  if (!rows || rows.length === 0) return <div>{emptyState}</div>;
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row[rowKey]}>
            {columns.map((col: any) => (
              <td key={col.key}>{col.render ? col.render(row) : String(row[col.key] ?? "")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const PriceCard = ({ credits, price, priceNote, featured, cta, onCtaClick }: any) => (
  <div data-featured={String(featured)}>
    <span>{credits} credits</span>
    <span>{price}</span>
    {priceNote && <span>{priceNote}</span>}
    {cta?.href ? (
      <a href={cta.href}>{cta.label}</a>
    ) : (
      <button onClick={onCtaClick}>{cta?.label}</button>
    )}
  </div>
);

export const SiteNav = ({ links, ctas }: any) => (
  <nav>
    {links?.map((l: any) => (
      <a key={l.href} href={l.href}>{l.label}</a>
    ))}
    {ctas?.map((c: any) =>
      c.href ? (
        <a key={c.label} href={c.href}>{c.label}</a>
      ) : (
        <button key={c.label} onClick={c.onClick}>{c.label}</button>
      ),
    )}
  </nav>
);

export const SiteFooter = ({ tagline, columns, bottomRight }: any) => (
  <footer>
    {tagline && <p>{tagline}</p>}
    {columns?.map((col: any) => (
      <div key={col.title}>
        <h3>{col.title}</h3>
        {col.links?.map((l: any) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </div>
    ))}
    {bottomRight && <span>{bottomRight}</span>}
  </footer>
);

export const Tabs = ({ items, defaultActiveId, ariaLabel }: any) => {
  const [active, setActive] = useState(defaultActiveId);
  return (
    <div aria-label={ariaLabel}>
      {items.map((item: any) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          onClick={() => setActive(item.id)}
        >
          {item.label}
        </button>
      ))}
      {items.map((item: any) => (
        <div key={`content-${item.id}`} hidden={active !== item.id}>
          {item.content}
        </div>
      ))}
    </div>
  );
};
