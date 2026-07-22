import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableOfContents } from "./TableOfContents";

const meta = {
  title: "Threads/Components/TableOfContents",
  component: TableOfContents,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    items: [
      { id: "problem", label: "The problem with docs" },
      { id: "approach", label: "Diagrams as code" },
      { id: "example", label: "A worked example" },
      { id: "pitfalls", label: "Where this breaks down" },
      { id: "takeaways", label: "Takeaways" },
    ],
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
