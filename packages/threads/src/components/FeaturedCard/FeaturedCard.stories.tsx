import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturedCard } from "./FeaturedCard";

const meta = {
  title: "Threads/Components/FeaturedCard",
  component: FeaturedCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    eyebrowMeta: "July 2026 · 9 min read",
    title:       <>Building a sequence diagram <em>you can trust</em></>,
    description: "A walkthrough of how the Kindergarten Arrival Funding platform's prefill flow is documented — with Mermaid diagrams checked into the same repo as the code they describe, so the docs can't drift.",
    metaBadges:  [{ label: "Dev", variant: "neutral" }, { label: "Architecture", variant: "neutral" }],
    href:        "#",
  },
} satisfies Meta<typeof FeaturedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CaseStudyVariant: Story = {
  args: {
    eyebrowMeta: "Structural engineering · New Delhi",
    title:       <>RZest Engineers — <em>a Presence build in under three weeks</em></>,
    description: "A brochure-and-portfolio site for a New Delhi structural engineering firm — a filterable project portfolio, DatoCMS-backed case study pages, and full OG/meta implementation, built on Astro and delivered in under three weeks.",
    metaBadges:  [{ label: "Custom website", variant: "terra" }, { label: "Astro · DatoCMS", variant: "neutral" }],
  },
};
