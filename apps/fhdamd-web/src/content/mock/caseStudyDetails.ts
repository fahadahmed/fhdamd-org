import type { CaseStudyDetail } from "../types";

export const caseStudyDetails: CaseStudyDetail[] = [
  {
    slug: "rzest",
    breadcrumbCategory: "Custom website",
    badges: [
      { label: "Custom website", variant: "terra" },
      { label: "Astro · DatoCMS", variant: "neutral" },
    ],
    title: "RZest Engineers — a Presence build *in under three weeks*",
    dek: "A New Delhi structural engineering firm needed a site that looked as credible as their client list — with a portfolio their own team could keep current without filing a ticket with a developer every time a project wrapped.",
    authorInitials: "FA",
    authorName: "Fahad Ahmed",
    authorRole: "Solution Architect",
    clientName: "RZest Engineers",
    location: "New Delhi",
    facts: [
      { label: "Client", value: "RZest Engineers" },
      { label: "Industry", value: "Structural engineering" },
      { label: "Timeline", value: "Under 3 weeks" },
      { label: "Offering", value: "Custom website" },
      { label: "Stack", value: "Astro · DatoCMS" },
    ],
    postTags: ["Custom website", "Astro", "DatoCMS", "Presence"],
    buildCreditName: "Built by Fahad Ahmed",
    buildCreditRole: "Solution Architect · fhdamd.dev",
    buildCreditBio:
      "Designed and built end to end — brand, content model, and code.",
    relatedItems: [
      {
        badgeLabel: "Architecture",
        badgeVariant: "neutral",
        title: "Building a sequence diagram you can trust",
        dateLabel: "From the blog",
        href: "/blog/sequence-diagram-you-can-trust",
      },
      {
        badgeLabel: "Apps & products",
        badgeVariant: "neutral",
        title: "Next case study — reserved",
        dateLabel: "Coming soon",
        href: "/case-studies",
      },
      {
        badgeLabel: "Architecture & advisory",
        badgeVariant: "neutral",
        title: "Next case study — reserved",
        dateLabel: "Coming soon",
        href: "/case-studies",
      },
    ],
    body: [
      { type: "heading", id: "overview", text: "*Overview*" },
      {
        type: "html",
        html: "<p>RZest Engineers is a structural engineering practice in New Delhi — the kind of firm whose clients decide whether to call based on whether the last ten projects look credible. Their old site was a static one-pager with a project list that hadn't been touched in over a year, because updating it meant emailing a developer and waiting.</p><p>They came to me through a referral wanting a <b>Presence-tier</b> build: a brochure site with a real, browsable portfolio — and, critically, one they could keep current themselves.</p>",
      },
      {
        type: "screenshot",
        caption: "Homepage screenshot — swap in the live capture",
      },

      { type: "heading", id: "challenge", text: "The *challenge*" },
      {
        type: "html",
        html: "<p>Three constraints shaped the build: a tight three-week timeline set by an upcoming tender the firm wanted to point prospective clients to, a portfolio that needed to be filterable by project type and sector rather than just listed, and a non-technical team who needed to add new projects without touching code.</p>",
      },
      {
        type: "callout",
        variant: "warn",
        title: "The real constraint wasn't the timeline",
        body: "It was building something that would still look intentional a year later, once the firm — not me — was the one adding content to it.",
      },

      { type: "heading", id: "approach", text: "The *approach*" },
      {
        type: "html",
        html: "<p>The build started the same way every Presence engagement does: a component library drawn from the firm's existing brand marks before a single page was laid out, so the site would read as considered rather than assembled. The content model went into DatoCMS — projects, sectors, and case study pages as structured content, not hard-coded markup.</p>",
      },
      {
        type: "code",
        filename: "src/content/config.ts",
        code: `import { defineCollection, z } from 'astro:content';
import { datocmsLoader } from './loaders/datocms';

// Projects are structured content in DatoCMS, not hard-coded pages —
// the client adds a project, the portfolio and filters update themselves.
const projects = defineCollection({
  loader: datocmsLoader('project'),
  schema: z.object({
    title: z.string(),
    sector: z.enum(['residential', 'commercial', 'infrastructure']),
    completedYear: z.number(),
    heroImage: z.string(),
  }),
});

export const collections = { projects };`,
      },
      {
        type: "html",
        html: "<p>With the content model settled, the portfolio's filter-by-sector interaction and the case-study page template were the two pieces of actual custom engineering — everything else was composition of the component library against DatoCMS data.</p>",
      },
      {
        type: "diagram",
        label: "Architecture · Mermaid",
        caption:
          "Content lives in DatoCMS; the site rebuilds and redeploys on publish — no server to manage",
        source: `flowchart LR
    accTitle: RZest Engineers site architecture
    accDescr: The client edits projects in DatoCMS, which Astro builds at deploy time into a static site served from Firebase Hosting, with a client-side filter over the pre-built portfolio data.
    A[RZest team] -->|Adds a project| B[DatoCMS]
    B -->|Build-time fetch| C[Astro SSG]
    C -->|Static output| D[Firebase Hosting]
    C -->|Portfolio JSON| E[Client-side sector filter]
    D --> F[Visitor]
    E --> F`,
      },

      { type: "heading", id: "built", text: "What was *built*" },
      {
        type: "html",
        html: "<ul><li>A component library drawn from RZest's existing brand marks — colour, type, cards, and layout, consistent before the first real page was built.</li><li>A filterable project portfolio, sortable by sector, backed by structured content in DatoCMS rather than hard-coded HTML.</li><li>A reusable case-study page template so each completed project gets its own page without a one-off build.</li><li>Full Open Graph and meta implementation, so project pages preview properly when shared.</li><li>A CMS the RZest team could use directly — no developer in the loop to publish a new project.</li></ul>",
      },
      {
        type: "screenshot",
        caption:
          "Portfolio & case study page screenshots — swap in the live captures",
      },

      { type: "heading", id: "results", text: "*Results*" },
      {
        type: "statRow",
        stats: [
          { number: "<3", unit: "wks", label: "Discovery to launch" },
          {
            number: "0",
            label: "Dev tickets needed to publish a new project since launch",
          },
          { number: "100", unit: "%", label: "Pages with OG/meta coverage" },
        ],
      },
      {
        type: "html",
        html: "<blockquote>The brief was simple to state and easy to get wrong: a site the RZest team could grow themselves, that still looked like it had a firm hand behind it on day one and a year later.</blockquote>",
      },
      {
        type: "testimonialReserved",
        title: "Client testimonial — reserved",
        description:
          "A quote from Rabi Akhtar at RZest Engineers goes here once confirmed — not written on their behalf.",
      },
    ],
  },
];
