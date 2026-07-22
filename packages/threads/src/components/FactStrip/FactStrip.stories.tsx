import type { Meta, StoryObj } from "@storybook/react-vite";
import { FactStrip } from "./FactStrip";

const meta = {
  title: "Threads/Components/FactStrip",
  component: FactStrip,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    facts: [
      { label: "Client", value: "RZest Engineers" },
      { label: "Industry", value: "Structural engineering" },
      { label: "Timeline", value: "Under 3 weeks" },
      { label: "Offering", value: "Custom website" },
      { label: "Stack", value: "Astro · DatoCMS" },
    ],
  },
} satisfies Meta<typeof FactStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
