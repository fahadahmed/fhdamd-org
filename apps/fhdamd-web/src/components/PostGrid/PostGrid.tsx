import { useMemo, useState } from "react";
import { Stack, Grid, ContentCard, TagFilterBar, type BadgeVariant } from "@fhdamd/threads";
import { titleToReact } from "../../utils/titleToReact";
import type { BlogPost } from "../../content/types";

const TAG_LABELS: Record<string, string> = {
  dev: "Dev",
  product: "Product",
  design: "Design",
  architecture: "Architecture",
};

const TAG_BADGE_VARIANT: Record<string, BadgeVariant> = {
  dev: "neutral",
  product: "terra",
  design: "sage",
  architecture: "neutral",
};

interface PostGridProps {
  posts: BlogPost[];
}

/**
 * Tag pills and grid share filter state, so both live in one island rather
 * than two — TagFilterBar only reports the active tag via onChange, it
 * doesn't touch the grid itself.
 */
export function PostGrid({ posts }: PostGridProps) {
  const tagOptions = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => seen.add(tag)));
    return Array.from(seen).map((value) => ({ value, label: TAG_LABELS[value] ?? value }));
  }, [posts]);

  const [activeTag, setActiveTag] = useState("all");
  const visible = activeTag === "all" ? posts : posts.filter((post) => post.tags.includes(activeTag));

  return (
    <Stack gap={5}>
      <TagFilterBar tags={tagOptions} allLabel="All posts" onChange={setActiveTag} />
      <Grid cols={3} gap={4}>
        {visible.map((post) => (
          <ContentCard
            key={post.slug}
            href={`/blog/${post.slug}`}
            date={post.date}
            description={post.description}
            title={titleToReact(post.title, { color: "var(--th-color-accent)" })}
            badges={[
              { label: TAG_LABELS[post.tags[0]] ?? post.tags[0], variant: TAG_BADGE_VARIANT[post.tags[0]] },
            ]}
          />
        ))}
      </Grid>
    </Stack>
  );
}
