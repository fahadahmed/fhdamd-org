import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  title: "Delete this task?",
  children: "This action cannot be undone.",
};

describe("Dialog — rendering", () => {
  it("renders nothing when open=false", () => {
    render(<Dialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open=true", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByText("Delete this task?")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    render(
      <Dialog {...defaultProps} footer={<Button>Confirm</Button>} />
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("does not render footer when omitted", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
  });

  it("has aria-labelledby pointing to the title", () => {
    render(<Dialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(screen.getByText("Delete this task?")).toHaveAttribute("id", "dialog-title");
  });
});

describe("Dialog — interaction", () => {
  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog {...defaultProps} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Dialog — accessibility", () => {
  it("has role=dialog", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal=true", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("close button has descriptive aria-label", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });
});
