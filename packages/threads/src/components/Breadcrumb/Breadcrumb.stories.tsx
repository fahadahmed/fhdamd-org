import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb";

const meta = {
  title: "Threads/Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    items: [
      { label: "PDF-Craft", href: "/" },
      { label: "Tools",     href: "/tools" },
      { label: "Merge PDFs" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoLevels: Story = {
  args: { items: [{ label: "PDF-Craft", href: "/" }, { label: "Pricing" }] },
};

export const Deep: Story = {
  args: {
    items: [
      { label: "PDF-Craft",    href: "/" },
      { label: "Account",      href: "/account" },
      { label: "Billing",      href: "/account/billing" },
      { label: "Purchase history" },
    ],
  },
};
