import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastStack, useToast } from "./Toast";

/* ── ToastStack ──────────────────────────────────────────────────────────── */
describe("ToastStack — rendering", () => {
  it("renders nothing when toasts array is empty", () => {
    const { container } = render(<ToastStack toasts={[]} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a toast message", () => {
    render(
      <ToastStack
        toasts={[{ id: "1", variant: "success", message: "PDF merged successfully." }]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText("PDF merged successfully.")).toBeInTheDocument();
  });

  it("renders multiple toasts", () => {
    render(
      <ToastStack
        toasts={[
          { id: "1", variant: "success", message: "Done." },
          { id: "2", variant: "error",   message: "Failed." },
        ]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText("Done.")).toBeInTheDocument();
    expect(screen.getByText("Failed.")).toBeInTheDocument();
  });

  it("renders a dismiss button on each toast", () => {
    render(
      <ToastStack
        toasts={[
          { id: "1", variant: "info", message: "Message one." },
          { id: "2", variant: "info", message: "Message two." },
        ]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getAllByRole("button", { name: "Dismiss notification" })).toHaveLength(2);
  });

  it("calls onDismiss with the correct id when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <ToastStack
        toasts={[{ id: "toast-42", variant: "success", message: "Done." }]}
        onDismiss={onDismiss}
      />
    );
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledWith("toast-42");
  });
});

describe("ToastStack — accessibility", () => {
  it("error toasts have role=alert", () => {
    render(
      <ToastStack
        toasts={[{ id: "1", variant: "error", message: "Insufficient credits." }]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("success toasts have role=status", () => {
    render(
      <ToastStack
        toasts={[{ id: "1", variant: "success", message: "PDF merged." }]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

/* ── useToast ────────────────────────────────────────────────────────────── */
function ToastHarness() {
  const { toasts, dismiss, toast } = useToast();
  return (
    <>
      <button onClick={() => toast("success", "Done.")}>Add</button>
      <button onClick={() => toast("error", "Error!", 0)}>Add persistent</button>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

describe("useToast hook", () => {
  it("adds a toast when toast() is called", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Done.")).toBeInTheDocument();
  });

  it("removes a toast when dismissed", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Done.")).not.toBeInTheDocument();
  });

  it("can add multiple toasts", async () => {
    const user = userEvent.setup();
    render(<ToastHarness />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getAllByText("Done.")).toHaveLength(2);
  });
});
