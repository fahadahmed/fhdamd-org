import type { ReactNode } from "react";
import { Tag } from "../Badge/Tag";
import styles from "./ClientWorkRow.module.css";

export interface ClientWorkRowProps {
  client: string;
  dateRange: string;
  title: ReactNode;
  description: string;
  tags?: string[];
  value?: string;
}

export function ClientWorkRow({
  client,
  dateRange,
  title,
  description,
  tags = [],
  value,
}: ClientWorkRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.client}>{client}</div>
        <div className={styles.date}>{dateRange}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <p className={styles.desc}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
      </div>
      <div className={styles.right}>
        {value && <span className={styles.value}>{value}</span>}
      </div>
    </div>
  );
}
