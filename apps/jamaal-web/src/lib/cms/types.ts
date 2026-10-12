/**
 * What DatoCMS returns for each query in queries.ts, before it is checked and
 * reshaped (see mappers.ts). Fields that editors can leave empty are nullable.
 */

export interface RawSiteConfig {
  contactEmail: string | null;
  footerLine: string | null;
  siteDescription: string | null;
  navButtonWaitlist: string | null;
  navButtonTestflight: string | null;
  navButtonLaunched: string | null;
  appStoreUrl: string | null;
  ctaLabelWaitlist: string | null;
  ctaLabelTestflight: string | null;
  ctaLabelLaunched: string | null;
  ctaTitleTestflight: string | null;
  ctaShortTitleLaunched: string | null;
  ctaTitleWaitlist: string | null;
  ctaShortTitleEarly: string | null;
  ctaTitleLaunched: string | null;
  ctaBodyWaitlist: string | null;
  ctaBodyTestflight: string | null;
  ctaBodyLaunched: string | null;
  siteName: string | null;
  shareImageAlt: string | null;
  shareImage: RawShareImage | null;
}

export interface RawShareImage {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
}

/** The "Search and sharing" field on a page. Everything in it is optional. */
export interface RawSeo {
  title?: string | null;
  description?: string | null;
  twitterCard?: string | null;
  noIndex?: boolean | null;
  image?: RawShareImage | null;
}

export interface RawHomePage {
  seo: RawSeo | null;
  heroEyebrowWaitlist: string | null;
  heroEyebrowTestflight: string | null;
  heroEyebrowLaunched: string | null;
  heroTitle: string | null;
  heroTitleLineTwo: string | null;
  heroAccent: string | null;
  heroLede: string | null;
  heroTrialNote: string | null;
  heroAltPhone: string | null;
  heroAltMac: string | null;
  heroAltWidget: string | null;
  formWaitlistSending: string | null;
  formWaitlistSubmit: string | null;
  formWaitlistNote: string | null;
  formTestflightSending: string | null;
  formTestflightSubmit: string | null;
  formTestflightNote: string | null;
  formTestflightSteps: string | null;
  whyEyebrow: string | null;
  whyTitle: string | null;
  whyAccent: string | null;
  whyBody: string | null;
  whyColumnThem: string | null;
  whyColumnUs: string | null;
  orderEyebrow: string | null;
  orderTitle: string | null;
  orderAccent: string | null;
  orderParagraphs: string | null;
  orderButtonGrid: string | null;
  orderButtonSort: string | null;
  orderAxisMatters: string | null;
  orderAxisDue: string | null;
  orderAxisLater: string | null;
  everywhereEyebrow: string | null;
  everywhereTitle: string | null;
  everywhereAccent: string | null;
  everywhereBody: string | null;
  everywhereFold: string | null;
  everywhereUnfold: string | null;
  comingLabel: string | null;
  dayEyebrow: string | null;
  dayTitle: string | null;
  planEyebrow: string | null;
  planTitle: string | null;
  planAccent: string | null;
  planBody: string | null;
  canvasLabel: string | null;
  canvasBody: string | null;
  canvasAlt: string | null;
  principlesEyebrow: string | null;
  principlesTitle: string | null;
  principlesAccent: string | null;
  principlesBody: string | null;
  devEyebrow: string | null;
  devQuote: string | null;
  devAccent: string | null;
  devInitial: string | null;
  devName: string | null;
  devByline: string | null;
  pricingEyebrowEarly: string | null;
  pricingLedeEarly: string | null;
  pricingEyebrowLaunched: string | null;
  pricingLedeLaunched: string | null;
  pricingTitle: string | null;
  pricingAccent: string | null;
  pricingAfterTrial: string | null;
  pricingCurrency: string | null;
  privacyEyebrow: string | null;
  privacyTitle: string | null;
  privacyAccent: string | null;
  faqTitle: string | null;
  joinTitle: string | null;
  joinAccent: string | null;
  joinLedeWaitlist: string | null;
  joinLedeTestflight: string | null;
  joinLedeLaunched: string | null;
  whyRows: { them: string | null; us: string | null }[];
  orderChips: { title: string | null; detail: string | null }[];
  everywhereCards: { device: string | null; name: string | null; text: string | null; alt: string | null; altSecond: string | null; altThird: string | null }[];
  planSteps: { title: string | null; text: string | null }[];
  principlesItems: { title: string | null; text: string | null }[];
  privacyItems: { title: string | null; text: string | null }[];
  pricingPlans: { name: string | null; offerName: string | null; price: string | null; unit: string | null; featured: boolean | null }[];
}

