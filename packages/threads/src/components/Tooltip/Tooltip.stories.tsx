import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";

const meta = {
  title: "Threads/Overlays/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    position: { control: "radio", options: ["top", "bottom", "left", "right"] },
  },
  args: { content: "2 credits per merge operation", position: "top", children: "Hover me" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top:    Story = { args: { position: "top" } };
export const Bottom: Story = { args: { position: "bottom" } };
export const Left:   Story = { args: { position: "left" } };
export const Right:  Story = { args: { position: "right" } };

export const OnButton: Story = {
  name: "On a Button",
  render: () => (
    <Tooltip content="2 credits per operation" position="top">
      <Button variant="solid-terra">Merge PDFs</Button>
    </Tooltip>
  ),
};

export const AllPositions: Story = {
  name: "All positions",
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--th-space-12)", padding: "var(--th-space-12)", placeItems: "center" }}>
      {(["top", "bottom", "left", "right"] as const).map((pos) => (
        <Tooltip key={pos} content={`Position: ${pos}`} position={pos}>
          <Button variant="ghost" size="sm">{pos}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const CreditCosts: Story = {
  name: "PDF-Craft — credit cost hints",
  render: () => (
    <div style={{ display: "flex", gap: "var(--th-space-3)" }}>
      <Tooltip content="2 credits" position="top">
        <Button variant="ghost" size="sm">Merge</Button>
      </Tooltip>
      <Tooltip content="2 credits" position="top">
        <Button variant="ghost" size="sm">Convert</Button>
      </Tooltip>
      <Tooltip content="4 credits" position="top">
        <Button variant="ghost" size="sm">Protect</Button>
      </Tooltip>
    </div>
  ),
};
