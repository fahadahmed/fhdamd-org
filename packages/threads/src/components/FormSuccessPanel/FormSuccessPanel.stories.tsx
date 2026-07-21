import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormSuccessPanel } from "./FormSuccessPanel";

const meta = {
  title: "Threads/Components/FormSuccessPanel",
  component: FormSuccessPanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title:   "Message sent.",
    message: "I'll be in touch within one business day.",
  },
} satisfies Meta<typeof FormSuccessPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
