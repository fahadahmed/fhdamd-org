"use client";
import { useState, type HTMLAttributes } from "react";
import styles from "./TagFilterBar.module.css";

export interface TagFilterOption {
  value: string;
  label: string;
}

export interface TagFilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Distinct tag values present in the collection — computed by the consuming page, not hardcoded here */
  tags: TagFilterOption[];
  /** Label for the "show everything" pill — reserved value "all" */
  allLabel?: string;
  defaultTag?: string;
  onChange?: (tag: string) => void;
}

export function TagFilterBar({
  tags,
  allLabel = "All",
  defaultTag = "all",
  onChange,
  className,
  ...rest
}: TagFilterBarProps) {
  const [active, setActive] = useState(defaultTag);

  const select = (tag: string) => {
    setActive(tag);
    onChange?.(tag);
  };

  return (
    <div className={[styles.bar, className].filter(Boolean).join(" ")} {...rest}>
      <button
        type="button"
        className={[styles.pill, active === "all" ? styles.active : ""].filter(Boolean).join(" ")}
        onClick={() => select("all")}
      >
        {allLabel}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.value}
          type="button"
          className={[styles.pill, active === tag.value ? styles.active : ""].filter(Boolean).join(" ")}
          onClick={() => select(tag.value)}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
