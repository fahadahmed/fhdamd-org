import { useRef } from 'react';
import { ReadingProgressBar } from '@fhdamd/threads';

interface ArticleReadingProgressProps {
  targetSelector: string;
}

/**
 * ReadingProgressBar takes a RefObject to the tracked element, but that
 * element is plain static Astro markup elsewhere on the page, not something
 * this island renders — so the ref is resolved once via a DOM query rather
 * than passed down from a parent. Safe to do during render (not an effect):
 * the target already exists in the DOM by the time this island hydrates.
 */
export function ArticleReadingProgress({
  targetSelector,
}: ArticleReadingProgressProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  if (targetRef.current === null && typeof document !== 'undefined') {
    targetRef.current = document.querySelector<HTMLElement>(targetSelector);
  }

  return <ReadingProgressBar targetRef={targetRef} />;
}
