import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hero } from "./Hero";
import { Button } from "../Button/Button";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const meta = {
  title: "Threads/Components/Hero",
  component: Hero,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    eyebrow:    "PDF tools that respect your time",
    heading:    "Simple PDF tools.",
    subheading: <><em>Beautifully honest</em> pricing.</>,
    body:       "Merge, protect, convert and unlock PDF documents in seconds. Buy credits once — pay only for what you use, no subscriptions, no expiry.",
    chips:      ["No subscription", "Credits never expire", "Files processed securely", "Any device"],
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PdfCraft: Story = {
  name: "PDF-Craft homepage hero",
  args: {
    actions: (
      <>
        <Button variant="solid-terra" size="lg" href="/signup" icon={<ArrowIcon />}>
          Get started free
        </Button>
        <Button variant="ghost" size="lg" href="#tools">
          See all tools
        </Button>
      </>
    ),
  },
};

export const FhdamdDev: Story = {
  name: "fhdamd.dev hero",
  args: {
    eyebrow:    "Solution architect at EY · Melbourne",
    heading:    "I architect enterprise systems by day.",
    subheading: <>I make considered apps <em>by night.</em></>,
    body:       "14 years across government, finance, and utilities. Leading digital transformation at EY — and building Jamaal, PDF-Craft, and Threads in the hours outside of it.",
    chips:      undefined,
    actions: (
      <>
        <Button variant="solid-ink" size="lg" href="#work" icon={<ArrowIcon />}>
          See the work
        </Button>
        <Button variant="ghost" size="lg" href="#contact" icon={<MailIcon />} iconPosition="start">
          Get in touch
        </Button>
      </>
    ),
  },
};

export const HeadingOnly: Story = {
  name: "Minimal — heading only",
  args: { eyebrow: undefined, subheading: undefined, body: undefined, chips: undefined, actions: undefined, heading: "Simple, honest tools." },
};
