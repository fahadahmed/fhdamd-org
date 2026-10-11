import { beforeEach, describe, expect, it } from "vitest";
import { setupStepper } from "./stepper";

const html = (count: number) => `
  <div data-stepper>
    ${Array.from({ length: count }, (_, i) => `<button data-step ${i === 0 ? 'aria-current="step"' : ""}>Step ${i + 1}</button>`).join("")}
    ${Array.from({ length: count }, (_, i) => `<img data-step-img ${i === 0 ? "data-active" : ""} aria-hidden="${i !== 0}" alt="Screen ${i + 1}">`).join("")}
  </div>`;

const step = (i: number) => document.querySelectorAll<HTMLElement>("[data-step]")[i];
const screen = (i: number) => document.querySelectorAll<HTMLElement>("[data-step-img]")[i];

describe("setupStepper", () => {
  beforeEach(() => {
    document.body.innerHTML = html(5);
    setupStepper();
  });

  it("shows the screen for the step that is chosen", () => {
    step(3).click();
    expect(step(3)).toHaveAttribute("aria-current", "step");
    expect(screen(3)).toHaveAttribute("data-active");
    expect(screen(3)).toHaveAttribute("aria-hidden", "false");
  });

  it("leaves exactly one step current and one screen showing", () => {
    step(2).click();
    step(4).click();
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-step-img][data-active]")).toHaveLength(1);
    expect(document.querySelectorAll('[data-step-img][aria-hidden="true"]')).toHaveLength(4);
    expect(step(2)).not.toHaveAttribute("aria-current");
  });

  it("can go back to an earlier step", () => {
    step(3).click();
    step(0).click();
    expect(screen(0)).toHaveAttribute("data-active");
    expect(screen(3)).not.toHaveAttribute("data-active");
  });

  it("does nothing on a page without the stepper", () => {
    document.body.innerHTML = "";
    expect(() => setupStepper()).not.toThrow();
  });
});
