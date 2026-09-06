import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { MermaidDiagramCard } from "./MermaidDiagramCard";

const meta = {
  title: "Threads/Components/MermaidDiagramCard",
  component: MermaidDiagramCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label:    "Sequence diagram · Mermaid",
    caption:  "Rendered live from the .mmd source at build time — no exported PNG to go stale",
    children: null,
  },
} satisfies Meta<typeof MermaidDiagramCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const placeholderDiagram = (
  <div style={{ padding: "40px 80px", border: "1px dashed var(--th-color-border-default)", color: "var(--th-color-text-4)", fontFamily: "var(--th-font-mono)", fontSize: "0.75rem" }}>
    [rendered mermaid SVG goes here]
  </div>
);

export const Default: Story = {
  render: (args) => (
    <MermaidDiagramCard {...args}>
      {/* In a real app this is the mermaid-rendered SVG, produced by the consuming page */}
      {placeholderDiagram}
    </MermaidDiagramCard>
  ),
};

/**
 * Click the expand button (top-right of the label row) to toggle fullscreen,
 * Escape or a backdrop click to close. This story auto-expands on load via
 * its play function so the overlay is visible without an extra click.
 */
export const Expanded: Story = {
  render: (args) => (
    <MermaidDiagramCard {...args}>
      {placeholderDiagram}
    </MermaidDiagramCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("mermaid-expand-toggle"));
  },
};

/**
 * Reproduces the real consuming shape (apps/fhdamd-web's MermaidDiagram.tsx):
 * a `width: 100%` wrapper div around an SVG that itself has inline
 * `width: 100%; height: auto` — the mermaid.render() output, resized. A
 * plain placeholder box (see `Expanded` above) doesn't stretch the way a
 * real diagram does, so it can't catch a fullscreen sizing/centering
 * regression the way this story can.
 */
const realisticDiagram = (
  <div style={{ width: "100%" }}>
    <svg viewBox="0 0 600 300" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="110" width="160" height="70" rx="8" fill="var(--th-color-surface-2)" stroke="var(--th-color-border-strong)" strokeWidth="2" />
      <text x="100" y="150" textAnchor="middle" fontFamily="monospace" fontSize="18" fill="var(--th-color-text-1)">Start</text>
      <line x1="180" y1="145" x2="300" y2="145" stroke="var(--th-color-border-strong)" strokeWidth="2" />
      <rect x="300" y="80" width="160" height="130" rx="8" fill="var(--th-color-surface-2)" stroke="var(--th-color-border-strong)" strokeWidth="2" />
      <text x="380" y="150" textAnchor="middle" fontFamily="monospace" fontSize="18" fill="var(--th-color-text-1)">Process</text>
      <line x1="460" y1="145" x2="560" y2="145" stroke="var(--th-color-border-strong)" strokeWidth="2" />
    </svg>
  </div>
);

export const ExpandedRealisticContent: Story = {
  render: (args) => (
    <MermaidDiagramCard {...args}>
      {realisticDiagram}
    </MermaidDiagramCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("mermaid-expand-toggle"));
  },
};
