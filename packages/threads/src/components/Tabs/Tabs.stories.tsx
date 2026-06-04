import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

const pdfCraftTabs = [
  { id: "overview",    label: "Overview",    content: <p style={{ color: "var(--th-color-text-2)", fontSize: "var(--th-text-base)" }}>Overview content — files, recent operations.</p> },
  { id: "history",     label: "History",     content: <p style={{ color: "var(--th-color-text-2)", fontSize: "var(--th-text-base)" }}>Operation history — past merges, conversions, protects.</p> },
  { id: "billing",     label: "Billing",     content: <p style={{ color: "var(--th-color-text-2)", fontSize: "var(--th-text-base)" }}>Credit balance and purchase history.</p> },
];

const fhdamdTabs = [
  { id: "work",       label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "writing",    label: "Writing" },
  { id: "about",      label: "About" },
];

const meta = {
  title: "Threads/Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { items: pdfCraftTabs, defaultActiveId: "overview" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPanels: Story = {
  name: "With tab panels",
  args: { items: pdfCraftTabs, renderPanel: true },
};

export const NavOnly: Story = {
  name: "Navigation only (no panels)",
  args: { items: fhdamdTabs, renderPanel: false },
};

export const ManyTabs: Story = {
  name: "Many tabs — scrollable",
  args: {
    renderPanel: false,
    items: ["Tools", "Pricing", "History", "Billing", "Settings", "Support", "Docs"].map(
      (label) => ({ id: label.toLowerCase(), label })
    ),
  },
};
