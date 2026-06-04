import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Threads/Forms/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Notes", placeholder: "Add context, links, or anything useful…" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story  = { args: { label: "Notes", hint: "Optional. Shown only in task detail view." } };
export const WithError: Story = { args: { label: "Message", error: "Message is required.", required: true } };
export const Disabled: Story  = { args: { label: "Notes", value: "Not editable", disabled: true } };

export const AllStates: Story = {
  name: "All states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)", maxWidth: "480px" }}>
      <Textarea label="Default" placeholder="Add context…" />
      <Textarea label="With hint" hint="Optional. Shown only in task detail view." />
      <Textarea label="Error" error="Message is required." required />
      <Textarea label="Disabled" value="Not editable" disabled />
    </div>
  ),
};
