import type { HTMLAttributes } from "react";
import { Tag } from "../Badge/Tag";
import styles from "./SkillGrid.module.css";

export interface SkillCategoryItem {
  label: string;
  tags: string[];
}

export interface SkillGridProps extends HTMLAttributes<HTMLDivElement> {
  categories: SkillCategoryItem[];
}

export function SkillGrid({ categories, className, ...rest }: SkillGridProps) {
  return (
    <div className={[styles.grid, className].filter(Boolean).join(" ")} {...rest}>
      {categories.map((category) => (
        <div className={styles.item} key={category.label}>
          <div className={styles.category}>{category.label}</div>
          <div className={styles.skills}>
            {category.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        </div>
      ))}
    </div>
  );
}
