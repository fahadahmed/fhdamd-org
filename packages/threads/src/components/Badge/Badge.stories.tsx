import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";
import { Tag } from "./Tag";

const meta = {
  title: "Threads/Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["terra", "sage", "warning", "error", "info", "neutral", "inverse"],
    },
    dot: { control: "boolean" },
  },
  args: {
    variant: "neutral",
    children: "Label",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual variants ─────────────────────────────────────────────────── */

export const Terra: Story   = { args: { variant: "terra",   children: "Priority" } };
export const Sage: Story    = { args: { variant: "sage",    children: "Done" } };
export const Warning: Story = { args: { variant: "warning", children: "Overloaded" } };
export const Error: Story   = { args: { variant: "error",   children: "Slipping" } };
export const Info: Story    = { args: { variant: "info",    children: "In progress" } };
export const Neutral: Story = { args: { variant: "neutral", children: "Coming soon" } };
export const Inverse: Story = { args: { variant: "inverse", children: "New" } };

/* ── With dot indicator ──────────────────────────────────────────────────── */

export const WithDot: Story = {
  name: "With dot indicator",
  args: { variant: "terra", dot: true, children: "Start here" },
};

export const DotVariants: Story = {
  name: "Dot — all variants",
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {(["terra", "sage", "warning", "error", "info", "neutral"] as const).map((v) => (
        <Badge key={v} variant={v} dot>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

/* ── All variants ────────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Badge variant="terra">Priority</Badge>
      <Badge variant="sage">Done</Badge>
      <Badge variant="warning">Overloaded</Badge>
      <Badge variant="error">Slipping</Badge>
      <Badge variant="info">In progress</Badge>
      <Badge variant="neutral">Coming soon</Badge>
      <Badge variant="inverse">New</Badge>
    </div>
  ),
};

/* ── Real-world usage ────────────────────────────────────────────────────── */

export const UseCases: Story = {
  name: "Use cases",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)", fontFamily: "var(--th-font-display)", fontSize: "var(--th-text-base)" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          PDF-Craft operations
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge variant="sage">Live</Badge>
          <Badge variant="neutral">Coming soon</Badge>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          Jamaal habit streaks
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge variant="sage" dot>9 day streak</Badge>
          <Badge variant="terra" dot>Slipping</Badge>
          <Badge variant="warning">Overloaded</Badge>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          System status
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge variant="error">Notifications off</Badge>
          <Badge variant="info">Update available</Badge>
        </div>
      </div>
    </div>
  ),
};

/* ── Tag ─────────────────────────────────────────────────────────────────── */

export const TagDefault: Story = {
  name: "Tag",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-4)" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          Technology tags
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Tag>SwiftUI</Tag>
          <Tag>React</Tag>
          <Tag>Astro</Tag>
          <Tag>Firebase</Tag>
          <Tag>TypeScript</Tag>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          Operation category tags
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Tag>Convert</Tag>
          <Tag>Security</Tag>
          <Tag>Edit</Tag>
          <Tag>AI</Tag>
          <Tag>2 credits</Tag>
        </div>
      </div>
    </div>
  ),
};

/* ── Badge vs Tag ────────────────────────────────────────────────────────── */

export const BadgeVsTag: Story = {
  name: "Badge vs Tag — when to use each",
  render: () => (
    <div style={{ display: "flex", gap: "var(--th-space-8)", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          Badge — status &amp; priority
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Badge variant="sage" dot>Complete</Badge>
          <Badge variant="terra" dot>Start here</Badge>
          <Badge variant="neutral">Coming soon</Badge>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-4)", marginBottom: "8px" }}>
          Tag — metadata &amp; categories
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Tag>30 min</Tag>
          <Tag>Security</Tag>
          <Tag>4 credits</Tag>
        </div>
      </div>
    </div>
  ),
};
