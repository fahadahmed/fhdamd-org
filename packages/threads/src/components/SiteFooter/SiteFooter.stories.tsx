import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "./SiteFooter";

const fhdamdLinks = [
  { href: "/", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

const pdfCraftColumns = [
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

const meta = {
  title: "Threads/Site/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    site: { control: "radio", options: ["riqa", "fhdamd"] },
  },
  args: {
    site: "riqa",
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── fhdamd.dev — simple layout ──────────────────────────────────────────── */

export const Fhdamd: Story = {
  name: "fhdamd.dev — simple layout",
  args: {
    site:  "fhdamd",
    links: fhdamdLinks,
  },
};

export const FhdamdMinimal: Story = {
  name: "fhdamd.dev — wordmark + copyright only",
  args: { site: "fhdamd", links: [] },
};

/* ── Riqa — column layout ───────────────────────────────────────────── */

export const Riqa: Story = {
  name: "Riqa — column layout",
  args: {
    site:       "riqa",
    tagline:    "Simple tools. Honest pricing.",
    columns:    pdfCraftColumns,
    bottomRight: "Built on the Threads design system",
  },
};

export const RiqaCustomCopyright: Story = {
  name: "Riqa — custom copyright",
  args: {
    site:      "riqa",
    tagline:   "Simple tools. Honest pricing.",
    columns:   pdfCraftColumns,
    copyright: "© 2026 Riqa. All rights reserved.",
  },
};

/* ── Both sites ──────────────────────────────────────────────────────────── */

export const BothSites: Story = {
  name: "Both site footers",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 24px", background: "var(--th-color-bg)" }}>Riqa (column layout)</div>
        <SiteFooter
          site="riqa"
          tagline="Simple tools. Honest pricing."
          columns={pdfCraftColumns}
          bottomRight="Built on the Threads design system"
        />
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 24px", background: "var(--th-color-bg)" }}>fhdamd.dev (simple layout)</div>
        <SiteFooter site="fhdamd" links={fhdamdLinks} />
      </div>
    </div>
  ),
};
