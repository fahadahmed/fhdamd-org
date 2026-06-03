import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster } from "./Cluster";

const Chip = ({ label }: { label: string }) => (
  <span
    style={{
      background: "var(--th-color-accent-subtle)",
      border: "1px solid var(--th-color-accent)",
      borderRadius: "var(--th-radius-pill)",
      padding: "var(--th-space-1) var(--th-space-3)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.6875rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-accent-text)",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const meta = {
  title: "Threads/Layout/Cluster",
  component: Cluster,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    gap:     { control: "select", options: [1, 2, 3, 4, 5, 6] },
    align:   { control: "select", options: ["start", "center", "end", "baseline", "stretch"] },
    justify: { control: "select", options: ["start", "center", "end", "between", "around", "evenly"] },
    wrap:    { control: "boolean" },
  },
  args: {
    gap: 3,
    align: "center",
    justify: "start",
    wrap: true,
    children: (
      <>
        <Chip label="WCAG AA" />
        <Chip label="RTL-ready" />
        <Chip label="Dark theme" />
        <Chip label="React + CSS Modules" />
        <Chip label="Vitest + Storybook" />
      </>
    ),
  },
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
  args: { justify: "center" },
};

export const SpaceBetween: Story = {
  name: "justify=between",
  args: { justify: "between" },
};

export const NoWrap: Story = {
  name: "wrap=false",
  args: { wrap: false },
};

export const UseCases: Story = {
  name: "Use cases",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-6)" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", color: "var(--th-color-text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Badge group
        </div>
        <Cluster gap={2}>
          <Chip label="WCAG AA" />
          <Chip label="RTL-ready" />
          <Chip label="Dark theme" />
        </Cluster>
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", color: "var(--th-color-text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Button group (space-between)
        </div>
        <Cluster justify="between">
          <Chip label="Cancel" />
          <Chip label="Save changes" />
        </Cluster>
      </div>
    </div>
  ),
};
