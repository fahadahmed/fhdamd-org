import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./Banner";

const meta = {
  title: "Threads/Feedback/Banner",
  component: Banner,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["success", "warning", "error", "info"] },
  },
  args: {
    variant: "error",
    children: "Notifications are off. Evening planning reminders won't fire.",
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story   = { args: { variant: "error",   children: "Notifications are off. Evening planning reminders won't fire." } };
export const Success: Story = { args: { variant: "success", children: "All habits complete today. Great work." } };
export const Warning: Story = { args: { variant: "warning", children: "You're running low on credits — 2 remaining." } };
export const Info: Story    = { args: { variant: "info",    children: "PDF-Craft is now live. 5 more operations coming soon." } };

export const Dismissible: Story = {
  name: "With dismiss button",
  args: {
    variant: "error",
    children: "Notifications are off. Enable in iOS Settings to restore.",
    onDismiss: () => alert("Dismissed"),
  },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)" }}>
      <Banner variant="success">All habits complete today. Great work.</Banner>
      <Banner variant="warning">You're running low on credits — 2 remaining.</Banner>
      <Banner variant="error">Notifications are off. Enable in iOS Settings to restore.</Banner>
      <Banner variant="info">PDF-Craft is now live. 5 more operations coming soon.</Banner>
    </div>
  ),
};

export const DismissibleAll: Story = {
  name: "All variants — dismissible",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)" }}>
      <Banner variant="success" onDismiss={() => {}}>All habits complete today.</Banner>
      <Banner variant="error"   onDismiss={() => {}}>Notifications are off.</Banner>
    </div>
  ),
};
