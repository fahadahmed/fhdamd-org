import type { HTMLAttributes } from "react";
import styles from "./Stepper.module.css";

export interface StepperStep {
  label: string;
}

export type StepStatus = "done" | "active" | "upcoming";

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
  currentStep: number; /* 0-indexed */
}

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return "done";
  if (index === current) return "active";
  return "upcoming";
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function Stepper({ steps, currentStep, className, ...rest }: StepperProps) {
  return (
    <div
      className={[styles.stepper, className].filter(Boolean).join(" ")}
      aria-label="Progress"
      {...rest}
    >
      {/* Connector track */}
      <div className={styles.track} aria-hidden="true" />

      {steps.map((step, i) => {
        const status = getStatus(i, currentStep);
        return (
          <div
            key={i}
            className={[styles.node, styles[status]].join(" ")}
          >
            <div
              className={styles.circle}
              aria-label={`Step ${i + 1}: ${step.label} — ${status}`}
            >
              {status === "done" ? (
                <CheckIcon />
              ) : (
                <span className={styles.number}>{i + 1}</span>
              )}
            </div>
            <span className={styles.label}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
