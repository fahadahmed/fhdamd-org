import type { Meta, StoryObj } from "@storybook/react-vite";
import { DarkStrip } from "./DarkStrip";
import { Button } from "../Button/Button";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const meta = {
  title: "Threads/Components/DarkStrip",
  component: DarkStrip,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    align: { control: "radio", options: ["center", "start"] },
  },
  args: {
    eyebrow: "Ready to get started",
    heading: <>No subscription.<br />Just <em>results</em>.</>,
    body:    "Create a free account and process your first PDF in under a minute.",
    align:   "center",
  },
} satisfies Meta<typeof DarkStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {
  name: "Centered CTA — Riqa",
  args: {
    actions: (
      <Button variant="solid-terra" size="lg" href="/signup" icon={<ArrowIcon />}>
        Get started — it's free
      </Button>
    ),
  },
};

export const LeftAligned: Story = {
  name: "Left-aligned — with two actions",
  args: {
    align:   "start",
    eyebrow: "Summarise any PDF",
    heading: <>In seconds. <em>Powered by AI.</em></>,
    body:    "Simple summary or detailed analysis — credits only deducted on completion.",
    actions: (
      <>
        <Button variant="solid-terra" size="lg" href="/signup">Get started</Button>
        <Button variant="ghost" size="lg" href="#pricing" style={{ color: "var(--th-color-text-inverse-2)", borderColor: "rgba(240,237,230,0.22)" }}>See pricing</Button>
      </>
    ),
  },
};

export const NoActions: Story = {
  name: "No actions — announcement",
  args: { actions: undefined },
};
