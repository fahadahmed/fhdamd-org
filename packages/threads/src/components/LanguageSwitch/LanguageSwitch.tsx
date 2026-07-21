"use client";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import styles from "./LanguageSwitch.module.css";

export interface Language {
  code: string;
  label: string;
  nativeLabel?: string;
}

export interface LanguageSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  languages: Language[];
  currentCode?: string;
  /**
   * Fires when a language is picked. Visual/interactive shell only — this
   * does not touch `document.documentElement`'s dir/lang itself, since real
   * routing and RTL support across Threads are deferred (see #275). The
   * consuming app decides what (if anything) happens.
   */
  onLanguageChange?: (code: string) => void;
}

const GlobeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export function LanguageSwitch({
  languages,
  currentCode,
  onLanguageChange,
  className,
  ...rest
}: LanguageSwitchProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentCode ?? languages[0]?.code);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  const current = languages.find((l) => l.code === selected) ?? languages[0];

  const pick = (code: string) => {
    setSelected(code);
    setOpen(false);
    onLanguageChange?.(code);
  };

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <button
        type="button"
        className={styles.button}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <GlobeIcon />
        <span className={styles.label}>{current?.code.toUpperCase()}</span>
      </button>
      <div className={[styles.menu, open ? styles.open : ""].filter(Boolean).join(" ")} role="menu">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            role="menuitem"
            className={styles.item}
            aria-current={lang.code === selected}
            onClick={() => pick(lang.code)}
          >
            {lang.label}
            <small>{lang.code.toUpperCase()}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
