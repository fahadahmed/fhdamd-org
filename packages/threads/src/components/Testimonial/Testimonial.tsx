import type { HTMLAttributes } from "react";
import styles from "./Testimonial.module.css";

export interface TestimonialProps extends HTMLAttributes<HTMLDivElement> {
  quote: string;
  attribution: string;
}

export function Testimonial({ quote, attribution, className, ...rest }: TestimonialProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      <p className={styles.quote}>{quote}</p>
      <div className={styles.attribution}>{attribution}</div>
    </div>
  );
}
