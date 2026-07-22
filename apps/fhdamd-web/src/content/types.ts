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

export interface Employer {
  name: string;
  label: string;
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
