"use client";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";

function DialogDemo({
  title,
  children,
  footer,
  size,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={footer}
        size={size}
      >
        {children}
      </Dialog>
    </>
  );
}

const meta = {
  title: "Threads/Overlays/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    open: false,
    title: "Delete this task?",
    onClose: () => {},
    children: "This will permanently remove the task. This action cannot be undone.",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {
  name: "Confirmation — interactive",
  render: () => (
    <DialogDemo
      title="Delete this task?"
      footer={
        <div style={{ display: "flex", gap: "var(--th-space-3)" }}>
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button variant="solid-terra" size="sm">Delete task</Button>
        </div>
      }
    >
      This will permanently remove{" "}
      <strong>Review project proposal</strong> from your list. This action cannot be undone.
    </DialogDemo>
  ),
};

export const InformationalSm: Story = {
  name: "Informational — small",
  render: () => (
    <DialogDemo title="Credits never expire" size="sm">
      Your credits are yours to keep. Use them today, next month, or a year from now — they never expire.
    </DialogDemo>
  ),
};

export const LargeForm: Story = {
  name: "Form — large",
  render: () => (
    <DialogDemo
      title="Edit task details"
      size="lg"
      footer={
        <div style={{ display: "flex", gap: "var(--th-space-3)" }}>
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button variant="solid-ink" size="sm">Save changes</Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-2)" }}>
          <label style={{ fontVariationSettings: '"wdth" 92, "wght" 550', fontSize: "var(--th-text-base)" }}>Title</label>
          <input defaultValue="Review project proposal" style={{ padding: "12px 16px", border: "1px solid var(--th-color-border-strong)", borderRadius: "14px", fontSize: "var(--th-text-base)", minHeight: "48px", background: "var(--th-color-surface-1)", color: "var(--th-color-text-1)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-2)" }}>
          <label style={{ fontVariationSettings: '"wdth" 92, "wght" 550', fontSize: "var(--th-text-base)" }}>Notes</label>
          <textarea rows={3} style={{ padding: "12px 16px", border: "1px solid var(--th-color-border-strong)", borderRadius: "14px", fontSize: "var(--th-text-base)", background: "var(--th-color-surface-1)", color: "var(--th-color-text-1)", resize: "vertical" }} />
        </div>
      </div>
    </DialogDemo>
  ),
};
