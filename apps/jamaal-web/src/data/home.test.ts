import { describe, expect, it } from "vitest";
import { STAGES } from "../../scripts/stage-parse.mjs";
import { AFTER_TRIAL, faqItems, formCopy, heroEyebrow, joinCopy, journalCta, pricing, pricingIntro } from "./home";
import type { DayChapter } from "./home";

describe("stage copy", () => {
  it("has a hero eyebrow, pricing intro and join lede for every stage", () => {
    for (const stage of STAGES) {
      expect(heroEyebrow(stage)).toBeTruthy();
      expect(pricingIntro(stage).eyebrow).toBeTruthy();
      expect(joinCopy(stage).lede).toBeTruthy();
    }
  });

  it("says the beta is free before launch and prices at launch", () => {
    expect(heroEyebrow("testflight")).toContain("TestFlight");
    expect(pricingIntro("waitlist").eyebrow).toBe("Pricing at launch");
    expect(pricingIntro("testflight").lede).toContain("beta is free");
    expect(pricingIntro("launched").eyebrow).toBe("Pricing");
  });

  it("gives the two pre-launch forms their own button", () => {
    expect(formCopy("waitlist").submitLabel).toBe("Join the waitlist");
    expect(formCopy("testflight").submitLabel).toBe("Send my TestFlight invite");
  });
});

describe("faqItems", () => {
  const questions = (stage: (typeof STAGES)[number]) => faqItems(stage).map((i) => i.question);

  it("adds the right pre-launch questions", () => {
    expect(questions("waitlist")).toContain("When does the beta open?");
    expect(questions("waitlist")).toContain("What will you do with my email?");
    expect(questions("testflight")).toContain("What is TestFlight?");
    expect(questions("testflight")).toContain("Is the beta free?");
    expect(questions("launched")).not.toContain("What is TestFlight?");
  });

  it("swaps 'after launch' for the trial-end question at launch", () => {
    expect(questions("waitlist")).toContain("What happens after launch?");
    expect(questions("launched")).toContain("What happens when the free trial ends?");
    expect(questions("launched")).not.toContain("What happens after launch?");
  });

  it("never says the app goes read-only: the Terms keep ticking off, habits, Anchors and the timer", () => {
    for (const stage of STAGES) {
      for (const item of faqItems(stage)) expect(item.answer.toLowerCase()).not.toContain("read-only");
    }
    expect(AFTER_TRIAL).toContain("tick things off");
    expect(AFTER_TRIAL).toContain("Night Planning wait for a subscription");
    expect(pricing.afterTrial).toBe(AFTER_TRIAL);
  });

  it("has unique questions with answers", () => {
    for (const stage of STAGES) {
      const items = faqItems(stage);
      expect(new Set(items.map((i) => i.question)).size).toBe(items.length);
      for (const item of items) expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});

describe("day story", () => {
  it("has six chapters, with every device placed inside the 600 x 640 stage", async () => {
    const { day, STAGE_SPACE } = await import("./home");
    expect(day.chapters).toHaveLength(6);
    for (const chapter of day.chapters) {
      expect(chapter.devices.length).toBeGreaterThan(0);
      for (const d of chapter.devices) {
        expect(d.x).toBeGreaterThanOrEqual(0);
        expect(d.y).toBeGreaterThanOrEqual(0);
        expect(d.x + d.w).toBeLessThanOrEqual(STAGE_SPACE.width);
        expect(d.alt.length).toBeGreaterThan(3);
      }
    }
  });

  it("only badges what is not in the app yet, and only Apple Watch", async () => {
    const { day } = await import("./home");
    const chapters: readonly DayChapter[] = day.chapters;
    const coming = chapters.flatMap((c) => c.devices.filter((d) => d.coming));
    expect(coming.length).toBeGreaterThan(0);
    for (const d of coming) expect(d.type).toBe("watch");
  });

  it("points every screenshot at a file that exists", async () => {
    const { day } = await import("./home");
    const { screen } = await import("../lib/screens");
    for (const chapter of day.chapters) for (const d of chapter.devices) expect(() => screen(d.src)).not.toThrow();
  });
});

describe("journalCta", () => {
  it("has a button, title and note for every stage", () => {
    for (const stage of STAGES) {
      const cta = journalCta(stage);
      expect(cta.label && cta.title && cta.shortTitle && cta.body).toBeTruthy();
    }
    expect(journalCta("waitlist").label).toBe("Join the waitlist");
    expect(journalCta("testflight").label).toBe("Join the beta");
    expect(journalCta("launched").label).toBe("Download");
  });
});
