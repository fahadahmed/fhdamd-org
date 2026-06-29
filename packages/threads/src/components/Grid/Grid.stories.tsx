import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid, GridItem, AutoGrid } from "./Grid";

const Col = ({ span, label }: { span?: number; label?: string }) => (
  <div
    style={{
      background: "var(--th-color-accent-subtle)",
      border: "1px dashed var(--th-color-accent)",
      borderRadius: "var(--th-radius-sm)",
      padding: "var(--th-space-3)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.625rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-accent-text)",
      textAlign: "center",
    }}
  >
    {label ?? (span ? `span ${span}` : "1fr")}
  </div>
);

const SageCol = ({ label }: { label: string }) => (
  <div
    style={{
      background: "var(--th-color-sage-subtle)",
      border: "1px dashed var(--th-color-sage)",
      borderRadius: "var(--th-radius-sm)",
      padding: "var(--th-space-4)",
      fontFamily: "var(--th-font-mono)",
      fontSize: "0.625rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--th-color-sage-text)",
      textAlign: "center",
    }}
  >
    {label}
  </div>
);

const meta = {
  title: "Threads/Layout/Grid",
  component: Grid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    cols: { control: "select", options: [1, 2, 3, 4, 6, 12] },
    gap:  { control: "select", options: [2, 3, 4, 5, 6, 8] },
  },
  args: {
    cols: 12,
    gap: 4,
    children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
      <Col key={n} label={`${n}`} />
    )),
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwelveCols: Story = {
  name: "12-column grid",
};

export const ThreeCols: Story = {
  name: "3-column grid",
  args: {
    cols: 3,
    children: (
      <>
        <Col label="1/3" />
        <Col label="1/3" />
        <Col label="1/3" />
        <Col label="1/3" />
        <Col label="1/3" />
        <Col label="1/3" />
      </>
    ),
  },
};

export const WithSpanning: Story = {
  name: "GridItem spanning",
  render: () => (
    <Grid cols={12} gap={4}>
      <GridItem span={8}><Col label="span 8" /></GridItem>
      <GridItem span={4}><Col label="span 4" /></GridItem>
      <GridItem span={6}><Col label="span 6" /></GridItem>
      <GridItem span={6}><Col label="span 6" /></GridItem>
      <GridItem span={4}><Col label="span 4" /></GridItem>
      <GridItem span={4}><Col label="span 4" /></GridItem>
      <GridItem span={4}><Col label="span 4" /></GridItem>
      <GridItem span={12}><Col label="span 12" /></GridItem>
    </Grid>
  ),
};

export const AutoGridStory: Story = {
  name: "AutoGrid — auto-fill columns",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-4)" }}>
      <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", color: "var(--th-color-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        minColWidth=280px — resize the window to see auto-fill in action
      </div>
      <AutoGrid minColWidth="280px" gap={4}>
        {["PDF-Craft", "Jamaal", "fhdamd.dev", "Threads"].map((n) => (
          <SageCol key={n} label={n} />
        ))}
      </AutoGrid>
    </div>
  ),
};

export const OpCardLayout: Story = {
  name: "OpCard layout — 4-col, live items span 2",
  render: () => (
    <Grid cols={4} gap={4}>
      <GridItem span={2}><Col label="Merge PDFs — span 2" /></GridItem>
      <GridItem span={2}><Col label="Image to PDF — span 2" /></GridItem>
      <GridItem span={2}><Col label="Protect PDF — span 2" /></GridItem>
      <GridItem span={2}><Col label="Unlock PDF — span 2" /></GridItem>
      <GridItem span={1}><Col label="Split" /></GridItem>
      <GridItem span={1}><Col label="Compress" /></GridItem>
      <GridItem span={1}><Col label="Sign" /></GridItem>
      <GridItem span={1}><Col label="AI" /></GridItem>
    </Grid>
  ),
};
