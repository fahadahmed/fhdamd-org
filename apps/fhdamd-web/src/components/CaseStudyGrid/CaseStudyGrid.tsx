import { useMemo, useState } from "react";
import { Stack, Grid, ContentCard, TagFilterBar } from "@fhdamd/threads";
import { titleToReact } from "../../utils/titleToReact";
import {
  CASE_STUDY_TAG_LABELS,
  CASE_STUDY_TAG_BADGE_VARIANT,
} from "../../utils/caseStudyTags";
import type { CaseStudyItem } from "../../content/types";

interface CaseStudyGridProps {
  items: CaseStudyItem[];
}

/**
 * Tag pills and grid share filter state, so both live in one island rather
 * than two — TagFilterBar only reports the active tag via onChange, it
 * doesn't touch the grid itself. Same pattern as Blog's PostGrid.
 */
export function CaseStudyGrid({ items }: CaseStudyGridProps) {
  const tagOptions = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((item) => seen.add(item.tag));
    return Array.from(seen).map((value) => ({
      value,
      label: CASE_STUDY_TAG_LABELS[value] ?? value,
    }));
  }, [items]);

  const [activeTag, setActiveTag] = useState("all");
  const visible =
    activeTag === "all"
      ? items
      : items.filter((item) => item.tag === activeTag);

  return (
    <Stack gap={5}>
      <TagFilterBar
        tags={tagOptions}
        allLabel="All case studies"
        onChange={setActiveTag}
      />
      <Grid cols={3} gap={4}>
        {visible.map((item) => (
          <ContentCard
            key={item.slug}
            href={item.comingSoon ? undefined : `/case-studies/${item.slug}`}
            date={item.dateLabel}
            description={item.description}
            title={titleToReact(item.title, {
              color: "var(--th-color-accent)",
            })}
            comingSoon={item.comingSoon}
            badges={[
              {
                label: CASE_STUDY_TAG_LABELS[item.tag] ?? item.tag,
                variant: CASE_STUDY_TAG_BADGE_VARIANT[item.tag],
              },
            ]}
          />
        ))}
      </Grid>
    </Stack>
  );
}
