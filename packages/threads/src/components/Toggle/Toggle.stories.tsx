import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "./Toggle";

const meta = {
  title: "Threads/Atoms/Toggle",
  component: Toggle,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["ink", "sage", "terra"] },
  },
  args: { label: "Evening planning", variant: "ink" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off:          Story = { args: { label: "Evening planning" } };
export const On:           Story = { args: { label: "Evening planning", defaultChecked: true } };
export const Sage:         Story = { args: { label: "Habit enabled", variant: "sage", defaultChecked: true } };
export const Terra:        Story = { args: { label: "Priority mode", variant: "terra", defaultChecked: true } };
export const Disabled:     Story = { args: { label: "During-day nudges", disabled: true } };
export const DisabledOn:   Story = { args: { label: "Locked setting", disabled: true, defaultChecked: true } };
export const NoLabel:      Story = { args: { label: undefined } };

export const SettingsGroup: Story = {
  name: "Settings rows — Jamaal",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-1)", maxWidth: "420px" }}>
      {[
        { label: "Evening planning", sub: "Jamaal nudges you to plan tomorrow", variant: "ink" as const, on: true },
        { label: "Morning nudge",    sub: "See what's on for today",             variant: "sage" as const, on: true },
        { label: "During-day nudges",sub: "Next task suggestions",               variant: "ink" as const, on: false },
      ].map(({ label, sub, variant, on }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--th-space-4) var(--th-space-5)", background: "var(--th-color-surface-1)", borderRadius: "var(--th-radius-md)", border: "1px solid var(--th-color-border-subtle)" }}>
          <div>
            <div style={{ fontVariationSettings: '"wdth" 92, "wght" 500', fontSize: "var(--th-text-base)" }}>{label}</div>
            <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.75rem", color: "var(--th-color-text-3)", marginTop: "2px" }}>{sub}</div>
          </div>
          <Toggle variant={variant} defaultChecked={on} aria-label={label} />
        </div>
      ))}
    </div>
  ),
};
