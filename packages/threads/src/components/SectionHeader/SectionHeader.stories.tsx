import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHeader } from "./SectionHeader";

const meta = {
  title: "Threads/Components/SectionHeader",
  component: SectionHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    eyebrow: "PDF operations",
    title:   <>Everything your <em>documents</em> need</>,
    intro:   "Four tools live now. Split, compress, sign and AI-powered summaries are all coming soon.",
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAll: Story   = { name: "Eyebrow + title + intro" };
export const TitleOnly: Story = { name: "Title only", args: { eyebrow: undefined, intro: undefined } };
export const NoIntro: Story   = { name: "Eyebrow + title", args: { intro: undefined } };

export const PdfCraftSections: Story = {
  name: "PDF-Craft — all section headers",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-12)" }}>
      <SectionHeader eyebrow="PDF operations"  title={<>Everything your <em>documents</em> need</>}        intro="Four tools live now. Split, compress, sign and AI-powered summaries are all coming soon." />
      <SectionHeader eyebrow="How it works"    title={<>Up and running <em>in three steps</em></>} />
      <SectionHeader eyebrow="Pricing"         title={<>Simple, <em>honest</em> credits</>}                intro="Buy once, use anytime. No monthly fees. No usage caps. Credits never expire." />
      <SectionHeader eyebrow="What people say" title={<>Trusted by people who value their <em>time</em></>} />
      <SectionHeader eyebrow="FAQ"             title={<>Frequently asked <em>questions</em></>} />
    </div>
  ),
};
