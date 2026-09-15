import { useState } from "react";
import { transferFormSteps } from "../../lib/forms/transferConfig";
import { stepToZodSchema } from "../../lib/forms/configToZod";

export function useTransferWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  // Recomputed from current answers on every render — not fixed at form
  // start — so a step's skipIf can make it appear/disappear mid-flow.
  const activeSteps = transferFormSteps.filter((step) => !step.skipIf?.(values));
  const currentStep = activeSteps[stepIndex];
  const isLastStep = stepIndex === activeSteps.length - 1;

  function goNext(stepValues: Record<string, unknown>) {
    const result = stepToZodSchema(currentStep).safeParse(stepValues);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in fieldErrors)) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setValues((prev) => ({ ...prev, ...result.data }));

    if (isLastStep) {
      setCompleted(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return { activeSteps, currentStep, stepIndex, values, errors, completed, goNext, goBack };
}
