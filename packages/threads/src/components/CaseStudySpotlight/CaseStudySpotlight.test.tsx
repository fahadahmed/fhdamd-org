import { render, screen } from "@testing-library/react";
import { CaseStudySpotlight } from "./CaseStudySpotlight";

const stats = [
  { value: "<3wks", label: "Discovery to launch" },
  { value: "0", label: "Dev tickets since launch" },
];

describe("CaseStudySpotlight", () => {
  it("renders eyebrow, title, and description", () => {
    render(
      <CaseStudySpotlight
        eyebrow="Custom website"
        title="RZest Engineers"
        description="A Presence build in under three weeks."
        stats={stats}
      />
    );
    expect(screen.getByText("Custom website")).toBeInTheDocument();
    expect(screen.getByText("RZest Engineers")).toBeInTheDocument();
    expect(screen.getByText("A Presence build in under three weeks.")).toBeInTheDocument();
  });

  it("renders every stat's value and label", () => {
    render(
      <CaseStudySpotlight eyebrow="e" title="t" description="d" stats={stats} />
    );
    expect(screen.getByText("<3wks")).toBeInTheDocument();
    expect(screen.getByText("Discovery to launch")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders tags when provided", () => {
    render(
      <CaseStudySpotlight eyebrow="e" title="t" description="d" stats={stats} tags={["Astro", "DatoCMS"]} />
    );
    expect(screen.getByText("Astro")).toBeInTheDocument();
    expect(screen.getByText("DatoCMS")).toBeInTheDocument();
  });

  it("does not render a tags row when tags is omitted", () => {
    const { container } = render(
      <CaseStudySpotlight eyebrow="e" title="t" description="d" stats={stats} />
    );
    expect(container.querySelectorAll("[class*='tags']").length).toBe(0);
  });

  it("renders actions when provided", () => {
    render(
      <CaseStudySpotlight
        eyebrow="e"
        title="t"
        description="d"
        stats={stats}
        actions={<button>Read the case study</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Read the case study" })).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <CaseStudySpotlight eyebrow="e" title="t" description="d" stats={stats} className="custom" />
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
