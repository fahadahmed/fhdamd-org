import type { FormEvent } from "react";
import { Stack, Cluster, Stepper, Button, FormSuccessPanel } from "@fhdamd/threads";
import { FieldRenderer } from "../forms/FieldRenderer";
import { useTransferWizard } from "./useTransferWizard";
import { extractStepValues } from "../../lib/forms/extractStepValues";

export function TransferWizard() {
  const { activeSteps, currentStep, stepIndex, values, errors, completed, goNext, goBack } = useTransferWizard();

  if (completed) {
    return (
      <FormSuccessPanel
        title="Booking details captured."
        message="This is a demo — no real booking was made and nothing was sent anywhere. Refresh the page to try it again."
      />
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    goNext(extractStepValues(formData, currentStep.fields));
  }

  return (
    <Stack gap={6}>
      <Stepper steps={activeSteps.map((step) => ({ label: step.title }))} currentStep={stepIndex} />

      <form key={currentStep.id} onSubmit={handleSubmit}>
        <Stack gap={5}>
          {currentStep.fields.map((field) => (
            <FieldRenderer key={field.name} field={field} defaultValue={values[field.name]} error={errors[field.name]} />
          ))}

          <Cluster gap={3}>
            {stepIndex > 0 && (
              <Button type="button" variant="ghost" onClick={goBack}>
                Back
              </Button>
            )}
            <Button type="submit" variant="solid-ink">
              {stepIndex === activeSteps.length - 1 ? "Submit" : "Next"}
            </Button>
          </Cluster>
        </Stack>
      </form>
    </Stack>
  );
}
