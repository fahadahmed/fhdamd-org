import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const Default: Story = {
  render: (args) => (
    <MermaidDiagramCard {...args}>
      {/* In a real app this is the mermaid-rendered SVG, produced by the consuming page */}
      <div style={{ padding: "40px 80px", border: "1px dashed var(--th-color-border-default)", color: "var(--th-color-text-4)", fontFamily: "var(--th-font-mono)", fontSize: "0.75rem" }}>
        [rendered mermaid SVG goes here]
      </div>
    </MermaidDiagramCard>
  ),
};
