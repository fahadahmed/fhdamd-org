import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconDetailRow } from "./IconDetailRow";

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const meta = {
  title: "Threads/Components/IconDetailRow",
  component: IconDetailRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    icon:  <LocationIcon />,
    value: "Melbourne, VIC · Australia",
  },
} satisfies Meta<typeof IconDetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  name: "Compact (About sidebar card)",
  args: { variant: "compact" },
};

export const Labeled: Story = {
  name: "Labeled (Contact aside card)",
  args: {
    variant: "labeled",
    icon:    <EmailIcon />,
    label:   "Email",
    value:   "fahad.ahmed@me.com",
  },
};

export const CompactStack: Story = {
  name: "Compact — stacked list",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)", maxWidth: "280px" }}>
      <IconDetailRow variant="compact" icon={<LocationIcon />} value="Melbourne, VIC · Australia" />
      <IconDetailRow variant="compact" icon={<EmailIcon />} value="github.com/fahadahmed" />
    </div>
  ),
};

export const LabeledStack: Story = {
  name: "Labeled — stacked list",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)", maxWidth: "280px" }}>
      <IconDetailRow variant="labeled" icon={<EmailIcon />} label="Email" value="fahad.ahmed@me.com" />
      <IconDetailRow variant="labeled" icon={<LocationIcon />} label="Based in" value="Melbourne, VIC · Australia" />
    </div>
  ),
};
