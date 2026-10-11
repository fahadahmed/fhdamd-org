import { describe, expect, it } from "vitest";
import { STAGES } from "../../scripts/stage-parse.mjs";
import { AFTER_TRIAL, faqItems, formCopy, heroEyebrow, joinCopy, pricing, pricingIntro } from "./home";

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
