import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastStack, useToast } from "./Toast";

/* ── Interactive demo using useToast hook ────────────────────────────────── */
function ToastDemo() {
  const { toasts, dismiss, toast } = useToast();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-3)", alignItems: "flex-start" }}>
      <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--th-color-text-3)", marginBottom: "var(--th-space-2)" }}>
        Click to trigger toasts
      </div>
      <div style={{ display: "flex", gap: "var(--th-space-2)", flexWrap: "wrap" }}>
        <button
          onClick={() => toast("success", "PDF merged successfully.")}
          style={{ padding: "8px 16px", background: "var(--th-color-sage-subtle)", color: "var(--th-color-sage-text)", border: "1px solid var(--th-color-sage)", borderRadius: "var(--th-radius-pill)", cursor: "pointer", fontFamily: "var(--th-font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Success
        </button>
        <button
          onClick={() => toast("error", <>Insufficient credits. <a href="#" style={{ fontWeight: 600, color: "inherit" }}>Buy more →</a></>)}
          style={{ padding: "8px 16px", background: "var(--th-color-error-subtle)", color: "var(--th-color-error-text)", border: "1px solid var(--th-color-error)", borderRadius: "var(--th-radius-pill)", cursor: "pointer", fontFamily: "var(--th-font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Error
        </button>
        <button
          onClick={() => toast("info", "Processing your PDF…", 0)}
          style={{ padding: "8px 16px", background: "var(--th-color-info-subtle)", color: "var(--th-color-info-text)", border: "1px solid var(--th-color-info)", borderRadius: "var(--th-radius-pill)", cursor: "pointer", fontFamily: "var(--th-font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Info (persistent)
        </button>
        <button
          onClick={() => toast("warning", "This file is larger than 50 MB.")}
          style={{ padding: "8px 16px", background: "var(--th-color-warning-subtle)", color: "var(--th-color-warning-text)", border: "1px solid var(--th-color-warning)", borderRadius: "var(--th-radius-pill)", cursor: "pointer", fontFamily: "var(--th-font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Warning
        </button>
      </div>
      <div style={{ fontFamily: "var(--th-font-mono)", fontSize: "0.625rem", color: "var(--th-color-text-4)", marginTop: "var(--th-space-2)" }}>
        Toasts auto-dismiss after 5s. Persistent toasts require manual dismiss.
      </div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

/* ── Static preview ──────────────────────────────────────────────────────── */
function StaticToasts() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--th-space-2)", maxWidth: "480px" }}>
      <ToastStack
        toasts={[
          { id: "1", variant: "success", message: <>PDF merged successfully. <a href="#" style={{ fontWeight: 600, color: "inherit" }}>Download</a></> },
          { id: "2", variant: "error",   message: <>Insufficient credits. <a href="#" style={{ fontWeight: 600, color: "inherit" }}>Buy more</a></> },
          { id: "3", variant: "info",    message: "Processing your PDF…" },
          { id: "4", variant: "warning", message: "This file is larger than 50 MB." },
        ]}
        onDismiss={() => {}}
      />
    </div>
  );
}

const meta = {
  title: "Threads/Feedback/Toast",
  component: ToastStack,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    toasts: [],
    onDismiss: () => {},
  },
} satisfies Meta<typeof ToastStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: "Interactive — useToast hook",
  render: () => <ToastDemo />,
};

export const AllVariants: Story = {
  name: "All variants (static preview)",
  render: () => <StaticToasts />,
};
