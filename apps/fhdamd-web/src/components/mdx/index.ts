import CalloutBlock from "./CalloutBlock.astro";
import MdxCode from "./MdxCode.astro";
import MermaidDiagramBlock from "./MermaidDiagramBlock.astro";
import EmbedYoutube from "./EmbedYoutube.astro";
import EmbedTweet from "./EmbedTweet.astro";
import EmbedInstagram from "./EmbedInstagram.astro";
import ScreenshotBlock from "./ScreenshotBlock.astro";
import StatRowBlock from "./StatRowBlock.astro";
import TestimonialBlock from "./TestimonialBlock.astro";

/**
 * Passed to <Content components={mdxComponents} /> so every post/case-study
 * .mdx file can use these tags directly in its body with no per-file import —
 * MDX resolves any unrecognised capitalised tag against this map at render
 * time. Native markdown (headings, paragraphs, lists, bold, blockquotes,
 * inline code, links) needs no entry here — Prose's CSS already styles the
 * plain HTML those produce.
 */
export const mdxComponents = {
  CalloutBlock,
  MdxCode,
  MermaidDiagramBlock,
  EmbedYoutube,
  EmbedTweet,
  EmbedInstagram,
  ScreenshotBlock,
  StatRowBlock,
  TestimonialBlock,
};
