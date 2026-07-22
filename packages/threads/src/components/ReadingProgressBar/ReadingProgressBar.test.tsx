import { createRef } from "react";
import { render, fireEvent } from "@testing-library/react";
import { ReadingProgressBar } from "./ReadingProgressBar";

function mockLayout(el: HTMLElement, { top, offsetHeight, innerHeight }: { top: number; offsetHeight: number; innerHeight: number }) {
  el.getBoundingClientRect = () => ({ top } as DOMRect);
  Object.defineProperty(el, "offsetHeight", { value: offsetHeight, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
}

describe("ReadingProgressBar", () => {
  it("renders at 0% width when nothing has scrolled", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    mockLayout(target, { top: 0, offsetHeight: 2000, innerHeight: 800 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, "current", { value: target, writable: true });

    const { container } = render(<ReadingProgressBar targetRef={ref} />);
    expect((container.firstChild as HTMLElement).style.width).toBe("0%");
  });

  it("computes progress from the target's scroll position on mount", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    // total scrollable = 2000 - 800 = 1200; scrolled halfway = -top of -600 → 50%
    mockLayout(target, { top: -600, offsetHeight: 2000, innerHeight: 800 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, "current", { value: target, writable: true });

    const { container } = render(<ReadingProgressBar targetRef={ref} />);
    expect((container.firstChild as HTMLElement).style.width).toBe("50%");
  });

  it("recomputes on scroll", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    mockLayout(target, { top: 0, offsetHeight: 2000, innerHeight: 800 });
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, "current", { value: target, writable: true });

    const { container } = render(<ReadingProgressBar targetRef={ref} />);
    mockLayout(target, { top: -1200, offsetHeight: 2000, innerHeight: 800 });
    fireEvent.scroll(window);
    expect((container.firstChild as HTMLElement).style.width).toBe("100%");
  });

  it("does not throw when the target ref has no current element", () => {
    const ref = createRef<HTMLDivElement>();
    expect(() => render(<ReadingProgressBar targetRef={ref} />)).not.toThrow();
  });

  it("is hidden from the accessibility tree", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ReadingProgressBar targetRef={ref} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
