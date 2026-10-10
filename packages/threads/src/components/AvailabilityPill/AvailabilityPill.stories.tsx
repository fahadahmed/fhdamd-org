import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvailabilityPill } from "./AvailabilityPill";

const meta = {
  title: "Threads/Atoms/AvailabilityPill",
  component: AvailabilityPill,
  parameters: { layout: "centered", a11y: { test: "error" } },
  tags: ["autodocs"],
  argTypes: {
    available: { control: "boolean" },
  },
  args: {
    label:     "Open to select projects",
    available: true,
  },
} satisfies Meta<typeof AvailabilityPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: { label: "Open to select projects", available: true },
};

export const Busy: Story = {
  args: { label: "Not available right now", available: false },
};

export const CustomLabel: Story = {
  args: { label: "Accepting clients from Q3", available: true },
};

export const InHeroContext: Story = {
  name: "In hero actions row",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--th-space-3)", flexWrap: "wrap" }}>
      <a
        href="#"
        style={{
          display: "inline-flex", alignItems: "center", gap: "var(--th-space-2)",
          background: "var(--th-terra)", color: "var(--th-on-accent)",
          borderRadius: "var(--th-radius-pill)",
          padding: "var(--th-space-3) var(--th-space-5)",
          fontFamily: "var(--th-font-display)",
          fontWeight: 600,
          fontSize: "var(--th-text-base)", textDecoration: "none",
          minBlockSize: "44px",
        }}
      >
        See the work
      </a>
      <a
        href="#"
        style={{
          display: "inline-flex", alignItems: "center", gap: "var(--th-space-2)",
          background: "transparent", color: "var(--th-ink-2)",
          border: "1.5px solid var(--th-line-2)",
          borderRadius: "var(--th-radius-pill)",
          padding: "var(--th-space-3) var(--th-space-5)",
          fontFamily: "var(--th-font-display)",
          fontWeight: 600,
          fontSize: "var(--th-text-base)", textDecoration: "none",
          minBlockSize: "44px",
        }}
      >
        Get in touch
      </a>
      <AvailabilityPill />
    </div>
  ),
};
