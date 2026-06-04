"use client";
import { useState, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useId } from "react";
import f from "../Input/formField.module.css";
import styles from "./FileDropzone.module.css";

export interface FileDropzoneProps {
  label?: string;
  hint?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  id?: string;
  onFiles?: (files: File[]) => void;
}

const UploadIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={styles.uploadIcon}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export function FileDropzone({
  label,
  hint,
  error,
  accept,
  multiple,
  disabled,
  id: providedId,
  onFiles,
}: FileDropzoneProps) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !onFiles) return;
      onFiles(Array.from(files));
    },
    [onFiles]
  );

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={f.field}>
      {label && (
        <span
          className={[f.label, disabled ? f["label--disabled"] : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </span>
      )}
      <label
        htmlFor={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          styles.zone,
          dragOver  ? styles.dragOver  : "",
          disabled  ? styles.disabled  : "",
          error     ? styles.hasError  : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <UploadIcon />
        <span className={styles.text}>
          Drop files here, or{" "}
          <span className={styles.browse}>browse</span>
        </span>
        {hint && <span className={styles.zoneHint}>{hint}</span>}
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onChange}
          className={styles.hiddenInput}
          aria-label={label ?? "Upload file"}
        />
      </label>
      {error && (
        <span role="alert" className={f.error}>{error}</span>
      )}
    </div>
  );
}
