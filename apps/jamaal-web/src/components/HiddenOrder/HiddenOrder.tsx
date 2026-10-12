import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { HomeModel } from "../../lib/cms/models";
import styles from "./HiddenOrder.module.css";

/**
 * Four tasks sit on a grid of "matters" and "due", then slide into one ordered
 * list the first time the section is mostly in view. The grid is never named;
 * the list in the DOM is always in the right order, so screen readers get the
 * result either way. With reduced motion the list is simply shown.
 */
export default function HiddenOrder({ order, children }: Readonly<{ order: HomeModel["order"]; children?: ReactNode }>) {
  const [sorted, setSorted] = useState(true);
  const [animate, setAnimate] = useState(false);
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window) || !moduleRef.current) return;

    // Start from the grid, without a transition, then sort once when it is on screen.
    setSorted(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setAnimate(true);
        setSorted(true);
      },
      { threshold: 0.6 },
    );
    observer.observe(moduleRef.current);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setSorted((s) => !s);
  }

  const rootClass = [styles.module, sorted ? styles.sorted : "", animate ? styles.animate : ""].filter(Boolean).join(" ");

  return (
    <>
      <div className="stack stack--tight">
        {children}
        <button type="button" className={styles.button} onClick={toggle}>
          {sorted ? order.buttons.grid : order.buttons.sort}
        </button>
      </div>
      <div ref={moduleRef} className={rootClass}>
        <div className={styles.grid} aria-hidden="true">
          <i /> <i /> <i /> <i />
        </div>
        <span className={`${styles.axis} ${styles.axisY}`} aria-hidden="true">
          {order.axes.matters}
        </span>
        <span className={`${styles.axis} ${styles.axisX}`} aria-hidden="true">
          {order.axes.due}
        </span>
        <span className={`${styles.axis} ${styles.later}`} aria-hidden="true">
          <i />
          {order.axes.later}
        </span>
        <ol className={styles.chips}>
          {order.chips.map((chip) => (
            <li
              key={chip.title}
              className={styles.chip}
              style={{ "--gx": chip.gx, "--gy": `${chip.gy}%`, "--ly": `${chip.ly}%` } as CSSProperties}
            >
              <div className={styles.card}>
                <span className={styles.n} aria-hidden="true">
                  {chip.n}
                </span>
                <div>
                  <span className={styles.title}>{chip.title}</span>
                  <span className={styles.meta}>{chip.meta}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
