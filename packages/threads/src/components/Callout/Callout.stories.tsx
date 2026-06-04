import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout } from "./Callout";

const meta = {
  title: "Threads/Feedback/Callout",
  component: Callout,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["success", "warning", "error", "info"] },
  },
  args: {
    variant: "info",
    title: "PDF-Craft launches end of June 2026",
    children: "5 more operations are in development. Drop your email to be notified.",
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story    = { args: { variant: "info",    title: "PDF-Craft launches end of June 2026",  children: "5 more operations are in development. Drop your email to be notified." } };
export const Success: Story = { args: { variant: "success", title: "All habits complete",                   children: "Morning walk streak: 9 days. You're close to your best of 12." } };
export const Warning: Story = { args: { variant: "warning", title: "Day looks full",                        children: "You're at 110% capacity. Consider deferring a low-priority task before you start." } };
export const Error: Story   = { args: { variant: "error",   title: "Notifications disabled",               children: "Evening planning reminders won't fire. Enable in iOS Settings to restore." } };

export const NoTitle: Story = {
  name: "Without title",
  args: {
    variant: "info",
    title: undefined,
    children: "PDF-Craft is in development — 5 more operations coming soon.",
  },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)" }}>
      <Callout variant="success" title="Planning complete">Tomorrow is set. 4 tasks · 2h 50m · within your 4h capacity.</Callout>
      <Callout variant="warning" title="Day looks full">You're at 110% capacity. Consider deferring a low-priority task before you start.</Callout>
      <Callout variant="error"   title="Notifications disabled">Evening planning reminders won't fire. Enable in iOS Settings to restore.</Callout>
      <Callout variant="info"    title="PDF-Craft launches end of June 2026">5 more operations are in development. Drop your email to be notified.</Callout>
    </div>
  ),
};

export const RTL: Story = {
  name: "RTL",
  render: () => (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)" }}>
      <Callout variant="success" title="اكتملت جميع العادات">شريط المشي الصباحي: 9 أيام.</Callout>
      <Callout variant="error" title="الإشعارات معطلة">لن تعمل تذكيرات التخطيط المسائي.</Callout>
    </div>
  ),
};
