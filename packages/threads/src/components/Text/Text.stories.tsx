import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";

const meta = {
  title: "Threads/Atoms/Text",
  component: Text,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    as:     { control: "select", options: ["p", "span", "div", "h1", "h2", "h3", "h4", "label", "strong"] },
    size:   { control: "select", options: ["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] },
    family: { control: "radio",  options: ["display", "serif", "mono"] },
    color:  { control: "select", options: ["1", "2", "3", "4", "inverse", "accent", "sage-text"] },
    align:  { control: "radio",  options: ["start", "center", "end"] },
  },
  args: { children: "The quick brown fox jumps over the lazy dog.", size: "base", family: "display", color: "2" },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Display scale ───────────────────────────────────────────────────────── */
export const DisplayScale: Story = {
  name: "Display — all sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-4)" }}>
      {(["5xl", "4xl", "3xl", "2xl", "xl", "lg", "md", "base", "sm", "xs"] as const).map((s) => (
        <Text key={s} as="p" size={s} family="display" weight={400} color="1">{s} — The quick brown fox</Text>
      ))}
    </div>
  ),
};

/* ── Serif specimens ─────────────────────────────────────────────────────── */
export const SerifSpecimens: Story = {
  name: "Serif — heading specimens",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-5)" }}>
      <Text as="h1" size="5xl" family="serif" color="1">I architect enterprise systems by day.</Text>
      <Text as="h2" size="5xl" family="serif" color="3" italic>I make considered apps <em style={{ fontStyle: "normal" }}>by night.</em></Text>
      <Text as="h2" size="3xl" family="serif" color="1">Simple PDF tools.</Text>
      <Text as="h2" size="3xl" family="serif" color="3" italic>Beautifully honest pricing.</Text>
    </div>
  ),
};

/* ── Mono ────────────────────────────────────────────────────────────────── */
export const MonoSpecimens: Story = {
  name: "Mono — label & metadata",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)" }}>
      <Text as="span" size="sm" family="mono" color="3" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Solution Architect at EY · Melbourne</Text>
      <Text as="span" size="xs" family="mono" color="4" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>4 live · 5 coming soon · credits per use</Text>
      <Text as="span" size="xs" family="mono" color="accent" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>--th-color-accent: #B5623A</Text>
    </div>
  ),
};

/* ── Color palette ───────────────────────────────────────────────────────── */
export const Colors: Story = {
  name: "All colors",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-2)" }}>
      {(["1", "2", "3", "4", "accent", "accent-text", "sage", "sage-text"] as const).map((c) => (
        <Text key={c} size="base" family="display" color={c}>color="{c}" — The quick brown fox</Text>
      ))}
    </div>
  ),
};
