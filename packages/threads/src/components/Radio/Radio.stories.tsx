import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Threads/Forms/Radio",
  component: Radio,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Too much on", name: "defer" },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story   = { args: { defaultChecked: true } };
export const Disabled: Story  = { args: { disabled: true, label: "Unavailable option" } };

export const Group: Story = {
  name: "Radio group",
  render: () => (
    <fieldset style={{ border: "none", padding: 0 }}>
      <legend style={{ fontFamily: "var(--th-font-display)", fontVariationSettings: '"wdth" 92, "wght" 550', fontSize: "var(--th-text-base)", marginBottom: "var(--th-space-2)" }}>
        Deferral reason
      </legend>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Radio name="defer" label="Too much on" defaultChecked />
        <Radio name="defer" label="Not ready" />
        <Radio name="defer" label="No longer relevant" />
        <Radio name="defer" label="Reschedule" />
      </div>
    </fieldset>
  ),
};
