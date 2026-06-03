import type { HTMLAttributes } from "react";
import styles from "./StepCard.module.css";

export interface StepCardProps extends HTMLAttributes<HTMLDivElement> {
  number: string;
  title: string;
  body: string;
}

export function StepCard({ number, title, body, className, ...rest }: StepCardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.number}>{number}</div>
      <div className={styles.title}>{title}</div>
      <p className={styles.body}>{body}</p>
    </div>
  );
}
