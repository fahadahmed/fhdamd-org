import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupDayStory } from "./dayStory";

type Entry = { isIntersecting: boolean; target: Element };
let callback: ((entries: Entry[]) => void) | undefined;
const observe = vi.fn();
let options: IntersectionObserverInit | undefined;

class FakeObserver {
  constructor(cb: (entries: Entry[]) => void, opts?: IntersectionObserverInit) {
    callback = cb;
    options = opts;
  }
  observe = observe;
}

const setup = (chapters = 3) => {
  document.body.innerHTML = `
    <section id="day" data-chapter="0">
      ${Array.from({ length: chapters }, (_, i) => `<article data-ch="${i}"></article>`).join("")}
      ${Array.from({ length: chapters }, (_, i) => `<div data-layer="${i}" ${i === 0 ? "data-active" : ""} aria-hidden="${i === 0 ? "false" : "true"}"></div>`).join("")}
    </section>`;
  setupDayStory({ doc: document, observer: FakeObserver as never });
};

const chapter = (i: number) => document.querySelector(`[data-ch="${i}"]`)!;
const layer = (i: number) => document.querySelector<HTMLElement>(`[data-layer="${i}"]`)!;
const section = () => document.getElementById("day")!;

describe("setupDayStory", () => {
  beforeEach(() => {
    callback = undefined;
    options = undefined;
    observe.mockClear();
  });

  it("watches every chapter, in a band across the middle of the screen", () => {
    setup(3);
    expect(observe).toHaveBeenCalledTimes(3);
    expect(options).toEqual({ rootMargin: "-45% 0px -45% 0px" });
  });

  it("sets the chapter on the section and shows only that layer", () => {
    setup(3);
    callback?.([{ isIntersecting: true, target: chapter(2) }]);
    expect(section().dataset.chapter).toBe("2");
    expect(layer(2)).toHaveAttribute("data-active");
    expect(layer(2)).toHaveAttribute("aria-hidden", "false");
    expect(layer(0)).not.toHaveAttribute("data-active");
    expect(layer(0)).toHaveAttribute("aria-hidden", "true");
    expect(layer(1)).toHaveAttribute("aria-hidden", "true");
  });

  it("ignores a chapter that is leaving the band", () => {
    setup(3);
    callback?.([{ isIntersecting: false, target: chapter(1) }]);
    expect(section().dataset.chapter).toBe("0");
  });

  it("follows the reader back up", () => {
    setup(3);
    callback?.([{ isIntersecting: true, target: chapter(2) }]);
    callback?.([{ isIntersecting: true, target: chapter(1) }]);
    expect(section().dataset.chapter).toBe("1");
    expect(layer(1)).toHaveAttribute("data-active");
    expect(layer(2)).not.toHaveAttribute("data-active");
  });

  it("does nothing on a page without the section", () => {
    document.body.innerHTML = "";
    expect(() => setupDayStory({ doc: document, observer: FakeObserver as never })).not.toThrow();
    expect(observe).not.toHaveBeenCalled();
  });

  it("does nothing in a browser without IntersectionObserver", () => {
    document.body.innerHTML = '<section id="day" data-chapter="0"><article data-ch="0"></article></section>';
    expect(() => setupDayStory({ doc: document, observer: undefined })).not.toThrow();
    expect(section().dataset.chapter).toBe("0");
  });
});
