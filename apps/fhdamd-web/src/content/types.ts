/**
 * Content model types for src/lib/content — the return shape each page
 * expects, whether the underlying source is a plain data module
 * (src/content/site/*.ts) or an Astro Content Collection
 * (src/content.config.ts). Blog post and case study detail bodies aren't
 * modelled here — those render live MDX via astro:content's render(),
 * typed by the Zod schemas in src/content.config.ts instead.
 */

export interface SiteSettings {
  email: string;
  github: string;
  location: string;
  currentEmployer: string;
  currentTitle: string;
  availabilityTitle: string;
  availabilityStatus: boolean;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  ctaTitle: string;
  ctaSubtitle: string;
  footerCopyrightNote: string;
  authorInitials: string;
  authorName: string;
  authorRole: string;
}

export interface AboutPage {
  heroKicker: string;
  heroHeading: string;
  heroSubheading: string;
  /** Plain paragraphs, each rendered via set:html — hand-authored HTML for inline marks. */
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

export interface LabItem {
  /** Omitted for comingSoon placeholders — Lab items have no detail pages of
   *  their own, so a real item links out (e.g. to a blog post). */
  href?: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  title: string;
  description: string;
  dateLabel: string;
  /** First tag is the displayed badge; the full set drives tag-filter matching. */
  tags: string[];
  comingSoon?: boolean;
}

export interface LabPage {
  heroKicker: string;
  /** Plain string; wrap a segment in *asterisks* for an <em> accent. */
  heroHeading: string;
  heroSubheading: string;
  items: LabItem[];
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
