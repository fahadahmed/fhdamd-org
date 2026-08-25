import type { LabPage } from "../types";

export const labPage: LabPage = {
  heroKicker: "Lab",
  heroHeading: "UI experiments, *played with in the open.*",
  heroSubheading:
    "Interaction patterns, component ideas, and small prototypes — the demo-first counterpart to the blog. Some of these get written up properly later; most are just here to be poked at.",

  items: [
    {
      href: "/blog/sequence-diagram-you-can-trust",
      title: "Mermaid diagrams as living docs",
      description:
        "Sequence and flow diagrams rendered live from text, with a working theme-toggle re-render.",
      dateLabel: "View on the blog",
      tags: ["prototype", "interaction"],
    },
    {
      title: "Next experiment",
      description:
        "Reserved for the next component idea worth playing with in the open.",
      dateLabel: "Coming soon",
      tags: ["component"],
      comingSoon: true,
    },
    {
      title: "Next experiment",
      description:
        "Reserved for the next interaction pattern worth playing with in the open.",
      dateLabel: "Coming soon",
      tags: ["interaction"],
      comingSoon: true,
    },
  ],
};
