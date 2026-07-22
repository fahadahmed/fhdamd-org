import type { HTMLAttributes, ReactNode } from "react";
import styles from "./AuthorBox.module.css";

export interface AuthorBoxProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  name: string;
  role: string;
  bio: ReactNode;
}

export function AuthorBox({ initials, name, role, bio, className, ...rest }: AuthorBoxProps) {
  return (
    <div className={[styles.box, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.avatar} aria-hidden="true">{initials}</div>
      <div>
        <div className={styles.name}>{name}</div>
        <div className={styles.role}>{role}</div>
        <p className={styles.bio}>{bio}</p>
      </div>
    </div>
  );
}
