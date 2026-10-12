import { describe, expect, it } from "vitest";
import { rawContent, rawHome, rawJournal, rawPress, rawSite } from "./fixtures";
import { ContentError, faqFor, longDate, slugify, strict, toContentPage, toHome, toJournalPage, toPageBlocks, toPress, toSite } from "./mappers";

describe("strict", () => {
  it("returns the record when nothing is missing", () => {
    expect(strict({ a: "x", b: ["y"] }, "thing")).toEqual({ a: "x", b: ["y"] });
  });

  it("names every missing field, and treats blank text and empty lists as missing", () => {
    expect(() => strict({ a: null, b: "  ", c: [], d: "ok" }, "home page")).toThrow("The home page record in DatoCMS is missing: a, b, c.");
  });

  it("allows the fields it is told are optional", () => {
    expect(strict({ a: "x", b: null }, "thing", ["b"] as const)).toEqual({ a: "x", b: null });
  });

  it("fails when there is no record at all", () => {
    expect(() => strict(null, "home page")).toThrow(ContentError);
    expect(() => strict(undefined, "press page")).toThrow("no published press page record");
  });
});

describe("longDate and slugify", () => {
  it("writes a date in full", () => {
    expect(longDate("2026-10-11")).toBe("11 October 2026");
    expect(longDate("2026-01-05")).toBe("5 January 2026");
  });

  it("rejects something that is not a date", () => {
    expect(() => longDate("soon")).toThrow(ContentError);
  });

  it("makes anchor ids from headings", () => {
    expect(slugify("This website")).toBe("this-website");
    expect(slugify("If you don't subscribe")).toBe("if-you-don-t-subscribe");
    expect(slugify("  Café & crème!  ")).toBe("cafe-creme");
  });
});

describe("toSite", () => {
  it("groups the nav buttons and the Journal call to action by stage", () => {
    const site = toSite(rawSite({ navButtonWaitlist: "Join", ctaShortTitleEarly: "Early", ctaShortTitleLaunched: "Launched" }));
    expect(site.navButton).toEqual({ waitlist: "Join", testflight: "[navButtonTestflight]", launched: "[navButtonLaunched]" });
    expect(site.journalCta.waitlist.shortTitle).toBe("Early");
    expect(site.journalCta.testflight.shortTitle).toBe("Early");
    expect(site.journalCta.launched.shortTitle).toBe("Launched");
    expect(site.journalCta.testflight.label).toBe("[ctaLabelTestflight]");
    expect(site.contactEmail).toBe("[contactEmail]");
  });

  it("fails when a setting is missing", () => {
    expect(() => toSite({ ...rawSite(), footerLine: "" })).toThrow("missing: footerLine");
    expect(() => toSite(null)).toThrow(ContentError);
  });
});

describe("faqFor", () => {
  const items = rawHome().allFaqItems;

  it("lists the questions for a stage, in order", () => {
    expect(faqFor(items, { stage: "waitlist" }).map((q) => q.question)).toEqual(["Early?", "Always?"]);
    expect(faqFor(items, { stage: "testflight" }).map((q) => q.question)).toEqual(["Beta?", "Always?"]);
    expect(faqFor(items, { stage: "launched" }).map((q) => q.question)).toEqual(["Always?"]);
  });

  it("lists the questions marked for another page, whatever the stage", () => {
    expect(faqFor(items, { shownOn: "support" }).map((q) => q.question)).toEqual(["Always?", "Support only?"]);
  });

  it("ignores questions with no stages and no page, and handles empty fields", () => {
    expect(faqFor([{ question: "Q", answer: "A", stages: null, shownOn: null }], { stage: "waitlist" })).toEqual([]);
  });

  it("fails on a question with no answer", () => {
    expect(() => faqFor([{ question: "Q", answer: "", stages: ["waitlist"], shownOn: [] }], { stage: "waitlist" })).toThrow("missing: answer");
  });
});

