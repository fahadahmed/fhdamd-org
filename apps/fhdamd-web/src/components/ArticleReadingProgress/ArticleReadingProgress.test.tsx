import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleReadingProgress } from "./ArticleReadingProgress";

describe("ArticleReadingProgress", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("resolves the tracked element via the given selector", () => {
    document.body.innerHTML = '<article class="post-article"></article>';
    render(<ArticleReadingProgress targetSelector=".post-article" />);
    expect(screen.getByTestId("reading-progress-bar")).toHaveAttribute(
      "data-has-target",
      "true",
    );
  });

  it("passes no target when the selector matches nothing on the page", () => {
    render(<ArticleReadingProgress targetSelector=".missing-selector" />);
    expect(screen.getByTestId("reading-progress-bar")).toHaveAttribute(
      "data-has-target",
      "false",
    );
  });
});
