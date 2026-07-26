import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostGrid } from "./PostGrid";
import type { BlogPost } from "../../content/types";

const posts: BlogPost[] = [
  {
    slug: "a",
    title: "Post A",
    description: "Desc A",
    date: "Jan 2026",
    tags: ["product"],
  },
  {
    slug: "b",
    title: "Post B",
    description: "Desc B",
    date: "Feb 2026",
    tags: ["product", "dev"],
  },
  {
    slug: "c",
    title: "Post C",
    description: "Desc C",
    date: "Mar 2026",
    tags: ["design"],
  },
];

describe("PostGrid", () => {
  it("renders every post when no filter is applied", () => {
    render(<PostGrid posts={posts} />);
    expect(screen.getByText("Post A")).toBeInTheDocument();
    expect(screen.getByText("Post B")).toBeInTheDocument();
    expect(screen.getByText("Post C")).toBeInTheDocument();
  });

  it("links each card to its post slug", () => {
    render(<PostGrid posts={posts} />);
    expect(screen.getByText("Post A").closest("a")).toHaveAttribute(
      "href",
      "/blog/a",
    );
  });

  it("filters to only posts matching the selected tag", async () => {
    const user = userEvent.setup();
    render(<PostGrid posts={posts} />);

    await user.click(screen.getByRole("button", { name: "Design" }));

    expect(screen.queryByText("Post A")).not.toBeInTheDocument();
    expect(screen.queryByText("Post B")).not.toBeInTheDocument();
    expect(screen.getByText("Post C")).toBeInTheDocument();
  });

  it("matches a post that has the filtered tag among several", async () => {
    const user = userEvent.setup();
    render(<PostGrid posts={posts} />);

    await user.click(screen.getByRole("button", { name: "Dev" }));

    expect(screen.queryByText("Post A")).not.toBeInTheDocument();
    expect(screen.getByText("Post B")).toBeInTheDocument();
    expect(screen.queryByText("Post C")).not.toBeInTheDocument();
  });

  it("shows everything again after selecting All posts", async () => {
    const user = userEvent.setup();
    render(<PostGrid posts={posts} />);

    await user.click(screen.getByRole("button", { name: "Design" }));
    await user.click(screen.getByRole("button", { name: "All posts" }));

    expect(screen.getByText("Post A")).toBeInTheDocument();
    expect(screen.getByText("Post B")).toBeInTheDocument();
    expect(screen.getByText("Post C")).toBeInTheDocument();
  });

  it("derives tag pills from the posts' distinct tags rather than a hardcoded list", () => {
    render(<PostGrid posts={posts} />);
    expect(screen.getByRole("button", { name: "Product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dev" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Design" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Architecture" }),
    ).not.toBeInTheDocument();
  });

  it("falls back to the raw tag string when a post's tag has no known label", () => {
    const untaggedPost: BlogPost = {
      slug: "d",
      title: "Post D",
      description: "Desc D",
      date: "Apr 2026",
      tags: ["misc"],
    };
    render(<PostGrid posts={[untaggedPost]} />);

    expect(screen.getAllByText("misc")).toHaveLength(2); // tag pill + badge
  });
});
