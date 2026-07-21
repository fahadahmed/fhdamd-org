import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogoStrip, LogoItem } from "./LogoStrip";

const meta = {
  title: "Threads/Components/LogoStrip",
  component: LogoStrip,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof LogoStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

const Mark = ({ text }: { text: string }) => (
  <svg width="70" height="28" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="4" y="30" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="700">{text}</text>
  </svg>
);

export const Default: Story = {
  render: () => (
    <LogoStrip>
      <LogoItem logo={<Mark text="EY" />} label="Ernst & Young" />
      <LogoItem logo={<Mark text="ANZ" />} label="ANZ Bank" />
      <LogoItem logo={<Mark text="ATO" />} label="Australian Tax Office" />
      <LogoItem logo={<Mark text="Spark" />} label="Spark NZ" />
    </LogoStrip>
  ),
};
