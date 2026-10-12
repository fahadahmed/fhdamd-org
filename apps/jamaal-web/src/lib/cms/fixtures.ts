import type { RawContent, RawHome, RawJournal, RawPress, RawSiteConfig } from "./types";

/** Complete DatoCMS responses for tests: every text field holds its own name unless a test overrides it. */

const fill = (keys: string[], overrides: Record<string, string> = {}): Record<string, string> =>
  Object.fromEntries(keys.map((key) => [key, overrides[key] ?? `[${key}]`]));

const SITE_KEYS = ['contactEmail', 'footerLine', 'siteDescription', 'navButtonWaitlist', 'navButtonTestflight', 'navButtonLaunched', 'appStoreUrl', 'ctaLabelWaitlist', 'ctaLabelTestflight', 'ctaLabelLaunched', 'ctaTitleTestflight', 'ctaShortTitleLaunched', 'ctaTitleWaitlist', 'ctaShortTitleEarly', 'ctaTitleLaunched', 'ctaBodyWaitlist', 'ctaBodyTestflight', 'ctaBodyLaunched'];

const HOME_KEYS = ['heroEyebrowWaitlist', 'heroEyebrowTestflight', 'heroEyebrowLaunched', 'heroTitle', 'heroTitleLineTwo', 'heroAccent', 'heroLede', 'heroTrialNote', 'heroAltPhone', 'heroAltMac', 'heroAltWidget', 'formWaitlistSending', 'formWaitlistSubmit', 'formWaitlistNote', 'formTestflightSending', 'formTestflightSubmit', 'formTestflightNote', 'formTestflightSteps', 'whyEyebrow', 'whyTitle', 'whyAccent', 'whyBody', 'whyColumnThem', 'whyColumnUs', 'orderEyebrow', 'orderTitle', 'orderAccent', 'orderParagraphs', 'orderButtonGrid', 'orderButtonSort', 'orderAxisMatters', 'orderAxisDue', 'orderAxisLater', 'everywhereEyebrow', 'everywhereTitle', 'everywhereAccent', 'everywhereBody', 'everywhereFold', 'everywhereUnfold', 'comingLabel', 'dayEyebrow', 'dayTitle', 'planEyebrow', 'planTitle', 'planAccent', 'planBody', 'canvasLabel', 'canvasBody', 'canvasAlt', 'principlesEyebrow', 'principlesTitle', 'principlesAccent', 'principlesBody', 'devEyebrow', 'devQuote', 'devAccent', 'devInitial', 'devName', 'devByline', 'pricingEyebrowEarly', 'pricingLedeEarly', 'pricingEyebrowLaunched', 'pricingLedeLaunched', 'pricingTitle', 'pricingAccent', 'pricingAfterTrial', 'pricingCurrency', 'privacyEyebrow', 'privacyTitle', 'privacyAccent', 'faqTitle', 'joinTitle', 'joinAccent', 'joinLedeWaitlist', 'joinLedeTestflight', 'joinLedeLaunched'];

export const rawSite = (overrides: Record<string, string> = {}) => fill(SITE_KEYS, overrides) as unknown as RawSiteConfig;

export const rawHome = (): RawHome => ({
  siteConfig: rawSite(),
  homePage: {
    ...(fill(HOME_KEYS, {
      orderParagraphs: "First paragraph.\n\nSecond paragraph.",
      formTestflightSteps: "Install TestFlight.\nOpen the invite.\nTap Install.",
    }) as unknown as NonNullable<RawHome["homePage"]>),
    whyRows: [{ them: "A list app", us: "Jamaal" }],
    orderChips: [1, 2, 3, 4].map((n) => ({ title: `Task ${n}`, detail: `Detail ${n}` })),
    everywhereCards: ["iphone", "duo", "ipad", "mac", "widgets", "watch", "live_activity"].map((device) => ({
      device,
      name: `${device} name`,
      text: `${device} text`,
      alt: `${device} alt`,
      altSecond: device === "duo" || device === "widgets" ? `${device} alt 2` : null,
      altThird: device === "widgets" ? `${device} alt 3` : null,
    })),
    planSteps: [1, 2, 3, 4, 5].map((n) => ({ title: `Step ${n}`, text: `Step ${n} text` })),
    principlesItems: [{ title: "No streaks.", text: "Nothing breaks." }],
    privacyItems: [{ title: "No account", text: "Nothing to sign up for." }],
    pricingPlans: [
      { name: "Monthly", offerName: "Monthly", price: "$2.99", unit: "a month", featured: false },
      { name: "Yearly", offerName: "Yearly", price: "$24.99", unit: "a year", featured: true },
    ],
  },
  allFaqItems: [
    { question: "Early?", answer: "Soon.", stages: ["waitlist"], shownOn: [] },
    { question: "Beta?", answer: "Yes.", stages: ["testflight"], shownOn: [] },
    { question: "Always?", answer: "Yes.", stages: ["waitlist", "testflight", "launched"], shownOn: ["support"] },
    { question: "Support only?", answer: "Yes.", stages: [], shownOn: ["support"] },
  ],
  allDayChapters: [1, 2, 3, 4, 5, 6].map((n) => ({ time: `0${n}:00`, label: `Label ${n}`, title: `Title ${n}`, text: `Text ${n}`, place: `Place ${n}` })),
});

