import { DAY_DEVICES, ORDER_CHIP_LAYOUT, PLAN_CANVAS_SCREEN, PLAN_SCREENS } from "../../data/layout";
import type { Stage } from "../../data/stage";
import { inlineHtml, plainText } from "../datocms";
import type { Dast } from "../datocms";
import type {
  ContentPageModel,
  HomeModel,
  JournalPageModel,
  PageBlock,
  PressModel,
  SiteModel,
  TitledText,
} from "./models";
import { SHARE_SIZE, shareImageUrl } from "./seo";
import type { RawContent, RawFaqItem, RawHome, RawJournalPage, RawPress, RawSiteConfig } from "./types";

/** Thrown when DatoCMS is missing something the site needs. It fails the build rather than ship a page with a hole in it. */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

const empty = (value: unknown) =>
  value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);

type Strict<T, O extends keyof T> = { [K in Exclude<keyof T, O>]: NonNullable<T[K]> } & { [K in O]: T[K] };

/** Returns the record with every field present, or throws naming each one that is missing. `optional` fields may be empty. */
export function strict<T extends object>(record: T | null | undefined, name: string): { [K in keyof T]: NonNullable<T[K]> };
export function strict<T extends object, O extends keyof T>(record: T | null | undefined, name: string, optional: readonly O[]): Strict<T, O>;
export function strict<T extends object>(record: T | null | undefined, name: string, optional: readonly string[] = []): unknown {
  if (!record) throw new ContentError(`DatoCMS has no published ${name} record.`);
  const missing = Object.entries(record)
    .filter(([key, value]) => !optional.includes(key) && empty(value))
    .map(([key]) => key);
  if (missing.length) throw new ContentError(`The ${name} record in DatoCMS is missing: ${missing.join(", ")}.`);
  return record;
}

const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "11 October 2026" from an ISO date. */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const name = MONTHS[Number(month) - 1];
  if (!name || !day) throw new ContentError(`Not a date: ${iso}`);
  return `${Number(day)} ${name} ${year}`;
}

/** An anchor id from a heading: "This website" becomes "this-website". */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function toSite(raw: RawSiteConfig | null): SiteModel {
  const s = strict(raw, "site settings", ["shareImage"] as const);
  return {
    name: s.siteName,
    share: {
      image: s.shareImage ? { url: shareImageUrl(s.shareImage.url, "crop"), width: SHARE_SIZE.width, height: SHARE_SIZE.height, alt: s.shareImage.alt?.trim() || s.shareImageAlt } : null,
      alt: s.shareImageAlt,
    },
    contactEmail: s.contactEmail,
    footerLine: s.footerLine,
    description: s.siteDescription,
    navButton: { waitlist: s.navButtonWaitlist, testflight: s.navButtonTestflight, launched: s.navButtonLaunched },
    appStoreUrl: s.appStoreUrl,
    journalCta: {
      waitlist: { label: s.ctaLabelWaitlist, title: s.ctaTitleWaitlist, shortTitle: s.ctaShortTitleEarly, body: s.ctaBodyWaitlist },
      testflight: { label: s.ctaLabelTestflight, title: s.ctaTitleTestflight, shortTitle: s.ctaShortTitleEarly, body: s.ctaBodyTestflight },
      launched: { label: s.ctaLabelLaunched, title: s.ctaTitleLaunched, shortTitle: s.ctaShortTitleLaunched, body: s.ctaBodyLaunched },
    },
  };
}

/** The questions to list for a place: the home page (by stage) or a page such as support. */
export function faqFor(items: RawFaqItem[], where: { stage: Stage } | { shownOn: string }): { question: string; answer: string }[] {
  return items
    .filter((item) => ("stage" in where ? item.stages?.includes(where.stage) : item.shownOn?.includes(where.shownOn)))
    .map((item) => {
      const q = strict({ question: item.question, answer: item.answer }, "FAQ item");
      return { question: q.question, answer: q.answer };
    });
}

const titledText = (rows: { title: string | null; text: string | null }[], name: string): TitledText[] =>
  rows.map((row) => {
    const r = strict(row, name);
    return { title: r.title, body: r.text };
  });

type DeviceCards = NonNullable<RawHome["homePage"]>["everywhereCards"];

/** Looks a card up by its device. The second and third picture descriptions are only used by the cards that have more than one picture. */
function deviceCards(cards: DeviceCards) {
  const byDevice = new Map(cards.map((card) => [card.device, card]));
  return (device: string) => {
    const card = byDevice.get(device);
    if (!card) throw new ContentError(`The "Everywhere" cards in DatoCMS have no card for "${device}".`);
    return strict(card, `${device} device card`, ["altSecond", "altThird"] as const);
  };
}

