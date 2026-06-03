import { render } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders an <hr> element", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild?.nodeName).toBe("HR");
  });

  it.each(["subtle", "default", "strong", "accent"] as const)(
    "renders color=%s without throwing",
    (color) => {
      expect(() => render(<Divider color={color} />)).not.toThrow();
    }
  );

  it("merges custom className", () => {
    const { container } = render(<Divider className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    const { container } = render(<Divider aria-label="section divider" />);
    expect(container.firstChild).toHaveAttribute("aria-label", "section divider");
  });
});
