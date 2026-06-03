import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section } from "./Section";

const Placeholder = ({ label }: { label: string }) => (
  <div
    style={{
      background: "var(--th-color-accent-subtle)",
      border: "1px dashed var(--th-color-accent)",
      borderRadius: "var(--th-radius-sm)",
      padding: "var(--th-space-4)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.6875rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-accent-text)",
      textAlign: "center",
    }}
  >
    {label}
  </div>
);

const meta = {
  title: "Threads/Layout/Section",
  component: Section,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    as:   { control: "select", options: ["section", "div", "article", "main", "header", "footer"] },
  },
  args: {
    size: "md",
    children: <Placeholder label="Section content" />,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story  = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story  = { args: { size: "lg" } };

export const AllSizes: Story = {
  name: "All sizes — stacked",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Section key={size} size={size} style={{ background: size === "sm" ? "var(--th-color-surface-1)" : size === "md" ? "var(--th-color-surface-2)" : "var(--th-color-surface-3)" }}>
          <Placeholder label={`size="${size}" — padding-block: ${size === "sm" ? "24px" : size === "md" ? "40px" : "80px"}`} />
        </Section>
      ))}
    </div>
  ),
};
