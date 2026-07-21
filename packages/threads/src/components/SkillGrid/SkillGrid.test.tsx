import { render, screen } from "@testing-library/react";
import { SkillGrid } from "./SkillGrid";

const categories = [
  { label: "Cloud & infra", tags: ["Azure", "AWS"] },
  { label: "Frontend", tags: ["React", "Astro"] },
];

describe("SkillGrid", () => {
  it("renders each category label", () => {
    render(<SkillGrid categories={categories} />);
    expect(screen.getByText("Cloud & infra")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
  });

  it("renders each tag within its category", () => {
    render(<SkillGrid categories={categories} />);
    expect(screen.getByText("Azure")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders nothing but the grid wrapper for an empty list", () => {
    const { container } = render(<SkillGrid categories={[]} />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("merges custom className", () => {
    const { container } = render(<SkillGrid categories={categories} className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
