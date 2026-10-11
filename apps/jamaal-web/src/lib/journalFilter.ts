/**
 * The Journal index's filter: All, Story, Guides, How-to. Cards carry
 * `data-category`; buttons carry `data-filter`. Without JavaScript every card is
 * shown and the buttons do nothing.
 */
export function setupJournalFilter(root: ParentNode = document): void {
  const container = root.querySelector<HTMLElement>("[data-journal]");
  if (!container) return;
  const buttons = [...container.querySelectorAll<HTMLButtonElement>("[data-filter]")];
  const cards = [...container.querySelectorAll<HTMLElement>("[data-category]")];
  const empty = container.querySelector<HTMLElement>("[data-empty]");

  const apply = (filter: string) => {
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    let shown = 0;
    for (const card of cards) {
      const visible = filter === "All" || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    if (empty) empty.hidden = shown > 0;
  };

  for (const button of buttons) button.addEventListener("click", () => apply(button.dataset.filter ?? "All"));
}
