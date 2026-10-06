import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NightPlanning from "./NightPlanning";

const steps = ["Review today", "Carry forward", "Build tomorrow", "Check the load", "Close the day"].map(
  (label, i) => ({
    label,
    alt: `Step ${i + 1}: ${label}`,
    src: `/s${i + 1}.webp`,
    srcSet: `/s${i + 1}.webp 1x, /s${i + 1}@2x.webp 2x`,
  }),
);

function setup() {
  return render(
    <NightPlanning
      eyebrow="Night Planning"
      title="Five short steps,"
      accent="then rest."
      body="Look back at today."
      steps={steps}
      dwell={4500}
      width={320}
      height={694}
    />,
  );
}

const stepButton = (name: string) => screen.getByRole("button", { name: new RegExp(name) });

// jsdom has no AnimationEvent, so React listens for the prefixed name there;
// fire both so the test does not depend on which one React picked.
function endAnimation(element: HTMLElement) {
  for (const type of ["animationend", "webkitAnimationEnd"]) {
    fireEvent(element, new Event(type, { bubbles: true }));
  }
}

describe("NightPlanning", () => {
  it("renders the heading with its accent line", () => {
    setup();
    expect(screen.getByRole("heading", { level: 2, name: "Five short steps, then rest." })).toBeInTheDocument();
  });

  it("lists the five steps, numbered, with the first one current", () => {
    setup();
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(stepButton("Review today")).toHaveTextContent("01");
    expect(stepButton("Close the day")).toHaveTextContent("05");
    expect(stepButton("Review today")).toHaveAttribute("aria-current", "step");
    expect(stepButton("Carry forward")).not.toHaveAttribute("aria-current");
  });

  it("opens the step that is clicked", () => {
    setup();
    fireEvent.click(stepButton("Build tomorrow"));
    expect(stepButton("Build tomorrow")).toHaveAttribute("aria-current", "step");
    expect(stepButton("Review today")).not.toHaveAttribute("aria-current");
  });

  it("shows a progress bar only on the current step, running for the dwell time", () => {
    setup();
    const bars = screen.getAllByTestId("progress");
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveStyle({ animationDuration: "4500ms" });
  });

  it("advances when the progress bar finishes and wraps after the last step", () => {
    setup();
    endAnimation(screen.getByTestId("progress"));
    expect(stepButton("Carry forward")).toHaveAttribute("aria-current", "step");

    fireEvent.click(stepButton("Close the day"));
    endAnimation(screen.getByTestId("progress"));
    expect(stepButton("Review today")).toHaveAttribute("aria-current", "step");
  });

  it("describes only the visible screen to assistive technology", () => {
    const { container } = setup();
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(5);
    expect(images[0]).toHaveAttribute("alt", "Step 1: Review today");
    expect(images[0]).not.toHaveAttribute("aria-hidden");
    expect(images[1]).toHaveAttribute("alt", "");
    expect(images[1]).toHaveAttribute("aria-hidden", "true");
    expect(images[0]).toHaveAttribute("width", "320");
    expect(images[0]).toHaveAttribute("loading", "lazy");
  });
});
