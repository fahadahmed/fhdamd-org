"use client";
import { useEffect, useState, type RefObject } from "react";
import styles from "./ReadingProgressBar.module.css";

export interface ReadingProgressBarProps {
  /** Ref to the article/content element whose read-through progress should be tracked */
  targetRef: RefObject<HTMLElement | null>;
}

export function ReadingProgressBar({ targetRef }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [targetRef]);

  return <div className={styles.bar} style={{ width: `${progress}%` }} aria-hidden="true" />;
}
