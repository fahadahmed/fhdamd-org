import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta = {
  title: "Threads/Forms/Select",
  component: Select,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Effort estimate",
    children: (
      <>
        <option value="">Select…</option>
        <option value="15">15 minutes</option>
        <option value="30">30 minutes</option>
        <option value="60">1 hour</option>
        <option value="120">2+ hours</option>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story  = { args: { label: "Frequency", hint: "How often this habit repeats." } };
export const WithError: Story = { args: { label: "Effort estimate", error: "Please select an estimate.", required: true } };
export const Disabled: Story  = { args: { label: "Effort estimate", disabled: true } };

export const AllStates: Story = {
  name: "All states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)", maxWidth: "360px" }}>
      <Select label="Default">
        <option>Select…</option><option>30 minutes</option><option>1 hour</option>
      </Select>
      <Select label="With hint" hint="How often this habit repeats.">
        <option>Daily</option><option>Weekdays</option><option>Custom</option>
      </Select>
      <Select label="Error" error="Please select an option." required>
        <option value="">Select…</option><option>Option</option>
      </Select>
      <Select label="Disabled" disabled>
        <option>Select…</option>
      </Select>
    </div>
  ),
};
