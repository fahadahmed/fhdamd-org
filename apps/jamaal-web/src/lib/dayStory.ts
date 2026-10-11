interface Deps {
  doc: Document;
  /** Defaults to the browser's IntersectionObserver; injected in tests. */
  observer?: typeof IntersectionObserver;
}

/**
 * Keeps "A day with Jamaal" in step with the chapter being read. The chapter
 * crossing the middle of the screen sets `data-chapter` on the section (which
 * changes the background and ink), and shows its layer in the sticky stage.
 * Layers that aren't showing are hidden from screen readers.
 */
export function setupDayStory({ doc, observer = globalThis.IntersectionObserver }: Deps): void {
  const section = doc.getElementById("day");
  if (!section || !observer) return;
  const chapters = [...section.querySelectorAll<HTMLElement>("[data-ch]")];
  const layers = [...section.querySelectorAll<HTMLElement>("[data-layer]")];

  const activate = (index: number) => {
    section.dataset.chapter = String(index);
    for (const layer of layers) {
      const on = Number(layer.dataset.layer) === index;
      layer.toggleAttribute("data-active", on);
      layer.setAttribute("aria-hidden", String(!on));
    }
  };

  const io = new observer(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(Number((entry.target as HTMLElement).dataset.ch));
      }
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  for (const chapter of chapters) io.observe(chapter);
}
