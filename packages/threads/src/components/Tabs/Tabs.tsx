"use client";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  /** Render tab panel content below the tab bar */
  renderPanel?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  items,
  defaultActiveId,
  activeId: controlledId,
  onChange,
  renderPanel = true,
  className,
  ariaLabel = "Navigation tabs",
}: TabsProps) {
  const [internalId, setInternalId] = useState(
    defaultActiveId ?? items[0]?.id ?? ""
  );

  const isControlled = controlledId !== undefined;
  const activeId = isControlled ? controlledId : internalId;

  const handleSelect = (id: string) => {
    if (!isControlled) setInternalId(id);
    onChange?.(id);
  };

  const activeItem = items.find((t) => t.id === activeId);
  const listRef = useRef<HTMLDivElement>(null);

  /* WAI-ARIA tabs pattern: arrows, Home and End move focus and select (RTL-aware). */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key) || items.length === 0) return;
    const rtl =
      event.currentTarget.closest("[dir]")?.getAttribute("dir") === "rtl" ||
      getComputedStyle(event.currentTarget).direction === "rtl";
    const current = Math.max(0, items.findIndex((t) => t.id === activeId));
    let next = current;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else {
      const step = (event.key === "ArrowRight") !== rtl ? 1 : -1;
      next = (current + step + items.length) % items.length;
    }
    event.preventDefault();
    handleSelect(items[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={styles.tabList}
        onKeyDown={handleKeyDown}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive || (!activeItem && tab.id === items[0]?.id) ? 0 : -1}
              onClick={() => handleSelect(tab.id)}
              className={[styles.tab, isActive ? styles.tabActive : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderPanel && activeItem?.content && (
        <div
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={`tab-${activeItem.id}`}
          className={styles.panel}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