export interface RawFaqItem {
  question: string | null;
  answer: string | null;
  /** The stages the home page shows this question in; empty keeps it off the home page. */
  stages: string[] | null;
  /** Where else it shows: "support" lists it on the support page. */
  shownOn: string[] | null;
}

export interface RawDayChapter {
  time: string | null;
  label: string | null;
  title: string | null;
  text: string | null;
  place: string | null;
}

export interface RawHome {
  siteConfig: RawSiteConfig | null;
  homePage: RawHomePage | null;
  allFaqItems: RawFaqItem[];
  allDayChapters: RawDayChapter[];
}

export interface RawJournalPage {
  seo: RawSeo | null;
  eyebrow: string | null;
  accent: string | null;
  title: string | null;
  lede: string | null;
  readStory: string | null;
  back: string | null;
  empty: string | null;
  filterAll: string | null;
  nextLabel: string | null;
  authorName: string | null;
  authorRole: string | null;
  authorInitial: string | null;
}

export interface RawImage {
  url: string;
  alt?: string | null;
}

export interface RawPost {
  slug: string;
  title: string;
  accent?: string | null;
  category: string;
  date: string;
  readMinutes: number;
  excerpt: string;
  featuredExcerpt?: string | null;
  lede: string;
  featured?: boolean | null;
  ctaNote?: string | null;
  next?: { slug: string } | null;
  cover?: RawImage | null;
  seo?: RawSeo | null;
  body?: { value: unknown; blocks?: ({ __typename: string; id: string } & Record<string, unknown>)[] } | null;
}

export interface RawJournal {
  siteConfig: RawSiteConfig | null;
  journalPage: RawJournalPage | null;
  allPosts: RawPost[];
}

export interface RawContentPage {
  seo: RawSeo | null;
  pageKey: string | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  updated: string | null;
  body: { value: unknown; blocks?: ({ __typename: string; id: string } & Record<string, unknown>)[] } | null;
}

export interface RawContent {
  siteConfig: RawSiteConfig | null;
  contentPage: RawContentPage | null;
  allFaqItems: RawFaqItem[];
}

export interface RawPress {
  siteConfig: RawSiteConfig | null;
  pressPage: {
    seo: RawSeo | null;
    eyebrow: string | null;
    title: string | null;
    intro: string | null;
    statusWaitlist: string | null;
    statusTestflight: string | null;
    statusLaunched: string | null;
    aboutHeading: string | null;
    about: string | null;
    factsHeading: string | null;
    facts: { label: string | null; value: string | null }[];
    downloadsHeading: string | null;
    files: { label: string | null; note: string | null; alt: string | null; file: { url: string; width: number | null; height: number | null; filename: string; mimeType: string } | null }[];
    brandHeading: string | null;
    colours: { name: string | null; hex: string | null; use: string | null }[];
    fonts: string | null;
    contactHeading: string | null;
    contactText: string | null;
  } | null;
}

export interface RawSite {
  siteConfig: RawSiteConfig | null;
}

interface Stamped {
  _updatedAt: string;
}

interface Hideable extends Stamped {
  seo: { noIndex: boolean | null } | null;
}

export interface RawSitemap {
  siteConfig: Stamped | null;
  homePage: Hideable | null;
  journalPage: Hideable | null;
  pressPage: Hideable | null;
  allContentPages: (Hideable & { pageKey: string })[];
  allPosts: (Hideable & { slug: string })[];
  allFaqItems: Stamped[];
  allDayChapters: Stamped[];
}
