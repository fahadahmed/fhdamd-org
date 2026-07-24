import { useMemo, useState } from "react";
import { Stack, Grid, ContentCard, TagFilterBar } from "@fhdamd/threads";
import { titleToReact } from "../../utils/titleToReact";
import { LAB_TAG_LABELS, LAB_TAG_BADGE_VARIANT } from "../../utils/labTags";
import type { LabItem } from "../../content/types";

interface LabGridProps {
  items: LabItem[];
}

/**
 * Tag pills and grid share filter state, so both live in one island rather
 * than two — TagFilterBar only reports the active tag via onChange, it
 * doesn't touch the grid itself. Same pattern as Blog's PostGrid.
 */
export function LabGrid({ items }: LabGridProps) {
  const tagOptions = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => seen.add(tag)));
    return Array.from(seen).map((value) => ({
      value,
      label: LAB_TAG_LABELS[value] ?? value,
    }));
  }, [items]);

  const [activeTag, setActiveTag] = useState("all");
  const visible =
    activeTag === "all"
      ? items
      : items.filter((item) => item.tags.includes(activeTag));

  return (
    <Stack gap={5}>
      <TagFilterBar
        tags={tagOptions}
        allLabel="All experiments"
        onChange={setActiveTag}
      />
      <Grid cols={3} gap={4}>
        {visible.map((item, i) => (
          <ContentCard
            key={item.href ?? `${item.title}-${i}`}
            href={item.comingSoon ? undefined : item.href}
            date={item.dateLabel}
            description={item.description}
            title={titleToReact(item.title, {
              color: "var(--th-color-accent)",
            })}
            comingSoon={item.comingSoon}
            badges={[
              {
                label: LAB_TAG_LABELS[item.tags[0]] ?? item.tags[0],
                variant: LAB_TAG_BADGE_VARIANT[item.tags[0]],
              },
            ]}
          />
        ))}
      </Grid>
    </Stack>
  );
}
