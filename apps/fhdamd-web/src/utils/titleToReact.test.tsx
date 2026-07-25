import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { titleToReact, markupToHtml } from "./titleToReact";

describe("titleToReact", () => {
  it("returns the plain string unchanged when there is no emphasis marker", () => {
    expect(titleToReact("No emphasis here")).toBe("No emphasis here");
  });

  it("wraps a single *marked* segment in an <em>", () => {
    const { container } = render(
      <>{titleToReact("Software, built and *owned by you.*")}</>,
    );
    const em = container.querySelector("em");
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe("owned by you.");
    expect(container.textContent).toBe("Software, built and owned by you.");
  });

  it("applies emStyle to the <em> element", () => {
    const { container } = render(
      <>{titleToReact("*accent*", { color: "red" })}</>,
    );
    const em = container.querySelector("em");
    expect(em).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });

  it("supports multiple emphasized segments", () => {
    const { container } = render(<>{titleToReact("*one* and *two*")}</>);
    const ems = container.querySelectorAll("em");
    expect(ems).toHaveLength(2);
    expect(ems[0].textContent).toBe("one");
    expect(ems[1].textContent).toBe("two");
  });
});

describe("markupToHtml", () => {
  it("returns the plain string unchanged when there is no emphasis marker", () => {
    expect(markupToHtml("No emphasis here")).toBe("No emphasis here");
  });

  it("converts a *marked* segment into an <em> tag", () => {
    expect(markupToHtml("Ready to start? *Get a proposal.*")).toBe(
      "Ready to start? <em>Get a proposal.</em>",
    );
  });

  it("supports multiple emphasized segments", () => {
    expect(markupToHtml("*one* and *two*")).toBe(
      "<em>one</em> and <em>two</em>",
    );
  });
});
