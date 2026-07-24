import type { CaseStudiesPage } from "../types";

export const caseStudiesPage: CaseStudiesPage = {
  heroKicker: "Case studies",
  heroHeading: "Real engagements, *real outcomes.*",
  heroSubheading:
    "Full write-ups of client work outside EY — what the brief was, the decisions made along the way, and how it turned out. Most enterprise work at EY is confidential by nature, so this is where the independent projects live.",

  featured: {
    slug: "rzest",
    eyebrowMeta: "Structural engineering · New Delhi",
    title: "RZest Engineers — *a Presence build in under three weeks*",
    description:
      "A brochure-and-portfolio site for a New Delhi structural engineering firm — a filterable project portfolio, DatoCMS-backed case study pages, and full OG/meta implementation, built on Astro and delivered in under three weeks.",
    dateLabel: "Delivered",
    tag: "website",
    techBadge: "Astro · DatoCMS",
  },

  items: [
    {
      slug: "rzest",
      title: "RZest Engineers",
      description:
        "Filterable project portfolio and case study pages for a structural engineering firm.",
      dateLabel: "Delivered",
      tag: "website",
    },
    {
      slug: "next-app",
      title: "Next case study",
      description:
        "Reserved for the next apps & products engagement — same template, new client.",
      dateLabel: "Coming soon",
      tag: "app",
      comingSoon: true,
    },
    {
      slug: "next-advisory",
      title: "Next case study",
      description: "Reserved for the next architecture or advisory engagement.",
      dateLabel: "Coming soon",
      tag: "advisory",
      comingSoon: true,
    },
  ],
};
