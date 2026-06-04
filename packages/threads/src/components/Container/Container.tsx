import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Container.module.css";

export type ContainerElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "nav";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ContainerElement;
  children: ReactNode;
}

export function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={[styles.container, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
