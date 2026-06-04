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
    site: { control: "radio", options: ["pdf-craft", "fhdamd"] },
  },
  args: {
    site: "pdf-craft",
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

/* ── PDF-Craft — column layout ───────────────────────────────────────────── */

export const PdfCraft: Story = {
  name: "PDF-Craft — column layout",
  args: {
    site:       "pdf-craft",
    tagline:    "Simple tools. Honest pricing.",
    columns:    pdfCraftColumns,
    bottomRight: "Built on the Threads design system",
  },
};

export const PdfCraftCustomCopyright: Story = {
  name: "PDF-Craft — custom copyright",
  args: {
    site:      "pdf-craft",
    tagline:   "Simple tools. Honest pricing.",
    columns:   pdfCraftColumns,
    copyright: "© 2026 PDF-Craft. All rights reserved.",
  },
};

/* ── Both sites ──────────────────────────────────────────────────────────── */

export const BothSites: Story = {
  name: "Both site footers",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", padding: "8px 24px", background: "var(--th-color-bg)" }}>PDF-Craft (column layout)</div>
        <SiteFooter
          site="pdf-craft"
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
