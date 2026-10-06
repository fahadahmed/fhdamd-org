import { useState } from "react";
import styles from "./NightPlanning.module.css";

export interface NightPlanningStep {
  label: string;
  alt: string;
  /** Optimised 1x and 2x URLs, built by Astro in the page. */
  src: string;
  srcSet: string;
}

export interface NightPlanningProps {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  steps: NightPlanningStep[];
  /** How long each step stays on screen before advancing, in milliseconds. */
  dwell: number;
  width: number;
  height: number;
}

/**
 * The dark Night Planning section: a phone that cycles through five screens
 * and a step list that drives it. Each step shows a progress bar that fills
 * over `dwell` ms; when the bar finishes the next step opens. Hovering the
 * phone or focusing the list pauses the bar (see the CSS), and reduced motion
 * stops the auto-advance so people choose a step instead.
 */
export default function NightPlanning({
  eyebrow,
  title,
  accent,
  body,
  steps,
  dwell,
  width,
  height,
}: Readonly<NightPlanningProps>) {
  const [current, setCurrent] = useState(0);

  const advance = () => setCurrent((i) => (i + 1) % steps.length);

  return (
    <section className={styles.section} aria-labelledby="night-planning-title">
      <div className={styles.inner}>
        <div className={styles.phoneCol}>
          <div className={styles.phone}>
            {steps.map((step, i) => (
              <img
                key={step.label}
                className={[
                  styles.screen,
                  i === current ? styles.screenOn : i < current ? styles.screenBefore : styles.screenAfter,
                ].join(" ")}
                src={step.src}
                srcSet={step.srcSet}
                alt={i === current ? step.alt : ""}
                aria-hidden={i === current ? undefined : true}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>

        <div className={styles.text}>
          <div className={`th-label th-eyebrow ${styles.eyebrow}`}>{eyebrow}</div>
          <h2 id="night-planning-title" className={styles.title}>
            {title} <em>{accent}</em>
          </h2>
          <p className={styles.body}>{body}</p>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.label} className={styles.step}>
                <button
                  type="button"
                  className={`${styles.stepButton} ${i === current ? styles.stepOn : ""}`}
                  aria-current={i === current ? "step" : undefined}
                  onClick={() => setCurrent(i)}
                >
                  <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
                {i === current && (
                  <span
                    className={styles.bar}
                    data-testid="progress"
                    style={{ animationDuration: `${dwell}ms` }}
                    onAnimationEnd={advance}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
