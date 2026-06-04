import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Threads/Forms/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Evening planning reminder" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story   = { args: { defaultChecked: true } };
export const Disabled: Story  = { args: { disabled: true, label: "Habit reminders (disabled)" } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true, label: "Locked setting" } };

export const Group: Story = {
  name: "Checkbox group",
  render: () => (
    <fieldset style={{ border: "none", padding: 0 }}>
      <legend style={{ fontFamily: "var(--th-font-display)", fontVariationSettings: '"wdth" 92, "wght" 550', fontSize: "var(--th-text-base)", marginBottom: "var(--th-space-2)" }}>
        Notification types
      </legend>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Checkbox label="Evening planning reminder" defaultChecked />
        <Checkbox label="Morning nudge" defaultChecked />
        <Checkbox label="During-day guidance" />
        <Checkbox label="Habit reminders" disabled />
      </div>
    </fieldset>
  ),
};
