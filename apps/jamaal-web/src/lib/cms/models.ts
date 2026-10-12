import type { DayDevice } from "../../data/layout";
import type { Stage } from "../../data/stage";

/** The shapes the pages and components render. Built from DatoCMS by mappers.ts, with the stage already applied. */

export interface JournalCta {
  label: string;
  title: string;
  shortTitle: string;
  body: string;
}

export interface ShareImage {
  /** An absolute DatoCMS URL, or a path on this site for the built-in image. */
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
}

/** What a page puts in its <head>, after the page, the site settings and the defaults have been combined. */
export interface SeoModel {
  title: string;
  description: string;
  image: ShareImage;
  twitterCard: "summary" | "summary_large_image";
  noindex: boolean;
}

export interface SiteModel {
  /** For example "Jamaal": the end of a page title. */
  name: string;
  /** The default share image from the site settings, if one is set, and its description. */
  share: { image: ShareImage | null; alt: string };
  contactEmail: string;
  footerLine: string;
  description: string;
  navButton: Record<Stage, string>;
  /** Where "Download on the App Store" points. `#join` until the app is on sale. */
  appStoreUrl: string;
  journalCta: Record<Stage, JournalCta>;
}

export interface FormCopy {
  submitLabel: string;
  /** Shown on the button while the signup is being sent. */
  sendingLabel: string;
  note: string;
  /** What to do once the TestFlight invite arrives. */
  steps: string[];
}

export interface SectionHead {
  eyebrow: string;
  title: string;
  accent: string;
}

export interface TitledText {
  title: string;
  body: string;
}

export interface DeviceCopy {
  name: string;
  body: string;
  alt: string;
}

export interface DayChapter {
  time: string;
  label: string;
  title: string;
  body: string;
  where: string;
  devices: readonly DayDevice[];
}

export interface HomeModel {
  hero: {
    eyebrow: string;
    title: string;
    titleLine2: string;
    accent: string;
    lede: string;
    trialNote: string;
    alt: { phone: string; mac: string; widget: string };
  };
  /** The signup form's copy for this stage; not used once launched. */
  form: FormCopy;
  why: SectionHead & {
    body: string;
    columns: { them: string; us: string };
    rows: { them: string; us: string }[];
  };
  order: SectionHead & {
    paragraphs: string[];
    axes: { matters: string; due: string; later: string };
    buttons: { sort: string; grid: string };
    chips: { n: string; title: string; meta: string; gx: number; gy: number; ly: number }[];
  };
  day: { eyebrow: string; title: string; comingLabel: string; chapters: DayChapter[] };
  plan: SectionHead & {
    body: string;
    steps: (TitledText & { src: string })[];
    canvas: { label: string; body: string; src: string; alt: string };
  };
  everywhere: SectionHead & {
    body: string;
    comingLabel: string;
    iphone: DeviceCopy;
    duo: { name: string; body: string; foldedAlt: string; openAlt: string; fold: string; unfold: string };
    ipad: DeviceCopy;
    mac: DeviceCopy;
    widgets: { name: string; body: string; mediumAlt: string; upcomingAlt: string; smallAlt: string };
    watch: DeviceCopy;
    liveActivity: DeviceCopy;
  };
  principles: SectionHead & { body: string; items: TitledText[] };
  developerNote: { eyebrow: string; quote: string; accent: string; initial: string; name: string; byline: string };
  pricing: {
    eyebrow: string;
    title: string;
    accent: string;
    lede: string;
    plans: { name: string; offerName: string; price: string; unit: string; featured: boolean }[];
    afterTrial: string;
    currency: string;
  };
  privacy: SectionHead & { items: TitledText[] };
  faq: { title: string; items: { question: string; answer: string }[] };
  join: { title: string; accent: string; lede: string };
}

export interface JournalPageModel {
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  readStory: string;
  back: string;
  empty: string;
  filterAll: string;
  nextLabel: string;
  /** Shown under the title of every article. */
  author: { name: string; role: string; initial: string };
}

export type PageBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "note"; text: string }
  | { type: "faq"; items: { question: string; answer: string }[] };

export interface ContentPageModel {
  eyebrow: string;
  title: string;
  description: string;
  /** For example "11 October 2026"; null on pages that are not dated. */
  updated: string | null;
  blocks: PageBlock[];
}

export interface PressFileModel {
  label: string;
  note: string;
  alt: string;
  url: string;
  /** Used to name the download. */
  filename: string;
  width: number | null;
  height: number | null;
  /** Pictures get a preview; anything else (a PDF, say) is listed for download. */
  isImage: boolean;
}

export interface PressModel {
  eyebrow: string;
  title: string;
  intro: string;
  status: string;
  aboutHeading: string;
  about: string[];
  factsHeading: string;
  facts: { label: string; value: string }[];
  downloadsHeading: string;
  files: PressFileModel[];
  brandHeading: string;
  colours: { name: string; hex: string; use: string }[];
  fonts: string;
  contactHeading: string;
  contactText: string;
}
