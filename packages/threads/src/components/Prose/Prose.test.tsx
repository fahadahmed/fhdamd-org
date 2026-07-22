import { render, screen } from "@testing-library/react";
import { Prose } from "./Prose";

describe("Prose", () => {
  it("renders its children", () => {
    render(
      <Prose>
        <h2>A heading</h2>
        <p>A paragraph.</p>
      </Prose>
    );
    expect(screen.getByRole("heading", { name: "A heading" })).toBeInTheDocument();
    expect(screen.getByText("A paragraph.")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<Prose className="custom" data-testid="prose"><p>x</p></Prose>);
    expect(screen.getByTestId("prose")).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(<Prose data-testid="prose"><p>x</p></Prose>);
    expect(screen.getByTestId("prose")).toBeInTheDocument();
  });
});
