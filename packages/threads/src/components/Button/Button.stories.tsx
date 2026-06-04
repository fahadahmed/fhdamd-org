import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const ArrowRight = () => (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Mail = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const meta = {
  title: "Threads/Atoms/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "solid-ink",
        "solid-terra",
        "solid-sage",
        "ghost",
        "outline",
        "subtle-terra",
        "subtle-sage",
      ],
      description: "Visual style of the button",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
    iconPosition: {
      control: "radio",
      options: ["start", "end"],
    },
    disabled: { control: "boolean" },
    href: { control: "text", description: "Renders as <a> when provided" },
  },
  args: {
    onClick: fn(),
    children: "Button",
    variant: "solid-ink",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual variants ─────────────────────────────────────────────────── */

export const SolidInk: Story = {
  args: { variant: "solid-ink", children: "Solid ink" },
};

export const SolidTerra: Story = {
  args: { variant: "solid-terra", children: "Get started" },
};

export const SolidSage: Story = {
  args: { variant: "solid-sage", children: "All done" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Secondary action" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const SubtleTerra: Story = {
  args: { variant: "subtle-terra", children: "Subtle terra" },
};

export const SubtleSage: Story = {
  args: { variant: "subtle-sage", children: "Subtle sage" },
};

/* ── Sizes ───────────────────────────────────────────────────────────────── */

export const Small: Story = {
  args: { variant: "solid-ink", size: "sm", children: "Small" },
};

export const Medium: Story = {
  args: { variant: "solid-ink", size: "md", children: "Medium" },
};

export const Large: Story = {
  args: { variant: "solid-terra", size: "lg", children: "Large" },
};

/* ── States ──────────────────────────────────────────────────────────────── */

export const Disabled: Story = {
  args: { variant: "solid-ink", disabled: true, children: "Disabled" },
};

export const GhostDisabled: Story = {
  args: { variant: "ghost", disabled: true, children: "Ghost disabled" },
};

/* ── With icon ───────────────────────────────────────────────────────────── */

export const WithIconEnd: Story = {
  name: "With icon (end)",
  args: {
    variant: "solid-ink",
    children: "See the work",
    icon: <ArrowRight />,
    iconPosition: "end",
  },
};

export const WithIconStart: Story = {
  name: "With icon (start)",
  args: {
    variant: "ghost",
    children: "Get in touch",
    icon: <Mail />,
    iconPosition: "start",
  },
};

/* ── As anchor ───────────────────────────────────────────────────────────── */

export const AsLink: Story = {
  name: "As <a> link",
  args: {
    variant: "solid-terra",
    href: "#",
    children: "Merge PDFs",
    icon: <ArrowRight />,
  },
};

/* ── Showcase ────────────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
      <Button variant="solid-ink">Solid ink</Button>
      <Button variant="solid-terra">Solid terra</Button>
      <Button variant="solid-sage">Solid sage</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="subtle-terra">Subtle terra</Button>
      <Button variant="subtle-sage">Subtle sage</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button variant="solid-ink" size="sm">Small</Button>
      <Button variant="solid-ink" size="md">Medium</Button>
      <Button variant="solid-ink" size="lg">Large</Button>
    </div>
  ),
};

export const RTL: Story = {
  name: "RTL — Arabic",
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }} dir="rtl">
      <Button variant="solid-ink">ابدأ الآن</Button>
      <Button variant="ghost">تسجيل الدخول</Button>
      <Button variant="solid-terra" icon={<ArrowRight />} iconPosition="start">
        دمج الملفات
      </Button>
    </div>
  ),
};