export const rawJournal = (): RawJournal => ({
  siteConfig: rawSite(),
  journalPage: {
    eyebrow: "Journal",
    accent: "a calmer day.",
    title: "Notes on",
    lede: "Why Jamaal works the way it does.",
    readStory: "Read the story →",
    back: "← Journal",
    empty: "Nothing here yet.",
    filterAll: "All",
    nextLabel: "Next",
    authorName: "Fahad Ahmed",
    authorRole: "Maker of Jamaal",
    authorInitial: "F",
  },
  allPosts: [
    { slug: "a", title: "A", category: "Story", date: "2026-10-08", readMinutes: 6, excerpt: "e", lede: "l", featured: true, body: null },
    { slug: "b", title: "B", category: "Guides", date: "2026-10-09", readMinutes: 4, excerpt: "e", lede: "l", body: null },
  ],
});

const para = (...children: object[]) => ({ type: "paragraph", children });
const span = (value: string) => ({ type: "span", value });

export const rawContent = (): RawContent => ({
  siteConfig: rawSite(),
  contentPage: {
    pageKey: "privacy",
    eyebrow: "Privacy",
    title: "Your day is yours.",
    description: "How we handle your information.",
    updated: "2026-10-11",
    body: {
      value: {
        document: {
          type: "root",
          children: [
            { type: "heading", level: 2, children: [span("This website")] },
            para(span("We use "), { type: "link", url: "mailto:a@b.c", children: [span("email")] }, span(".")),
            { type: "list", style: "bulleted", children: [{ type: "listItem", children: [para(span("one"))] }, { type: "listItem", children: [para(span("two"))] }] },
            { type: "block", item: "note-1" },
            { type: "block", item: "faq-1" },
          ],
        },
      },
      blocks: [
        { __typename: "ConditionalNoteRecord", id: "note-1", condition: "error_reporting", text: "Sentry note" },
        { __typename: "FaqListRecord", id: "faq-1", shownOn: "support" },
      ],
    },
  },
  allFaqItems: rawHome().allFaqItems,
});

export const rawPress = (): RawPress => ({
  siteConfig: rawSite(),
  pressPage: {
    eyebrow: "Press kit",
    title: "Writing about Jamaal?",
    intro: "Everything below is free to use.",
    statusWaitlist: "Coming soon.",
    statusTestflight: "In beta.",
    statusLaunched: "Available now.",
    aboutHeading: "About",
    about: "One.\n\nTwo.",
    factsHeading: "At a glance",
    facts: [{ label: "Name", value: "Jamaal" }],
    downloadsHeading: "Downloads",
    files: [
      { label: "App icon", note: "PNG", alt: "The icon", file: { url: "https://www.datocms-assets.com/1/icon.png", width: 1024, height: 1024, filename: "icon.png", mimeType: "image/png" } },
      { label: "Brief", note: "PDF", alt: "A brief", file: { url: "https://www.datocms-assets.com/1/brief.pdf", width: null, height: null, filename: "brief.pdf", mimeType: "application/pdf" } },
    ],
    brandHeading: "Colour and type",
    colours: [{ name: "Terracotta", hex: "#9A4F2E", use: "Buttons" }],
    fonts: "Fraunces.",
    contactHeading: "Contact",
    contactText: "Questions:",
  },
});
