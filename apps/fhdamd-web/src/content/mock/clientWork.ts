import type { ClientWorkItem } from "../types";

export const clientWork: ClientWorkItem[] = [
  {
    client: "Dept. of Education VIC",
    dateRange: "Jan 2024 – Present",
    title: "Kindergarten *Arrival Funding*",
    description:
      "Technical lead across two phases — winning a $1.3M bid with solution architecture for IBM ODM integrations, then delivering a state-wide micro-frontend attendance platform. Turborepo, React (Vite), GraphQL, .NET Azure Functions, Cosmos DB. Agile team of 6.",
    tags: ["React Vite", "Turborepo", "Azure Functions", "Cosmos DB", "GraphQL", "IBM ODM"],
    value: "$1.3M bid",
  },
  {
    client: "ATO",
    dateRange: "Jul 2025 – Present",
    title: "Modern Tax Administration *System*",
    description:
      "Lead backend developer on MTAS for AY2026. Implementing Trust and Beneficiary tax return capabilities including prefill operations on AWS Cloud with Node.js, Express, and TypeScript.",
    tags: ["Node.js", "TypeScript", "Express", "AWS"],
  },
  {
    client: "Energy Australia",
    dateRange: "Jan – Apr 2025",
    title: "Cloud Migration *Advisory*",
    description:
      "Cybersecurity posture analysis of a vendor-managed AWS tenancy. Evaluated migration vs replatform options. Outcome secured approximately $300k in future EY work.",
    tags: ["AWS", "Cloud strategy", "Cybersecurity"],
    value: "~$300k OoM",
  },
  {
    client: "SA Police",
    dateRange: "Sep – Oct 2023",
    title: "Firearms *Registry*",
    description:
      "Bid architecture for a Remix-based firearm permit tracking platform — Azure container, Microsoft Dynamics 365, and Google Maps. Bid win secured the engagement for EY.",
    tags: ["Remix", "Azure", "Dynamics 365"],
    value: "$1.8M bid",
  },
  {
    client: "Australian Space Agency",
    dateRange: "Sep 2022 – Sep 2023",
    title: "Space for *Earth*",
    description:
      "Full-stack Remix / GraphQL / .NET platform with geospatial visualisation via Leaflet and Google Maps, role-based access control, dynamic report generation, and CI/CD via GitHub Actions.",
    tags: ["Remix", "GraphQL", ".NET", "Leaflet", "GitHub Actions"],
  },
  {
    client: "ANZ Bank",
    dateRange: "Aug 2018 – May 2021",
    title: "Institutional *Analytics Platform*",
    description:
      "Embedded consultant delivering frontend features for a bespoke analytics platform. Designed and developed technical solutions using React, .NET, GraphQL, and Node.js.",
    tags: ["React", ".NET", "GraphQL", "Node.js"],
  },
];
