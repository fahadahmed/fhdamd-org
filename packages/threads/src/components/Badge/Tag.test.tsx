import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";

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

  it("forwards additional HTML attributes", () => {
    render(<Tag data-testid="tag-el">Label</Tag>);
    expect(screen.getByTestId("tag-el")).toBeInTheDocument();
  });

  it("renders rich children (JSX)", () => {
    render(<Tag><strong>Bold</strong></Tag>);
    expect(screen.getByText("Bold")).toBeInTheDocument();
  });

  it("renders multiple tags independently", () => {
    render(
      <>
        <Tag>SwiftUI</Tag>
        <Tag>Firebase</Tag>
        <Tag>2 credits</Tag>
      </>
    );
    expect(screen.getByText("SwiftUI")).toBeInTheDocument();
    expect(screen.getByText("Firebase")).toBeInTheDocument();
    expect(screen.getByText("2 credits")).toBeInTheDocument();
  });
});
