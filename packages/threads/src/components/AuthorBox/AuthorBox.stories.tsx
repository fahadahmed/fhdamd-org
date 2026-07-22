import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthorBox } from "./AuthorBox";

const meta = {
  title: "Threads/Components/AuthorBox",
  component: AuthorBox,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    initials: "FA",
    name:     "Fahad Ahmed",
    role:     "Technology Consulting Manager · Solution Architect at EY",
    bio:      "14 years across government, finance, and utilities. Builds Jamaal and Riqa on nights and weekends, and takes on a small number of consulting clients through fhdamd.dev.",
  },
} satisfies Meta<typeof AuthorBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInlineLink: Story = {
  args: {
    name: "Built by Fahad Ahmed",
    role: "Solution Architect · fhdamd.dev",
    bio: <>Designed and built end to end — brand, content model, and code. Considering something similar? <a href="#">Get a proposal</a>.</>,
  },
};
