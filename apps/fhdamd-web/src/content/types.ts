/**
 * Content model types, matching the finalized DatoCMS schema in #264.
 * Mirrors what a build-time GraphQL query would return — when real DatoCMS
 * wiring lands, only src/lib/cms/*.ts changes, not these types or any page.
 */

export interface SiteSettings {
  email: string;
  github: string;
  location: string;
  currentEmployer: string;
  currentTitle: string;
  availabilityLabel: string;
  availabilityStatus: boolean;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  ctaTitle: string;
  ctaSubtitle: string;
  footerCopyrightNote: string;
}

export interface AboutPage {
  heroKicker: string;
  heroHeading: string;
  heroSubheading: string;
  /** Structured Text in DatoCMS — plain paragraphs are enough for the mock */
  bio: string[];
  sidebarLabel: string;
}

export interface ContactPage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroSubheading: string;
  formNote: string;
  expectList: string[];
}

export interface HireStripItem {
  iconKey: "design" | "phone" | "fileCheck";
  title: string;
  description: string;
}

export interface PersonalProject {
  eyebrow: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  name: string;
  description: string;
  tags: string[];
  badge: { label: string; variant: "sage" | "terra" | "neutral" };
  accentColor: "terra" | "sage" | "ink";
  iconKey?: "fileText" | "settings";
  /** Threads' ProjectCard special-cases Jamaal with a "J" avatar instead of an icon. */
  jamaalIcon?: boolean;
  pricingPills?: { price: string; label: string }[];
}

export interface ServiceTier {
  name: string;
  price: string;
}

export interface CaseStudyStatItem {
  /** Plain string; wrap a segment in *asterisks* for an <em> unit, e.g. "100*%*". */
  value: string;
  label: string;
}

export interface EssayTeaser {
  date: string;
  title: string;
  subtitle: string;
  category: "design" | "product" | "dev";
}

export interface HomePage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroBody: string;
  hireStrip: HireStripItem[];
  personalProjects: PersonalProject[];
  servicesTeaserTitle: string;
  servicesTeaserDesc: string;
  serviceTiers: ServiceTier[];
  caseStudyEyebrow: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  caseStudyTitle: string;
  caseStudyDescription: string;
  caseStudyTags: string[];
  caseStudyStats: CaseStudyStatItem[];
  labTeaserEyebrow: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  labTeaserTitle: string;
  labTeaserDesc: string;
  essays: EssayTeaser[];
}

export interface OfferCard {
  iconKey: "design" | "phone" | "fileCheck";
  eyebrow: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
  checklist: string[];
}

export interface AddonCard {
  name: string;
  badge: { label: string; variant: "sage" | "neutral" };
  items: string[];
}

export interface DeliveryPhase {
  number: string;
  name: string;
  badge: { label: string; variant: "terra" | "sage" | "neutral" };
  description: string;
  pills: string[];
}

export interface Differentiator {
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
}

export interface ServicesPage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroSubheading: string;
  offerCards: OfferCard[];
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  pricingNoteTitle: string;
  pricingNoteDesc: string;
  addonCards: AddonCard[];
  deliveryPhases: DeliveryPhase[];
  differentiators: Differentiator[];
  techStackTags: string[];
  techStackNote: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface BlogPost {
  slug: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
  date: string;
  /** First tag is the displayed badge; the full set drives tag-filter matching. */
  tags: string[];
}

export interface FeaturedPost extends BlogPost {
  readTime: string;
}

export interface BlogPage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroSubheading: string;
  featuredPost: FeaturedPost;
  posts: BlogPost[];
}

export interface CaseStudyItem {
  slug: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
  /** Display label, e.g. "Delivered" or "Coming soon" — not a real date. */
  dateLabel: string;
  tag: "website" | "app" | "advisory";
  /** Dashed, non-interactive placeholder tile — no href, no arrow. */
  comingSoon?: boolean;
}

export interface FeaturedCaseStudy extends CaseStudyItem {
  eyebrowMeta: string;
  /** Secondary meta badge, e.g. "Astro · DatoCMS". */
  techBadge: string;
}

export interface CaseStudiesPage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroSubheading: string;
  featured: FeaturedCaseStudy;
  items: CaseStudyItem[];
}

export type BlogEmbed =
  | { kind: "youtube"; videoUrl: string; title: string }
  | {
      kind: "tweet";
      authorName: string;
      handle: string;
      text: string;
      foot?: string;
    }
  | { kind: "instagram"; accountName: string; caption?: string };

export type ArticleContentBlock =
  /** id must be unique on the page — TableOfContents links to it and scroll-spies it. */
  | { type: "heading"; id: string; text: string }
  | { type: "subheading"; id: string; text: string }
  /** Raw HTML for a paragraph, blockquote, or list — rendered inside <Prose>, whose
   *  descendant selectors style p/blockquote/ul/li/code/b regardless of wrapper depth. */
  | { type: "html"; html: string }
  | { type: "callout"; variant: "tip" | "warn"; title: string; body: string }
  /** lang is a Shiki grammar name (e.g. "ts") — defaults to "ts" when unset. */
  | { type: "code"; filename?: string; lang?: string; code: string }
  /** source is raw Mermaid syntax, rendered client-side — see MermaidDiagram island. */
  | { type: "diagram"; label: string; caption?: string; source: string }
  | ({ type: "embed" } & BlogEmbed)
  /** No src yet — always the placeholder state until real screenshots exist. */
  | { type: "screenshot"; caption?: string }
  | {
      type: "statRow";
      stats: { number: string; unit?: string; label: string }[];
    }
  | { type: "testimonialReserved"; title?: string; description: string };

export interface BlogPostDetail {
  slug: string;
  breadcrumbCategory: string;
  badges: string[];
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  dek: string;
  authorInitials: string;
  authorName: string;
  /** Byline title, e.g. "Solution Architect" */
  authorRole: string;
  publishedDate: string;
  readTime: string;
  body: ArticleContentBlock[];
  postTags: string[];
  /** Slugs into BlogPage's posts/featuredPost, for the related-posts grid. */
  relatedSlugs: string[];
}

export interface CaseStudyRelatedItem {
  badgeLabel: string;
  badgeVariant: "terra" | "sage" | "neutral";
  title: string;
  dateLabel: string;
  href: string;
}

export interface CaseStudyDetail {
  slug: string;
  breadcrumbCategory: string;
  badges: { label: string; variant: "terra" | "sage" | "neutral" }[];
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  dek: string;
  authorInitials: string;
  authorName: string;
  authorRole: string;
  clientName: string;
  location: string;
  facts: { label: string; value: string }[];
  body: ArticleContentBlock[];
  postTags: string[];
  buildCreditName: string;
  buildCreditRole: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent, and a trailing
   *  "[Get a proposal](/contact)"-style link is appended in the page itself. */
  buildCreditBio: string;
  relatedItems: CaseStudyRelatedItem[];
}

export interface Employer {
  name: string;
  label: string;
  /** Public path to the brand mark SVG — falls back to a text placeholder when unset. */
  logo?: string;
}

export interface ClientWorkItem {
  client: string;
  dateRange: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
  tags: string[];
  value?: string;
}

export interface ExperienceItem {
  company: string;
  period: string;
  role: string;
  description: string;
}

export interface SkillCategory {
  label: string;
  tags: string[];
}
