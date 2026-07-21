import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagFilterBar } from "./TagFilterBar";

const meta = {
  title: "Threads/Components/TagFilterBar",
  component: TagFilterBar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    allLabel: "All posts",
    tags: [
      { value: "dev", label: "Dev" },
      { value: "product", label: "Product" },
      { value: "design", label: "Design" },
      { value: "architecture", label: "Architecture" },
    ],
  },
} satisfies Meta<typeof TagFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CaseStudiesVariant: Story = {
  args: {
    allLabel: "All case studies",
    tags: [
      { value: "website", label: "Custom websites" },
      { value: "app", label: "Apps & products" },
      { value: "advisory", label: "Architecture & advisory" },
    ],
  },
};
