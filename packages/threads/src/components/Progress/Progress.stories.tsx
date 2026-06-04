import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";

const meta = {
  title: "Threads/Feedback/Progress",
  component: Progress,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant:   { control: "radio", options: ["sage", "terra", "warning", "error", "ink"] },
    value:     { control: { type: "range", min: 0, max: 100 } },
    showValue: { control: "boolean" },
  },
  args: { value: 74, variant: "sage", label: "Completion rate", showValue: true },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sage:    Story = { args: { variant: "sage",    label: "Completion rate",  value: 74, showValue: true } };
export const Terra:   Story = { args: { variant: "terra",   label: "Night planning",   value: 60, showValue: true } };
export const Warning: Story = { args: { variant: "warning", label: "Day load",         value: 110, showValue: true } };
export const Error_:  Story = { name: "Error", args: { variant: "error", label: "Failing streak", value: 20, showValue: true } };
export const NoLabel: Story = { args: { variant: "sage", value: 50, showValue: false } };

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)", maxWidth: "480px" }}>
      <Progress variant="sage"    value={74}  label="Completion rate" showValue />
      <Progress variant="terra"   value={60}  label="Night planning"  showValue />
      <Progress variant="warning" value={100} label="Day load"        showValue />
      <Progress variant="error"   value={20}  label="Streak"          showValue />
      <Progress variant="ink"     value={45}  label="Onboarding"      showValue />
    </div>
  ),
};

export const Animated: Story = {
  name: "Zero to value (shows transition)",
  render: () => (
    <div style={{ maxWidth: "480px" }}>
      <Progress variant="sage" value={82} label="Processing…" showValue />
    </div>
  ),
};
