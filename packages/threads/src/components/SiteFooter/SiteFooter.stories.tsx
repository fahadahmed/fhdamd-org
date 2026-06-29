import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "./SiteFooter";

const simpleLinks = [
  { href: "/", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

const columns = [
  {
    title: "Tools",
    links: [
      { href: "/mergepdf",   label: "Merge PDFs" },
      { href: "/imagetopdf", label: "Image to PDF" },
      { href: "/encryptpdf", label: "Protect PDF" },
      { href: "/decryptpdf", label: "Unlock PDF" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup",  label: "Sign up" },
      { href: "/signin",  label: "Log in" },
      { href: "#pricing", label: "Buy credits" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms",   label: "Terms & Conditions" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

/** Example wordmark — in real usage, each app supplies its own brand markup. */
const ExampleWordmark = () => (
  <span style={{ fontFamily: "var(--th-font-serif)", fontWeight: 300, fontStyle: "italic", fontSize: "var(--th-text-lg)", color: "var(--th-color-text-inverse)" }}>
    Acme<em style={{ fontStyle: "normal", color: "var(--th-color-accent-text)" }}>.</em>
  </span>
);

const meta = {
  title: "Threads/Site/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    brand: <ExampleWordmark />,
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Simple layout ───────────────────────────────────────────────────────── */

export const Simple: Story = {
  name: "Simple layout, with links",
  args: {
    links: simpleLinks,
  },
};

export const SimpleMinimal: Story = {
  name: "Simple layout — wordmark only",
  args: { links: [] },
};

/* ── Column layout ───────────────────────────────────────────────────────── */

export const Columns: Story = {
  name: "Column layout",
  args: {
    tagline:     "Simple tools. Honest pricing.",
    columns,
    bottomRight: "Built on the Threads design system",
  },
};

export const ColumnsWithCopyright: Story = {
  name: "Column layout — custom copyright",
  args: {
    tagline:   "Simple tools. Honest pricing.",
    columns,
    copyright: "© 2026 Acme. All rights reserved.",
  },
};

/* ── Both layouts ────────────────────────────────────────────────────────── */

export const BothLayouts: Story = {
  name: "Both layouts stacked",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 24px", background: "var(--th-color-bg)" }}>Column layout</div>
        <SiteFooter
          brand={<ExampleWordmark />}
          tagline="Simple tools. Honest pricing."
          columns={columns}
          bottomRight="Built on the Threads design system"
        />
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 24px", background: "var(--th-color-bg)" }}>Simple layout</div>
        <SiteFooter brand={<ExampleWordmark />} links={simpleLinks} />
      </div>
    </div>
  ),
};