describe("toHome", () => {
  it("applies the stage to the hero, form, pricing, FAQ and join copy", () => {
    const raw = rawHome();
    const waitlist = toHome(raw, "waitlist");
    expect(waitlist.hero.eyebrow).toBe("[heroEyebrowWaitlist]");
    expect(waitlist.form.submitLabel).toBe("[formWaitlistSubmit]");
    expect(waitlist.pricing.eyebrow).toBe("[pricingEyebrowEarly]");
    expect(waitlist.pricing.lede).toBe("[pricingLedeEarly]");
    expect(waitlist.join.lede).toBe("[joinLedeWaitlist]");
    expect(waitlist.faq.items.map((q) => q.question)).toEqual(["Early?", "Always?"]);

    const beta = toHome(raw, "testflight");
    expect(beta.hero.eyebrow).toBe("[heroEyebrowTestflight]");
    expect(beta.form).toMatchObject({ submitLabel: "[formTestflightSubmit]", sendingLabel: "[formTestflightSending]", note: "[formTestflightNote]" });
    expect(beta.form.steps).toEqual(["Install TestFlight.", "Open the invite.", "Tap Install."]);

    const launched = toHome(raw, "launched");
    expect(launched.hero.eyebrow).toBe("[heroEyebrowLaunched]");
    expect(launched.pricing.eyebrow).toBe("[pricingEyebrowLaunched]");
    expect(launched.pricing.lede).toBe("[pricingLedeLaunched]");
    expect(launched.join.lede).toBe("[joinLedeLaunched]");
  });

  it("joins the copy with where each thing sits on the page", () => {
    const home = toHome(rawHome(), "waitlist");
    expect(home.order.paragraphs).toEqual(["First paragraph.", "Second paragraph."]);
    expect(home.order.chips[0]).toMatchObject({ n: "1", title: "Task 1", meta: "Detail 1", gx: 0.51, gy: 6, ly: 0 });
    expect(home.order.chips[3].n).toBe("");
    expect(home.day.chapters).toHaveLength(6);
    expect(home.day.chapters[0]).toMatchObject({ time: "01:00", title: "Title 1", body: "Text 1", where: "Place 1" });
    expect(home.day.chapters[0].devices[0].src).toBe("g-TD-01");
    expect(home.day.comingLabel).toBe("[comingLabel]");
    expect(home.plan.steps.map((s) => s.src)).toEqual(["g-NP-01", "g-NP-02", "g-NP-03", "g-NP-04", "g-NP-05"]);
    expect(home.plan.canvas.src).toBe("g-NP-07-wide");
  });

  it("finds each device card by its device, with the extra picture descriptions where there are any", () => {
    const { everywhere } = toHome(rawHome(), "waitlist");
    expect(everywhere.iphone).toEqual({ name: "iphone name", body: "iphone text", alt: "iphone alt" });
    expect(everywhere.duo).toMatchObject({ foldedAlt: "duo alt", openAlt: "duo alt 2", fold: "[everywhereFold]", unfold: "[everywhereUnfold]" });
    expect(everywhere.widgets).toMatchObject({ mediumAlt: "widgets alt", upcomingAlt: "widgets alt 2", smallAlt: "widgets alt 3" });
    expect(everywhere.liveActivity.name).toBe("live_activity name");
  });

  it("falls back to the first picture description when a card has no second or third", () => {
    const raw = rawHome();
    for (const card of raw.homePage!.everywhereCards) {
      card.altSecond = null;
      card.altThird = null;
    }
    const { everywhere } = toHome(raw, "waitlist");
    expect(everywhere.duo.openAlt).toBe("duo alt");
    expect(everywhere.widgets.smallAlt).toBe("widgets alt");
  });

  it("keeps the featured plan and defaults the rest to not featured", () => {
    const raw = rawHome();
    raw.homePage!.pricingPlans[0].featured = null;
    expect(toHome(raw, "waitlist").pricing.plans.map((p) => p.featured)).toEqual([false, true]);
  });

  it("fails the build when the home page is missing text", () => {
    const raw = rawHome();
    raw.homePage!.heroTitle = null;
    raw.homePage!.whyBody = " ";
    expect(() => toHome(raw, "waitlist")).toThrow("missing: heroTitle, whyBody");
  });

  it("fails when there is no home page, a device card is missing, or the pictures and records don't line up", () => {
    expect(() => toHome({ ...rawHome(), homePage: null }, "waitlist")).toThrow("no published home page");

    const noCard = rawHome();
    noCard.homePage!.everywhereCards = noCard.homePage!.everywhereCards.filter((c) => c.device !== "mac");
    expect(() => toHome(noCard, "waitlist")).toThrow('no card for "mac"');

    const fewChapters = rawHome();
    fewChapters.allDayChapters.pop();
    expect(() => toHome(fewChapters, "waitlist")).toThrow("6 pictures but DatoCMS has 5 chapters");

    const fewChips = rawHome();
    fewChips.homePage!.orderChips.pop();
    expect(() => toHome(fewChips, "waitlist")).toThrow("4 places but DatoCMS has 3 tasks");

    const fewSteps = rawHome();
    fewSteps.homePage!.planSteps.pop();
    expect(() => toHome(fewSteps, "waitlist")).toThrow("5 screens but DatoCMS has 4 steps");
  });
});

