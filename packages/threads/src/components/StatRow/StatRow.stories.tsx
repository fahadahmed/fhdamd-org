import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatRow } from "./StatRow";

const meta = {
  title: "Threads/Components/StatRow",
  component: StatRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    stats: [
      { number: "<3", unit: "wks", label: "Discovery to launch" },
      { number: "0", label: "Dev tickets needed to publish a new project since launch" },
      { number: "100", unit: "%", label: "Pages with OG/meta coverage" },
    ],
  },
} satisfies Meta<typeof StatRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
