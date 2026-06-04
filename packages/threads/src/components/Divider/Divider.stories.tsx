import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta = {
  title: "Threads/Layout/Divider",
  component: Divider,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "radio", options: ["subtle", "default", "strong", "accent"] },
  },
  args: { color: "default" },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Subtle:  Story = { args: { color: "subtle" } };
export const Default: Story = { args: { color: "default" } };
export const Strong:  Story = { args: { color: "strong" } };
export const Accent:  Story = { args: { color: "accent" } };

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-2)" }}>
      {(["subtle", "default", "strong", "accent"] as const).map((color) => (
        <div key={color}>
          <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--th-color-text-3)", paddingBlock: "var(--th-space-1)" }}>
            {color}
          </div>
          <Divider color={color} />
        </div>
      ))}
    </div>
  ),
};

export const InContext: Story = {
  name: "In context — between sections",
  render: () => (
    <div style={{ fontFamily: "var(--th-font-display)", fontSize: "var(--th-text-base)" }}>
      <p style={{ color: "var(--th-color-text-2)", paddingBlock: "var(--th-space-4)" }}>
        First section of content. The divider sits between sections and respects the spacing scale.
      </p>
      <Divider />
      <p style={{ color: "var(--th-color-text-2)", paddingBlock: "var(--th-space-4)" }}>
        Second section. Accent dividers draw attention to important transitions.
      </p>
      <Divider color="accent" />
      <p style={{ color: "var(--th-color-text-2)", paddingBlock: "var(--th-space-4)" }}>
        Third section — after an accent divider.
      </p>
    </div>
  ),
};
