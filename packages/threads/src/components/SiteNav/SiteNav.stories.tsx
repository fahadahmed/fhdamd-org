import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteNav } from "./SiteNav";

const pdfCraftLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools", active: true },
  { href: "/pricing", label: "Pricing" },
];

const fhdamdLinks = [
  { href: "/", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

const meta = {
  title: "Threads/Site/SiteNav",
  component: SiteNav,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    site: { control: "radio", options: ["pdf-craft", "fhdamd"] },
  },
  args: {
    site: "pdf-craft",
    links: pdfCraftLinks,
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── PDF-Craft ───────────────────────────────────────────────────────────── */

export const PdfCraft: Story = {
  name: "PDF-Craft — links + Log in / Sign up",
  args: {
    site: "pdf-craft",
    links: pdfCraftLinks,
    ctas: [
      { href: "/signin", label: "Log in", variant: "ghost" },
      { href: "/signup", label: "Sign up", variant: "solid-ink" },
    ],
  },
};

export const PdfCraftNoLinks: Story = {
  name: "PDF-Craft — wordmark only",
  args: { site: "pdf-craft", links: [] },
};

/* ── fhdamd.dev ──────────────────────────────────────────────────────────── */

export const Fhdamd: Story = {
  name: "fhdamd.dev — geometric mark + links, no CTA",
  args: {
    site: "fhdamd",
    links: fhdamdLinks,
    ctas: [],
  },
};

/* ── Page frame preview ──────────────────────────────────────────────────── */

export const PageFrame: Story = {
  name: "In page context",
  render: () => (
    <div>
      <SiteNav
        site="pdf-craft"
        links={pdfCraftLinks}
        ctas={[
          { href: "/signin", label: "Log in", variant: "ghost" },
          { href: "/signup", label: "Sign up", variant: "solid-ink" },
        ]}
      />
      <div
        style={{
          padding: "var(--th-space-12) var(--th-space-6)",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--th-font-serif)",
          fontWeight: 300,
          fontSize: "var(--th-text-3xl)",
          color: "var(--th-color-text-3)",
          letterSpacing: "-0.02em",
        }}
      >
        Page content sits below the sticky nav.
      </div>
    </div>
  ),
};

export const BothSites: Story = {
  name: "Both site variants stacked",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-8)" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 0" }}>PDF-Craft</div>
        <SiteNav site="pdf-craft" links={pdfCraftLinks} ctas={[{ href: "/signin", label: "Log in", variant: "ghost" }, { href: "/signup", label: "Sign up", variant: "solid-ink" }]} />
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 0" }}>fhdamd.dev</div>
        <SiteNav site="fhdamd" links={fhdamdLinks} />
      </div>
    </div>
  ),
};
