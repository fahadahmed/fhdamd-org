import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";

const nightPlanningSteps = [
  { label: "Today review" },
  { label: "Carry forward" },
  { label: "Build tomorrow" },
  { label: "Load check" },
  { label: "Done" },
];

const onboardingSteps = [
  { label: "Create account" },
  { label: "Buy credits" },
  { label: "Process docs" },
];

const meta = {
  title: "Threads/Navigation/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    currentStep: { control: { type: "number", min: 0, max: 4 } },
  },
  args: { steps: nightPlanningSteps, currentStep: 2 },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step3of5: Story = { name: "Step 3 of 5 — night planning",  args: { currentStep: 2 } };
export const Step1of5: Story = { name: "Step 1 of 5 — just started",    args: { currentStep: 0 } };
export const Complete: Story = { name: "All complete",                   args: { currentStep: 5 } };

export const Onboarding: Story = {
  name: "3-step onboarding",
  args: { steps: onboardingSteps, currentStep: 1 },
};