export function toHome(raw: RawHome, stage: Stage): HomeModel {
  const h = strict(raw.homePage, "home page", ["seo"] as const);
  const card = deviceCards(h.everywhereCards);

  const chapters = raw.allDayChapters.map((c) => strict(c, "day chapter"));
  if (chapters.length !== DAY_DEVICES.length) {
    throw new ContentError(`The day story has ${DAY_DEVICES.length} pictures but DatoCMS has ${chapters.length} chapters.`);
  }
  if (h.orderChips.length !== ORDER_CHIP_LAYOUT.length) {
    throw new ContentError(`The order example has ${ORDER_CHIP_LAYOUT.length} places but DatoCMS has ${h.orderChips.length} tasks.`);
  }
  if (h.planSteps.length !== PLAN_SCREENS.length) {
    throw new ContentError(`Night Planning has ${PLAN_SCREENS.length} screens but DatoCMS has ${h.planSteps.length} steps.`);
  }

  const pick = <T>(by: Record<Stage, T>): T => by[stage];
  const iphone = card("iphone");
  const duo = card("duo");
  const ipad = card("ipad");
  const mac = card("mac");
  const widgets = card("widgets");
  const watch = card("watch");
  const live = card("live_activity");

  const beta = stage === "testflight";

  return {
    hero: {
      eyebrow: pick({ waitlist: h.heroEyebrowWaitlist, testflight: h.heroEyebrowTestflight, launched: h.heroEyebrowLaunched }),
      title: h.heroTitle,
      titleLine2: h.heroTitleLineTwo,
      accent: h.heroAccent,
      lede: h.heroLede,
      trialNote: h.heroTrialNote,
      alt: { phone: h.heroAltPhone, mac: h.heroAltMac, widget: h.heroAltWidget },
    },
    form: {
      submitLabel: beta ? h.formTestflightSubmit : h.formWaitlistSubmit,
      sendingLabel: beta ? h.formTestflightSending : h.formWaitlistSending,
      note: beta ? h.formTestflightNote : h.formWaitlistNote,
      steps: lines(h.formTestflightSteps),
    },
    why: {
      eyebrow: h.whyEyebrow,
      title: h.whyTitle,
      accent: h.whyAccent,
      body: h.whyBody,
      columns: { them: h.whyColumnThem, us: h.whyColumnUs },
      rows: h.whyRows.map((row) => strict(row, "comparison row")),
    },
    order: {
      eyebrow: h.orderEyebrow,
      title: h.orderTitle,
      accent: h.orderAccent,
      paragraphs: paragraphs(h.orderParagraphs),
      axes: { matters: h.orderAxisMatters, due: h.orderAxisDue, later: h.orderAxisLater },
      buttons: { sort: h.orderButtonSort, grid: h.orderButtonGrid },
      chips: h.orderChips.map((chip, i) => {
        const c = strict(chip, "order example");
        return { ...ORDER_CHIP_LAYOUT[i], title: c.title, meta: c.detail };
      }),
    },
    day: {
      eyebrow: h.dayEyebrow,
      title: h.dayTitle,
      comingLabel: h.comingLabel,
      chapters: chapters.map((c, i) => ({ time: c.time, label: c.label, title: c.title, body: c.text, where: c.place, devices: DAY_DEVICES[i] })),
    },
    plan: {
      eyebrow: h.planEyebrow,
      title: h.planTitle,
      accent: h.planAccent,
      body: h.planBody,
      steps: h.planSteps.map((step, i) => {
        const s = strict(step, "Night Planning step");
        return { title: s.title, body: s.text, src: PLAN_SCREENS[i] };
      }),
      canvas: { label: h.canvasLabel, body: h.canvasBody, src: PLAN_CANVAS_SCREEN, alt: h.canvasAlt },
    },
    everywhere: {
      eyebrow: h.everywhereEyebrow,
      title: h.everywhereTitle,
      accent: h.everywhereAccent,
      body: h.everywhereBody,
      comingLabel: h.comingLabel,
      iphone: { name: iphone.name, body: iphone.text, alt: iphone.alt },
      duo: { name: duo.name, body: duo.text, foldedAlt: duo.alt, openAlt: duo.altSecond ?? duo.alt, fold: h.everywhereFold, unfold: h.everywhereUnfold },
      ipad: { name: ipad.name, body: ipad.text, alt: ipad.alt },
      mac: { name: mac.name, body: mac.text, alt: mac.alt },
      widgets: { name: widgets.name, body: widgets.text, mediumAlt: widgets.alt, upcomingAlt: widgets.altSecond ?? widgets.alt, smallAlt: widgets.altThird ?? widgets.alt },
      watch: { name: watch.name, body: watch.text, alt: watch.alt },
      liveActivity: { name: live.name, body: live.text, alt: live.alt },
    },
    principles: {
      eyebrow: h.principlesEyebrow,
      title: h.principlesTitle,
      accent: h.principlesAccent,
      body: h.principlesBody,
      items: titledText(h.principlesItems, "principle"),
    },
    developerNote: {
      eyebrow: h.devEyebrow,
      quote: h.devQuote,
      accent: h.devAccent,
      initial: h.devInitial,
      name: h.devName,
      byline: h.devByline,
    },
    pricing: {
      eyebrow: stage === "launched" ? h.pricingEyebrowLaunched : h.pricingEyebrowEarly,
      title: h.pricingTitle,
      accent: h.pricingAccent,
      lede: stage === "launched" ? h.pricingLedeLaunched : h.pricingLedeEarly,
      plans: h.pricingPlans.map((plan) => {
        const p = strict({ ...plan, featured: plan.featured ?? false }, "price plan");
        return { name: p.name, offerName: p.offerName, price: p.price, unit: p.unit, featured: p.featured };
      }),
      afterTrial: h.pricingAfterTrial,
      currency: h.pricingCurrency,
    },
    privacy: { eyebrow: h.privacyEyebrow, title: h.privacyTitle, accent: h.privacyAccent, items: titledText(h.privacyItems, "privacy point") },
    faq: { title: h.faqTitle, items: faqFor(raw.allFaqItems, { stage }) },
    join: {
      title: h.joinTitle,
      accent: h.joinAccent,
      lede: pick({ waitlist: h.joinLedeWaitlist, testflight: h.joinLedeTestflight, launched: h.joinLedeLaunched }),
    },
  };
}

