import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LabGrid } from "./LabGrid";
import type { LabItem } from "../../content/types";

const items: LabItem[] = [
  {
    href: "/blog/sequence-diagram-you-can-trust",
    title: "Mermaid diagrams as living docs",
    description: "Live diagrams.",
    dateLabel: "View on the blog",
    tags: ["prototype", "interaction"],
  },
  {
    title: "Next experiment",
    description: "Reserved.",
    dateLabel: "Coming soon",
    tags: ["component"],
    comingSoon: true,
  },
];

describe("LabGrid", () => {
  it("renders every item when no filter is applied", () => {
    render(<LabGrid items={items} />);
    expect(
      screen.getByText("Mermaid diagrams as living docs"),
    ).toBeInTheDocument();
    expect(screen.getByText("Next experiment")).toBeInTheDocument();
  });

  it("links a real item to its external href", () => {
    render(<LabGrid items={items} />);
    expect(
      screen.getByText("Mermaid diagrams as living docs").closest("a"),
    ).toHaveAttribute("href", "/blog/sequence-diagram-you-can-trust");
  });

  it("renders a comingSoon item without a link even though it has no href", () => {
    render(<LabGrid items={items} />);
    expect(screen.getByText("Next experiment").closest("a")).toBeNull();
  });

  it("filters to only items matching the selected tag", async () => {
    const user = userEvent.setup();
    render(<LabGrid items={items} />);

    await user.click(screen.getByRole("button", { name: "Components" }));

    expect(
      screen.queryByText("Mermaid diagrams as living docs"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Next experiment")).toBeInTheDocument();
  });

  it("matches an item that has the filtered tag among several", async () => {
    const user = userEvent.setup();
    render(<LabGrid items={items} />);

    await user.click(screen.getByRole("button", { name: "Interaction" }));

    expect(
      screen.getByText("Mermaid diagrams as living docs"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Next experiment")).not.toBeInTheDocument();
  });

  it("falls back to the raw tag string when an item's tag has no known label", () => {
    const untaggedItem: LabItem = {
      href: "/blog/some-post",
      title: "Untagged experiment",
      description: "No known tag.",
      dateLabel: "View on the blog",
      tags: ["misc"],
    };
    render(<LabGrid items={[untaggedItem]} />);

    expect(screen.getAllByText("misc")).toHaveLength(2); // tag pill + badge
  });
});
