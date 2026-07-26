import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseStudyGrid } from "./CaseStudyGrid";
import type { CaseStudyItem } from "../../content/types";

const items: CaseStudyItem[] = [
  {
    slug: "rzest",
    title: "RZest Engineers",
    description: "A site build.",
    dateLabel: "Delivered",
    tag: "website",
  },
  {
    slug: "next-app",
    title: "Next case study",
    description: "Reserved.",
    dateLabel: "Coming soon",
    tag: "app",
    comingSoon: true,
  },
];

describe("CaseStudyGrid", () => {
  it("renders every item when no filter is applied", () => {
    render(<CaseStudyGrid items={items} />);
    expect(screen.getByText("RZest Engineers")).toBeInTheDocument();
    expect(screen.getByText("Next case study")).toBeInTheDocument();
  });

  it("links a real item to its case-study slug", () => {
    render(<CaseStudyGrid items={items} />);
    expect(screen.getByText("RZest Engineers").closest("a")).toHaveAttribute(
      "href",
      "/case-studies/rzest",
    );
  });

  it("renders a comingSoon item without a link", () => {
    render(<CaseStudyGrid items={items} />);
    expect(screen.getByText("Next case study").closest("a")).toBeNull();
  });

  it("filters to only items matching the selected tag", async () => {
    const user = userEvent.setup();
    render(<CaseStudyGrid items={items} />);

    await user.click(screen.getByRole("button", { name: "Apps & products" }));

    expect(screen.queryByText("RZest Engineers")).not.toBeInTheDocument();
    expect(screen.getByText("Next case study")).toBeInTheDocument();
  });
});
