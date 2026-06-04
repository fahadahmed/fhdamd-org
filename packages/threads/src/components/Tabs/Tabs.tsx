"use client";
import { useState } from "react";
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

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={styles.tabList}
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
              tabIndex={isActive ? 0 : -1}
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
