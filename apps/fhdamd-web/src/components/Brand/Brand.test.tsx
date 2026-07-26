import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogoMark, BrandWordmark } from "./Brand";

describe("LogoMark", () => {
  it("defaults to full opacity for the ink variant", () => {
    const { container } = render(<LogoMark />);
    expect(container.querySelector("svg")).toHaveStyle({ opacity: 1 });
  });

  it("uses a faint opacity for the faint variant", () => {
    const { container } = render(<LogoMark variant="faint" />);
    expect(container.querySelector("svg")).toHaveStyle({ opacity: 0.32 });
  });

  it("respects a custom height", () => {
    const { container } = render(<LogoMark height={40} />);
    expect(container.querySelector("svg")).toHaveAttribute("height", "40");
  });
});

describe("BrandWordmark", () => {
  it("renders the fhdamd label alongside the logo mark", () => {
    const { container } = render(<BrandWordmark />);
    expect(screen.getByText("fhdamd")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
