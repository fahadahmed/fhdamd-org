"use client";
import { useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import styles from "./CodeBlock.module.css";

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  filename?: string;
  /**
   * The code content — a plain string, or pre-highlighted markup (e.g. from
   * Shiki at Astro build time). CodeBlock does not do syntax highlighting
   * itself; the copy button reads the rendered textContent regardless.
   */
  children: ReactNode;
}

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function CodeBlock({ filename, children, className, ...rest }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const text = codeRef.current?.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.chrome}>
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
        {filename && <span className={styles.filename}>{filename}</span>}
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={styles.pre}>
        <code ref={codeRef} className={styles.code}>{children}</code>
      </pre>
    </div>
  );
}
