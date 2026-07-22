import { render, screen } from "@testing-library/react";
import { AuthorBox } from "./AuthorBox";

describe("AuthorBox", () => {
  it("renders initials, name, role, and bio", () => {
    render(<AuthorBox initials="FA" name="Fahad Ahmed" role="Solution Architect" bio="A bio." />);
    expect(screen.getByText("FA")).toBeInTheDocument();
    expect(screen.getByText("Fahad Ahmed")).toBeInTheDocument();
    expect(screen.getByText("Solution Architect")).toBeInTheDocument();
    expect(screen.getByText("A bio.")).toBeInTheDocument();
  });

  it("hides the avatar initials from the accessibility tree", () => {
    render(<AuthorBox initials="FA" name="n" role="r" bio="b" />);
    expect(screen.getByText("FA")).toHaveAttribute("aria-hidden", "true");
  });

  it("supports a ReactNode bio with an embedded link", () => {
    render(
      <AuthorBox
        initials="FA"
        name="n"
        role="r"
        bio={<>Considering something similar? <a href="/contact">Get a proposal</a>.</>}
      />
    );
    expect(screen.getByRole("link", { name: "Get a proposal" })).toHaveAttribute("href", "/contact");
  });

  it("merges custom className", () => {
    render(<AuthorBox initials="FA" name="n" role="r" bio="b" className="custom" data-testid="box" />);
    expect(screen.getByTestId("box")).toHaveClass("custom");
  });
});
