import { useMemo, useState } from 'react';
import { Stack, Grid, ContentCard, TagFilterBar } from '@fhdamd/threads';
import { titleToReact } from '../../utils/titleToReact';
import { BLOG_TAG_LABELS, BLOG_TAG_BADGE_VARIANT } from '../../utils/blogTags';
import type { BlogPost } from '../../content/types';

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
    return Array.from(seen).map((value) => ({
      value,
      label: BLOG_TAG_LABELS[value] ?? value,
    }));
  }, [posts]);

  const [activeTag, setActiveTag] = useState('all');
  const visible =
    activeTag === 'all'
      ? posts
      : posts.filter((post) => post.tags.includes(activeTag));

  return (
    <Stack gap={5}>
      <TagFilterBar
        tags={tagOptions}
        allLabel="All posts"
        onChange={setActiveTag}
      />
      <Grid cols={3} gap={4}>
        {visible.map((post) => (
          <ContentCard
            key={post.slug}
            href={`/blog/${post.slug}`}
            date={post.date}
            description={post.description}
            title={titleToReact(post.title, {
              color: 'var(--th-color-accent)',
            })}
            badges={[
              {
                label: BLOG_TAG_LABELS[post.tags[0]] ?? post.tags[0],
                variant: BLOG_TAG_BADGE_VARIANT[post.tags[0]],
              },
            ]}
          />
        ))}
      </Grid>
    </Stack>
  );
}
