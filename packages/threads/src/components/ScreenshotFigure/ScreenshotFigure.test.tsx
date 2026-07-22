import { render, screen } from "@testing-library/react";
import { ScreenshotFigure } from "./ScreenshotFigure";

describe("ScreenshotFigure", () => {
  it("renders the placeholder state when src is omitted", () => {
    const { container } = render(<ScreenshotFigure caption="Homepage screenshot" />);
    expect(screen.getByText("Homepage screenshot")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders a real image when src is provided", () => {
    render(<ScreenshotFigure src="/shot.png" alt="A screenshot" />);
    expect(screen.getByRole("img", { name: "A screenshot" })).toHaveAttribute("src", "/shot.png");
  });

  it("renders a figcaption below a real image when caption is provided", () => {
    render(<ScreenshotFigure src="/shot.png" caption="The homepage" />);
    expect(screen.getByText("The homepage")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<ScreenshotFigure caption="x" className="custom" data-testid="fig" />);
    expect(screen.getByTestId("fig")).toHaveClass("custom");
  });
});