export function toJournalPage(raw: RawJournalPage | null): JournalPageModel {
  const j = strict(raw, "journal page", ["seo"] as const);
  return { eyebrow: j.eyebrow, title: j.title, accent: j.accent, lede: j.lede, readStory: j.readStory, back: j.back, empty: j.empty, filterAll: j.filterAll, nextLabel: j.nextLabel, author: { name: j.authorName, role: j.authorRole, initial: j.authorInitial } };
}

interface DatoBlock {
  __typename: string;
  id: string;
  [key: string]: unknown;
}

export interface PageFlags {
  /** True when the build has error reporting switched on. */
  errorReporting: boolean;
}

/** Turns a content page's Structured Text into the blocks the page renders. */
export function toPageBlocks(raw: RawContent, flags: PageFlags): PageBlock[] {
  const body = raw.contentPage?.body;
  const byId = new Map((body?.blocks ?? []).map((b: DatoBlock) => [b.id, b]));
  const document = (body?.value as { document?: Dast } | undefined)?.document;
  const out: PageBlock[] = [];

  for (const node of document?.children ?? []) {
    if (node.type === "heading") {
      const text = plainText(node.children);
      out.push({ type: "h2", id: slugify(text), text });
    } else if (node.type === "paragraph") {
      const html = inlineHtml(node.children);
      if (html.trim()) out.push({ type: "p", html });
    } else if (node.type === "list") {
      const items = (node.children ?? []).map((li) => inlineHtml(li.children?.flatMap((p) => p.children ?? [])));
      out.push({ type: "list", ordered: node.style === "numbered", items });
    } else if (node.type === "block") {
      const block = node.item ? byId.get(node.item) : undefined;
      if (!block) continue;
      if (block.__typename === "ConditionalNoteRecord") {
        if (block.condition !== "error_reporting") throw new ContentError(`Unknown condition "${String(block.condition)}" in a page note.`);
        if (flags.errorReporting) out.push({ type: "note", text: String(block.text ?? "") });
      } else if (block.__typename === "FaqListRecord") {
        out.push({ type: "faq", items: faqFor(raw.allFaqItems, { shownOn: String(block.shownOn ?? "support") }) });
      }
    }
  }
  return out;
}

export function toContentPage(raw: RawContent, flags: PageFlags): ContentPageModel {
  const p = raw.contentPage;
  if (!p) throw new ContentError("DatoCMS has no published page for this address.");
  const { eyebrow, title, description } = strict({ eyebrow: p.eyebrow, title: p.title, description: p.description }, `${p.pageKey ?? "content"} page`);
  const blocks = toPageBlocks(raw, flags);
  if (!blocks.length) throw new ContentError(`The ${p.pageKey} page in DatoCMS has no body.`);
  return { eyebrow, title, description, updated: p.updated ? longDate(p.updated) : null, blocks };
}

export function toPress(raw: RawPress, stage: Stage): PressModel {
  const p = strict(raw.pressPage, "press page", ["seo"] as const);
  return {
    eyebrow: p.eyebrow,
    title: p.title,
    intro: p.intro,
    status: { waitlist: p.statusWaitlist, testflight: p.statusTestflight, launched: p.statusLaunched }[stage],
    aboutHeading: p.aboutHeading,
    about: paragraphs(p.about),
    factsHeading: p.factsHeading,
    facts: p.facts.map((fact) => strict(fact, "press fact")),
    downloadsHeading: p.downloadsHeading,
    files: p.files.map((entry) => {
      const f = strict(entry, "press file");
      return { label: f.label, note: f.note, alt: f.alt, url: f.file.url, filename: f.file.filename, width: f.file.width, height: f.file.height, isImage: f.file.mimeType.startsWith("image/") };
    }),
    brandHeading: p.brandHeading,
    colours: p.colours.map((colour) => strict(colour, "brand colour")),
    fonts: p.fonts,
    contactHeading: p.contactHeading,
    contactText: p.contactText,
  };
}
