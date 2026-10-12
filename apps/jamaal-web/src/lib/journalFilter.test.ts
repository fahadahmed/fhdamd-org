import { beforeEach, describe, expect, it } from "vitest";
import { setupJournalFilter } from "./journalFilter";

const html = `
  <div data-journal>
    <button data-filter="All" aria-pressed="true">All</button>
    <button data-filter="Story" aria-pressed="false">Story</button>
    <button data-filter="Guides" aria-pressed="false">Guides</button>
    <button data-filter="How-to" aria-pressed="false">How-to</button>
    <a data-category="Story">Why</a>
    <a data-category="Guides">Salah</a>
    <a data-category="How-to">Night</a>
    <p data-empty hidden>Nothing here yet.</p>
  </div>`;

const button = (name: string) => document.querySelector<HTMLButtonElement>(`[data-filter="${name}"]`)!;
const card = (name: string) => document.querySelector<HTMLElement>(`[data-category="${name}"]`)!;

describe("setupJournalFilter", () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    setupJournalFilter();
  });

  it("shows only the chosen category and marks its button pressed", () => {
    button("Guides").click();
    expect(card("Guides").hidden).toBe(false);
    expect(card("Story").hidden).toBe(true);
    expect(card("How-to").hidden).toBe(true);
    expect(button("Guides")).toHaveAttribute("aria-pressed", "true");
    expect(button("All")).toHaveAttribute("aria-pressed", "false");
  });

  it("All brings everything back", () => {
    button("Story").click();
    button("All").click();
    for (const name of ["Story", "Guides", "How-to"]) expect(card(name).hidden).toBe(false);
    expect(button("All")).toHaveAttribute("aria-pressed", "true");
  });

  it("says so when a category has nothing", () => {
    document.body.innerHTML = html.replace('<a data-category="How-to">Night</a>', "");
    setupJournalFilter();
    button("How-to").click();
    expect(document.querySelector<HTMLElement>("[data-empty]")!.hidden).toBe(false);
    button("All").click();
    expect(document.querySelector<HTMLElement>("[data-empty]")!.hidden).toBe(true);
  });

  it("does nothing on a page without the Journal", () => {
    document.body.innerHTML = "";
    expect(() => setupJournalFilter()).not.toThrow();
  });
});
