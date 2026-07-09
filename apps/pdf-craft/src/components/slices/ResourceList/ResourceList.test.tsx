import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResourceList from "./ResourceList";
import type { Resource } from "../../../utils";

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: "res-1",
  title: "How to split a PDF",
  slug: "how-to-split-a-pdf",
  excerpt: "Learn how to divide a PDF into separate files using Riqa.",
  content: "# Split PDF\n\nSome content here.",
  coverImage: null,
  relatedOperationIds: ["split"],
  _createdAt: "2026-07-01T10:00:00Z",
  _updatedAt: "2026-07-01T10:00:00Z",
  ...overrides,
});

describe("ResourceList", () => {
  it("renders a card for each resource", () => {
    const resources = [
      makeResource({ id: "1", title: "Split PDF guide", slug: "split-pdf" }),
      makeResource({ id: "2", title: "Compress PDF guide", slug: "compress-pdf" }),
    ];
    render(<ResourceList resources={resources} />);
    expect(screen.getByText("Split PDF guide")).toBeInTheDocument();
    expect(screen.getByText("Compress PDF guide")).toBeInTheDocument();
  });

  it("renders the excerpt on each card", () => {
    render(<ResourceList resources={[makeResource()]} />);
    expect(screen.getByText(/divide a PDF into separate files/i)).toBeInTheDocument();
  });

  it("renders a 'Read article' link pointing to /resources/[slug]", () => {
    render(<ResourceList resources={[makeResource()]} />);
    const link = screen.getByRole("link", { name: /Read article/i });
    expect(link).toHaveAttribute("href", "/resources/how-to-split-a-pdf");
  });

  it("shows a formatted publication date", () => {
    render(<ResourceList resources={[makeResource()]} />);
    expect(screen.getByText(/2026/i)).toBeInTheDocument();
  });

  it("renders an empty state message when there are no resources", () => {
    render(<ResourceList resources={[]} />);
    expect(screen.getByText(/No articles yet/i)).toBeInTheDocument();
  });
});
