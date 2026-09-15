import type { LabPage } from "../types";

export const labPage: Omit<LabPage, "items"> = {
  heroKicker: "Lab",
  heroHeading: "UI experiments, *played with in the open.*",
  heroSubheading:
    "Interaction patterns, component ideas, and small prototypes — the demo-first counterpart to the blog. Some of these get written up properly later; most are just here to be poked at.",
};
