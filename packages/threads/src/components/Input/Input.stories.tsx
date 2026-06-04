import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Threads/Forms/Input",
  component: Input,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Full name", placeholder: "Fahad Ahmed" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story  = { args: { label: "Email address", placeholder: "fahad@fhdamd.dev", hint: "Used for sign-in and notifications.", type: "email" } };
export const WithError: Story = { args: { label: "Task title", value: "Rev", error: "Title must be at least 3 characters.", required: true } };
export const WithSuccess: Story = { args: { label: "Task title", value: "Review project proposal", success: "Looks good." } };
export const Disabled: Story  = { args: { label: "Disabled field", value: "Not editable", disabled: true } };
export const Password: Story  = { args: { label: "Password", type: "password", placeholder: "••••••••" } };
export const Required: Story  = { args: { label: "Task title", required: true, placeholder: "Enter a title" } };

export const AllStates: Story = {
  name: "All states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)", maxWidth: "480px" }}>
      <Input label="Default"  placeholder="Fahad Ahmed" />
      <Input label="With hint" placeholder="fahad@fhdamd.dev" hint="Used for sign-in." type="email" />
      <Input label="Error" value="Rev" error="Title must be at least 3 characters." required />
      <Input label="Success" value="Review project proposal" success="Looks good." />
      <Input label="Disabled" value="Not editable" disabled />
    </div>
  ),
};
