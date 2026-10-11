import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { order } from "../../data/home";
import HiddenOrder from "./HiddenOrder";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let trigger: Callback | undefined;
const disconnect = vi.fn();

function setup({ reduced = false, observer = true } = {}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as never;
  if (observer) {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: Callback) {
          trigger = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
  }
  return render(
    <HiddenOrder>
      <h2>The sorting you never have to do.</h2>
    </HiddenOrder>,
  );
}

const module = (container: HTMLElement) => container.querySelector("[class*=module]") as HTMLElement;
const isSorted = (container: HTMLElement) => module(container).className.includes("sorted");

describe("HiddenOrder", () => {
  beforeEach(() => {
    trigger = undefined;
    disconnect.mockClear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders the copy it is given and the tasks in the right order", () => {
    setup();
    expect(screen.getByRole("heading", { name: /never have to do/ })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toHaveLength(order.chips.length);
    expect(items[0]).toContain("Draft the architecture review");
    expect(items[3]).toContain("Sort the photo library");
  });

  it("starts as a grid and sorts once, when the section is mostly on screen", () => {
    const { container } = setup();
    expect(isSorted(container)).toBe(false);
    expect(screen.getByRole("button", { name: order.buttons.sort })).toBeInTheDocument();

    act(() => trigger?.([{ isIntersecting: false }]));
    expect(isSorted(container)).toBe(false);

    act(() => trigger?.([{ isIntersecting: true }]));
    expect(isSorted(container)).toBe(true);
    expect(module(container).className).toContain("animate");
    expect(screen.getByRole("button", { name: order.buttons.grid })).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
  });

  it("shows the ordered list straight away with reduced motion, without animating", () => {
    const { container } = setup({ reduced: true });
    expect(isSorted(container)).toBe(true);
    expect(module(container).className).not.toContain("animate");
    expect(trigger).toBeUndefined();
  });

  it("shows the ordered list when IntersectionObserver is not available", () => {
    const { container } = setup({ observer: false });
    expect(isSorted(container)).toBe(true);
  });

  it("the button flips between the list and the grid", async () => {
    const { container } = setup({ reduced: true });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: order.buttons.grid }));
    expect(isSorted(container)).toBe(false);
    expect(screen.getByRole("button", { name: order.buttons.sort })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: order.buttons.sort }));
    expect(isSorted(container)).toBe(true);
  });

  it("animates the button's flip when motion is allowed", async () => {
    const { container } = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: order.buttons.sort }));
    expect(isSorted(container)).toBe(true);
    expect(module(container).className).toContain("animate");
  });

  it("hides the grid labels from screen readers", () => {
    const { container } = setup();
    for (const el of container.querySelectorAll("[class*=axis]")) expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
