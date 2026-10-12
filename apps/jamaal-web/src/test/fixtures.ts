import type { FormCopy, HomeModel } from "../lib/cms/models";

/** Copy as it comes from DatoCMS, for component tests. */
export const waitlistForm: FormCopy = {
  submitLabel: "Join the waitlist",
  sendingLabel: "Adding you…",
  note: "Two emails at most: one when the beta opens, one at launch.",
  steps: ["Install TestFlight from the App Store.", "Open the invite email on your iPhone, iPad or Mac.", "Tap View in TestFlight, then Install."],
};

export const testflightForm: FormCopy = {
  ...waitlistForm,
  submitLabel: "Send my TestFlight invite",
  sendingLabel: "Sending your invite…",
  note: "Use the email you read on the device you'll test on.",
};

export const orderFixture: HomeModel["order"] = {
  eyebrow: "The order, explained once",
  title: "The sorting you",
  accent: "never have to do.",
  paragraphs: ["One.", "Two."],
  axes: { matters: "Matters more →", due: "Due sooner →", later: "Not today · Someday" },
  buttons: { sort: "Sort it", grid: "Show me the grid" },
  chips: [
    { n: "1", title: "Draft the architecture review", meta: "Matters · due today", gx: 0.51, gy: 6, ly: 0 },
    { n: "2", title: "Renew the passport", meta: "Matters · due next month", gx: 0, gy: 6, ly: 25 },
    { n: "3", title: "Reply to the school email", meta: "Small · due today", gx: 0.51, gy: 56, ly: 50 },
    { n: "", title: "Sort the photo library", meta: "Small · no date", gx: 0, gy: 56, ly: 82 },
  ],
};
