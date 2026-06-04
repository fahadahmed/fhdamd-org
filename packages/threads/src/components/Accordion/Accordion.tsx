"use client";
import { useState } from "react";
import type { HTMLAttributes } from "react";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  defaultOpenIndex?: number;
}

export function Accordion({ items, defaultOpenIndex = 0, className, ...rest }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className={[styles.accordion, className].filter(Boolean).join(" ")} {...rest}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={[styles.item, isOpen ? styles.open : ""].filter(Boolean).join(" ")}>
            <button
              type="button"
              className={styles.trigger}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <div className={styles.body} aria-hidden={!isOpen}>
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
