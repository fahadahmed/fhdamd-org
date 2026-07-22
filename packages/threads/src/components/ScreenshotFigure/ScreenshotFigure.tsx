import type { HTMLAttributes } from "react";
import styles from "./ScreenshotFigure.module.css";

export interface ScreenshotFigureProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  /** Shown below a real image, or as the placeholder label when src is omitted */
  caption?: string;
}

const PhotoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

export function ScreenshotFigure({ src, alt, caption, className, ...rest }: ScreenshotFigureProps) {
  if (!src) {
    return (
      <div className={[styles.placeholder, className].filter(Boolean).join(" ")} {...rest}>
        <PhotoIcon />
        {caption && <span>{caption}</span>}
      </div>
    );
  }

  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")} {...rest}>
      <img className={styles.image} src={src} alt={alt ?? ""} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
