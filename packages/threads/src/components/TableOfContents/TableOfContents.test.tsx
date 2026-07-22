import { act, render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { TableOfContents } from "./TableOfContents";

const items = [
  { id: "problem", label: "The problem" },
  { id: "approach", label: "The approach" },
];

let observedElements: Element[] = [];
let capturedCallback: IntersectionObserverCallback | null = null;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    capturedCallback = callback;
  }
  observe(el: Element) {
    observedElements.push(el);
  }
  disconnect() {
    observedElements = [];
  }
  unobserve() {}
}

/**
 * Both the desktop sidebar and the mobile bar render at once (CSS media
 * queries aren't evaluated in the test environment) — scope queries to
 * whichever variant is under test. Uses data-testid rather than role
 * queries throughout this subtree: happy-dom doesn't compute accessible
 * roles ("navigation", "link", "button") for elements inside a <nav>,
 * even with a valid aria-label — confirmed against the raw DOM, which
 * renders exactly as expected.
 */
const desktop = () => within(screen.getByTestId("toc-desktop"));
const mobile = () => within(screen.getByTestId("toc-mobile"));
const mobileLink = (name: string) => mobile().getByText(name, { selector: "a" }) as HTMLAnchorElement;

describe("TableOfContents", () => {
  beforeEach(() => {
    observedElements = [];
    capturedCallback = null;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    for (const item of items) {
      const heading = document.createElement("h2");
      heading.id = item.id;
      document.body.appendChild(heading);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("renders a link for every item in both the desktop sidebar and the mobile dropdown", () => {
    render(<TableOfContents items={items} />);
    expect(desktop().getByRole("link", { name: "The problem" })).toHaveAttribute("href", "#problem");
    expect(mobileLink("The approach")).toHaveAttribute("href", "#approach");
  });

  it("renders the default label", () => {
    render(<TableOfContents items={items} />);
    expect(desktop().getByText("On this page")).toBeInTheDocument();
  });

  it("respects a custom label", () => {
    render(<TableOfContents items={items} label="Contents" />);
    expect(desktop().getByText("Contents")).toBeInTheDocument();
  });

  it("observes the DOM headings matching each item's id", () => {
    render(<TableOfContents items={items} />);
    expect(observedElements.map((el) => el.id).sort()).toEqual(["approach", "problem"]);
  });

  it("marks the intersecting heading's link as active in both variants", () => {
    render(<TableOfContents items={items} />);
    const target = document.getElementById("approach")!;
    act(() => {
      capturedCallback!(
        [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(desktop().getByRole("link", { name: "The approach" }).className).toMatch(/active/);
    expect(desktop().getByRole("link", { name: "The problem" }).className).not.toMatch(/active/);
    expect(mobileLink("The approach").className).toMatch(/active/);
  });

  it("merges custom className onto the desktop sidebar", () => {
    render(<TableOfContents items={items} className="custom" data-testid="toc" />);
    expect(screen.getByTestId("toc")).toHaveClass("custom");
  });

  describe("mobile dropdown", () => {
    it("starts closed and shows the default label as the active section", () => {
      render(<TableOfContents items={items} />);
      const trigger = mobile().getByTestId("toc-mobile-trigger");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(mobile().getByTestId("toc-mobile-active-label")).toHaveTextContent("On this page");
    });

    it("opens on trigger click", () => {
      render(<TableOfContents items={items} />);
      const trigger = mobile().getByTestId("toc-mobile-trigger");
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("shows the active heading's label on the collapsed trigger once one intersects", () => {
      render(<TableOfContents items={items} />);
      const target = document.getElementById("approach")!;
      act(() => {
        capturedCallback!(
          [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });
      expect(mobile().getByTestId("toc-mobile-active-label")).toHaveTextContent("The approach");
    });

    it("closes when a link is clicked", () => {
      render(<TableOfContents items={items} />);
      fireEvent.click(mobile().getByTestId("toc-mobile-trigger"));
      fireEvent.click(mobileLink("The problem"));
      expect(mobile().getByTestId("toc-mobile-trigger")).toHaveAttribute("aria-expanded", "false");
    });

    it("closes on an outside click", () => {
      render(
        <div>
          <TableOfContents items={items} />
          <button>outside</button>
        </div>
      );
      const trigger = mobile().getByTestId("toc-mobile-trigger");
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      fireEvent.click(screen.getByText("outside"));
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});