describe("toJournalPage", () => {
  it("returns the page copy and the author", () => {
    const page = toJournalPage(rawJournal().journalPage);
    expect(page).toMatchObject({ eyebrow: "Journal", nextLabel: "Next", author: { name: "Fahad Ahmed", role: "Maker of Jamaal", initial: "F" } });
  });

  it("fails when the page is missing", () => {
    expect(() => toJournalPage(null)).toThrow("no published journal page");
  });
});

describe("toPageBlocks and toContentPage", () => {
  it("renders headings with anchor ids, links, lists and the support FAQ", () => {
    const blocks = toPageBlocks(rawContent(), { errorReporting: true });
    expect(blocks[0]).toEqual({ type: "h2", id: "this-website", text: "This website" });
    expect(blocks[1]).toEqual({ type: "p", html: 'We use <a href="mailto:a@b.c">email</a>.' });
    expect(blocks[2]).toEqual({ type: "list", ordered: false, items: ["one", "two"] });
    expect(blocks[3]).toEqual({ type: "note", text: "Sentry note" });
    expect(blocks[4]).toMatchObject({ type: "faq" });
    expect((blocks[4] as { items: unknown[] }).items).toHaveLength(2);
  });

  it("leaves out the error-reporting note when it is switched off", () => {
    const blocks = toPageBlocks(rawContent(), { errorReporting: false });
    expect(blocks.some((b) => b.type === "note")).toBe(false);
  });

  it("rejects a note with a condition it doesn't know", () => {
    const raw = rawContent();
    raw.contentPage!.body!.blocks![0].condition = "mystery";
    expect(() => toPageBlocks(raw, { errorReporting: true })).toThrow('Unknown condition "mystery"');
  });

  it("ignores blocks it can't find or doesn't render, and empty paragraphs", () => {
    const raw = rawContent();
    const doc = raw.contentPage!.body!.value as { document: { children: object[] } };
    doc.document.children.push({ type: "block", item: "nope" }, { type: "block" }, { type: "paragraph", children: [{ type: "span", value: " " }] });
    raw.contentPage!.body!.blocks!.push({ __typename: "SomethingElseRecord", id: "x" });
    expect(toPageBlocks(raw, { errorReporting: true })).toHaveLength(5);
  });

  it("builds the page with its date written out", () => {
    const page = toContentPage(rawContent(), { errorReporting: false });
    expect(page).toMatchObject({ eyebrow: "Privacy", title: "Your day is yours.", description: "How we handle your information.", updated: "11 October 2026" });
    expect(page.blocks).toHaveLength(4);
  });

  it("has no date on pages that are not dated", () => {
    const raw = rawContent();
    raw.contentPage!.updated = null;
    expect(toContentPage(raw, { errorReporting: false }).updated).toBeNull();
  });

  it("fails when the page or its body is missing", () => {
    expect(() => toContentPage({ ...rawContent(), contentPage: null }, { errorReporting: false })).toThrow("no published page");
    const empty = rawContent();
    empty.contentPage!.body = null;
    expect(() => toContentPage(empty, { errorReporting: false })).toThrow("has no body");
  });
});

describe("toPress", () => {
  it("picks the status for the stage and splits the about text into paragraphs", () => {
    const raw = rawPress();
    expect(toPress(raw, "waitlist").status).toBe("Coming soon.");
    expect(toPress(raw, "testflight").status).toBe("In beta.");
    expect(toPress(raw, "launched").status).toBe("Available now.");
    expect(toPress(raw, "waitlist").about).toEqual(["One.", "Two."]);
  });

  it("describes each file, and knows which are pictures", () => {
    const { files } = toPress(rawPress(), "waitlist");
    expect(files[0]).toMatchObject({ label: "App icon", url: "https://www.datocms-assets.com/1/icon.png", filename: "icon.png", width: 1024, height: 1024, isImage: true });
    expect(files[1]).toMatchObject({ filename: "brief.pdf", width: null, isImage: false });
  });

  it("returns the facts and colours", () => {
    const press = toPress(rawPress(), "waitlist");
    expect(press.facts).toEqual([{ label: "Name", value: "Jamaal" }]);
    expect(press.colours).toEqual([{ name: "Terracotta", hex: "#9A4F2E", use: "Buttons" }]);
  });

  it("fails when a press file has no file attached", () => {
    const raw = rawPress();
    raw.pressPage!.files[0].file = null;
    expect(() => toPress(raw, "waitlist")).toThrow("press file record in DatoCMS is missing: file");
  });
});
