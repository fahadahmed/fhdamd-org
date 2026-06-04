"use client";
import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: ReactNode;
  duration?: number; /* ms — 0 = persistent */
}

/* ── Individual toast ────────────────────────────────────────────────────── */

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
    </svg>
  ),
};

interface ToastCardProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ item, onDismiss }: ToastCardProps) {
  useEffect(() => {
    if (!item.duration) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      className={[styles.toast, styles[item.variant]].join(" ")}
    >
      <span className={styles.toastIcon} aria-hidden="true">
        {variantIcons[item.variant]}
      </span>
      <span className={styles.toastMessage}>{item.message}</span>
      <button
        type="button"
        className={styles.toastClose}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Toast stack ─────────────────────────────────────────────────────────── */

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={styles.stack} aria-label="Notifications">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ── useToast hook ───────────────────────────────────────────────────────── */

let _counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      variant: ToastVariant,
      message: ReactNode,
      duration = 5000
    ) => {
      const id = `toast-${++_counter}`;
      setToasts((prev) => [...prev, { id, variant, message, duration }]);
      return id;
    },
    []
  );

  return { toasts, dismiss, toast };
}
