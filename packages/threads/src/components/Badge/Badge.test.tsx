import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import { Tag } from "./Tag";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Live</Badge>);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders as <span>", () => {
    const { container } = render(<Badge>Label</Badge>);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });

  it.each([
    "terra", "sage", "warning", "error", "info", "neutral", "inverse",
  ] as const)("renders variant=%s without throwing", (variant) => {
    expect(() => render(<Badge variant={variant}>Label</Badge>)).not.toThrow();
  });

  it("renders dot indicator when dot=true", () => {
    const { container } = render(<Badge dot>Label</Badge>);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).toBeInTheDocument();
  });

  it("does not render dot when dot is omitted", () => {
    const { container } = render(<Badge>Label</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("dot is hidden from accessibility tree", () => {
    const { container } = render(<Badge dot>Label</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toHaveAttribute("aria-hidden", "true");
  });

  it("merges custom className", () => {
    const { container } = render(<Badge className="custom">Label</Badge>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards HTML attributes", () => {
    render(<Badge data-testid="badge">Label</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("can be used as an aria-label carrier for role=status", () => {
    render(<Badge role="status" aria-label="Operation is live">Live</Badge>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("Tag", () => {
  it("renders children", () => {
    render(<Tag>SwiftUI</Tag>);
    expect(screen.getByText("SwiftUI")).toBeInTheDocument();
  });

  it("renders as <span>", () => {
    const { container } = render(<Tag>Label</Tag>);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });

  it("merges custom className", () => {
    const { container } = render(<Tag className="custom">Label</Tag>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards HTML attributes", () => {
    render(<Tag data-testid="tag">Label</Tag>);
    expect(screen.getByTestId("tag")).toBeInTheDocument();
  });

  it("renders rich children", () => {
    render(<Tag><strong>Bold tag</strong></Tag>);
    expect(screen.getByText("Bold tag")).toBeInTheDocument();
  });
});
