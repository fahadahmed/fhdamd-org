import type { HTMLAttributes } from "react";
import styles from "./Testimonial.module.css";

interface FilledProps extends HTMLAttributes<HTMLDivElement> {
  reserved?: false;
  quote: string;
  attribution: string;
}

interface ReservedProps extends HTMLAttributes<HTMLDivElement> {
  reserved: true;
  title?: string;
  description: string;
}

export type TestimonialProps = FilledProps | ReservedProps;

const QuoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

export function Testimonial(props: TestimonialProps) {
  const { className, ...rest } = props;

  if (props.reserved) {
    const { reserved: _reserved, title = "Client testimonial — reserved", description, ...divRest } = rest as ReservedProps;
    return (
      <div className={[styles.slot, className].filter(Boolean).join(" ")} {...divRest}>
        <div className={styles.slotIcon}>
          <QuoteIcon />
        </div>
        <div>
          <div className={styles.slotTitle}>{title}</div>
          <p className={styles.slotDesc}>{description}</p>
        </div>
      </div>
    );
  }

  const { reserved: _reserved, quote, attribution, ...divRest } = rest as FilledProps;
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...divRest}>
      <p className={styles.quote}>{quote}</p>
      <div className={styles.attribution}>{attribution}</div>
    </div>
  );
}
