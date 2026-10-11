/**
 * Night Planning's five steps: choosing a step shows its screen on the phone.
 * Steps are buttons (`[data-step]`), screens are images (`[data-step-img]`).
 * Only the showing screen is exposed to screen readers.
 */
export function setupStepper(root: ParentNode = document): void {
  const container = root.querySelector<HTMLElement>("[data-stepper]");
  if (!container) return;
  const steps = [...container.querySelectorAll<HTMLElement>("[data-step]")];
  const screens = [...container.querySelectorAll<HTMLElement>("[data-step-img]")];

  const choose = (index: number) => {
    steps.forEach((step, i) => {
      if (i === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    screens.forEach((screen, i) => {
      screen.toggleAttribute("data-active", i === index);
      screen.setAttribute("aria-hidden", String(i !== index));
    });
  };

  steps.forEach((step, i) => step.addEventListener("click", () => choose(i)));
}
