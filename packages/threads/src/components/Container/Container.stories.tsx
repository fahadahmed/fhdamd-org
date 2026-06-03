import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";

const Box = ({ label }: { label?: string }) => (
  <div
    style={{
      background: "var(--th-color-accent-subtle)",
      border: "1px dashed var(--th-color-accent)",
      borderRadius: "var(--th-radius-sm)",
      padding: "var(--th-space-3)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.6875rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-accent-text)",
      textAlign: "center",
    }}
  >
    {label ?? "Content"}
  </div>
);

const meta = {
  title: "Threads/Layout/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["div", "main", "section", "article", "header", "footer", "nav"],
    },
  },
  args: { children: <Box /> },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default — max 1320px, responsive padding",
  render: () => (
    <div style={{ background: "var(--th-color-surface-2)", minHeight: "120px", display: "flex", alignItems: "center" }}>
      <Container>
        <Box label="Container content — max-width 1320px, padding-inline: 52px → 32px → 20px" />
      </Container>
    </div>
  ),
};

export const AsMain: Story = {
  name: "As <main>",
  render: () => (
    <Container as="main">
      <Box label="<main> element" />
    </Container>
  ),
};

export const Nested: Story = {
  name: "With nested content",
  render: () => (
    <Container>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-4)" }}>
        <Box label="Row 1" />
        <Box label="Row 2" />
        <Box label="Row 3" />
      </div>
    </Container>
  ),
};
