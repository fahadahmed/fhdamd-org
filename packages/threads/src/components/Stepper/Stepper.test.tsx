import { render, screen } from "@testing-library/react";
import { Stepper } from "./Stepper";

const steps = [
  { label: "Today review" },
  { label: "Carry forward" },
  { label: "Build tomorrow" },
];

describe("Stepper", () => {
  it("renders all step labels", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByText("Today review")).toBeInTheDocument();
    expect(screen.getByText("Carry forward")).toBeInTheDocument();
    expect(screen.getByText("Build tomorrow")).toBeInTheDocument();
  });

  it("has a progress landmark", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByLabelText("Progress")).toBeInTheDocument();
  });

  it("shows step numbers for non-done steps", () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByText("2")).toBeInTheDocument(); // steps 2 and 3 show numbers
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows check icon for done steps (no number)", () => {
    render(<Stepper steps={steps} currentStep={2} />);
    // Steps 0 and 1 are done — their aria-labels contain "done"
    const doneStep = screen.getByLabelText(/Step 1.*done/i);
    expect(doneStep).toBeInTheDocument();
  });

  it("marks active step correctly", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    const activeStep = screen.getByLabelText(/Step 2.*active/i);
    expect(activeStep).toBeInTheDocument();
  });

  it("marks upcoming steps correctly", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    const upcomingStep = screen.getByLabelText(/Step 3.*upcoming/i);
    expect(upcomingStep).toBeInTheDocument();
  });

  it("renders correct step number in aria-label", () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByLabelText(/Step 1.*active/i)).toBeInTheDocument();
  });
});

describe("Stepper — semantics", () => {
  it("groups the steps, marks the active one as the current step and labels each circle as an image", () => {
    const { container } = render(<Stepper steps={[{ label: "One" }, { label: "Two" }, { label: "Three" }]} currentStep={1} />);
    expect(screen.getByRole("group", { name: "Progress" })).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Step 2: Two — active" })).toBeInTheDocument();
  });
});
