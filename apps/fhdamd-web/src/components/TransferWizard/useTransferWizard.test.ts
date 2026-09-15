import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransferWizard } from "./useTransferWizard";

const validTripStep = { tripType: "one-way", pickup: "Airport", dropoff: "Hotel" };

describe("useTransferWizard", () => {
  it("starts on the trip step with no values or errors", () => {
    const { result } = renderHook(() => useTransferWizard());

    expect(result.current.stepIndex).toBe(0);
    expect(result.current.currentStep.id).toBe("trip");
    expect(result.current.values).toEqual({});
    expect(result.current.completed).toBe(false);
  });

  it("sets per-field errors and does not advance when a step fails validation", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goNext({ tripType: "one-way", pickup: "", dropoff: "" });
    });

    expect(result.current.stepIndex).toBe(0);
    expect(result.current.errors.pickup).toBeTruthy();
    expect(result.current.errors.dropoff).toBeTruthy();
  });

  it("advances and clears errors once a step passes validation", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goNext({ tripType: "one-way", pickup: "", dropoff: "" });
    });
    act(() => {
      result.current.goNext(validTripStep);
    });

    expect(result.current.stepIndex).toBe(1);
    expect(result.current.errors).toEqual({});
    expect(result.current.values).toMatchObject(validTripStep);
  });

  it("skips the return-details step for a one-way trip", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goNext(validTripStep);
    });

    expect(result.current.currentStep.id).toBe("passengers");
    expect(result.current.activeSteps.some((step) => step.id === "return")).toBe(false);
  });

  it("includes the return-details step for a return trip", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goNext({ ...validTripStep, tripType: "return" });
    });

    expect(result.current.currentStep.id).toBe("return");
  });

  it("goBack moves to the previous step and clears errors", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goNext(validTripStep);
    });
    act(() => {
      result.current.goNext({ passengers: -1 }); // fails min(1) — leaves an error behind
    });
    expect(result.current.errors.passengers).toBeTruthy();

    act(() => {
      result.current.goBack();
    });

    expect(result.current.stepIndex).toBe(0);
    expect(result.current.errors).toEqual({});
  });

  it("goBack does not go past the first step", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.stepIndex).toBe(0);
  });

  it("marks the wizard completed after the final step passes validation", () => {
    const { result } = renderHook(() => useTransferWizard());

    act(() => result.current.goNext(validTripStep));
    act(() => result.current.goNext({ passengers: 2, needsChildSeat: false }));
    act(() => result.current.goNext({ vehicleClass: "sedan", meetAndGreet: false, flightTracking: false }));

    expect(result.current.completed).toBe(false);

    act(() =>
      result.current.goNext({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0400000000",
        notes: "",
      }),
    );

    expect(result.current.completed).toBe(true);
  });
});
