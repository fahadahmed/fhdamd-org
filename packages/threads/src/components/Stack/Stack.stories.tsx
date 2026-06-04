import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack";

const Box = ({ label, wide }: { label?: string; wide?: boolean }) => (
  <div
    style={{
      background: "var(--th-color-accent-subtle)",
      border: "1px dashed var(--th-color-accent)",
      borderRadius: "var(--th-radius-sm)",
      padding: "var(--th-space-3) var(--th-space-4)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.6875rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-accent-text)",
      width: wide ? "100%" : "auto",
    }}
  >
    {label ?? "Item"}
  </div>
);

const meta = {
  title: "Threads/Layout/Stack",
  component: Stack,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12] },
    align: { control: "radio", options: ["start", "center", "end", "stretch"] },
    as: { control: "select", options: ["div", "ul", "ol", "section", "article"] },
  },
  args: {
    gap: 4,
    align: "stretch",
    children: (
      <>
        <Box label="Item 1" wide />
        <Box label="Item 2" wide />
        <Box label="Item 3" wide />
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TightGap: Story = {
  name: "gap=2 — tight",
  args: { gap: 2 },
};

export const LooseGap: Story = {
  name: "gap=8 — loose",
  args: { gap: 8 },
};

export const AlignStart: Story = {
  name: "align=start",
  args: {
    align: "start",
    children: (
      <>
        <Box label="Short" />
        <Box label="A longer item" />
        <Box label="Short" />
      </>
    ),
  },
};

export const AllGaps: Story = {
  name: "All gap values",
  render: () => (
    <div style={{ display: "flex", gap: "var(--th-space-8)", flexWrap: "wrap", alignItems: "flex-start" }}>
      {([2, 4, 6, 8] as const).map((gap) => (
        <div key={gap}>
          <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", color: "var(--th-color-text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            gap={gap}
          </div>
          <Stack gap={gap}>
            <Box label="A" />
            <Box label="B" />
            <Box label="C" />
          </Stack>
        </div>
      ))}
    </div>
  ),
};
