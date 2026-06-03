import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepCard } from "./StepCard";

const meta = {
  title: "Threads/StepCard",
  component: StepCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    number: "01",
    title:  "Create a free account",
    body:   "Sign up in seconds. No credit card required. New accounts include a small credit balance to try the tools straight away.",
  },
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HowItWorksGrid: Story = {
  name: "How it works — 3-step grid",
  parameters: { layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "var(--th-space-4)",
      }}
    >
      <StepCard
        number="01"
        title="Create a free account"
        body="Sign up in seconds. No credit card required. New accounts include a small credit balance to try the tools straight away."
      />
      <StepCard
        number="02"
        title="Buy a credit pack"
        body="Three simple packs to choose from. Credits never expire and work across every operation. Pay once, use whenever you need."
      />
      <StepCard
        number="03"
        title="Process your documents"
        body="Upload, pick your operation, download. The exact credit cost is shown before you confirm — no surprises, ever."
      />
    </div>
  ),
};
