import type { CaseStudiesPage } from "../types";

export const caseStudiesPage: Omit<CaseStudiesPage, "featured" | "items"> = {
  heroKicker: "Case studies",
  heroHeading: "Real engagements, *real outcomes.*",
  heroSubheading:
    "Full write-ups of client work outside EY — what the brief was, the decisions made along the way, and how it turned out. Most enterprise work at EY is confidential by nature, so this is where the independent projects live.",
};
