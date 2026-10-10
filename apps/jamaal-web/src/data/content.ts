import { CONTACT_EMAIL } from "./site";

/** Page copy and data, kept out of the markup. Wording follows the Claude Design pages. */

export const nightPlanning = {
  eyebrow: "Night Planning",
  title: "Five short steps,",
  accent: "then rest.",
  body: "Look back at today, carry forward what matters, and see tomorrow's free time between its fixed points before you fill it. Tired? Skip tonight. Tomorrow's list still arrives.",
  /** Auto-advance dwell per step, in milliseconds. */
  dwell: 4500,
  steps: [
    { label: "Review today", alt: "Night Planning step 1: Review today" },
    { label: "Carry forward", alt: "Night Planning step 2: Carry forward" },
    { label: "Build tomorrow around its Anchors", alt: "Night Planning step 3: Build tomorrow around its Anchors" },
    { label: "Check the load", alt: "Night Planning step 4: Check the load" },
    { label: "Close the day", alt: "Night Planning step 5: Close the day" },
  ],
} as const;

export const faq = [
  {
    question: "What happens after the 14-day trial?",
    answer:
      "You can subscribe yearly ($24.99) or monthly ($2.99). If you don't, nothing is taken away: you can still tick things off, log habits, mark Anchors and run the timer. Adding, editing and Night Planning wait for a subscription.",
  },
  {
    question: "Does one subscription cover all my devices?",
    answer: "Yes. One subscription covers iPhone, iPad and Mac.",
  },
  {
    question: "Where is my data kept?",
    answer:
      "On your device and, if you use sync, in your own iCloud. fhdamd doesn't receive your tasks, habits or Anchors.",
  },
  {
    question: "Can I export my data?",
    answer: "Always, whether or not you have a subscription.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Subscriptions are managed by Apple. Open Settings on your iPhone or iPad, tap your name, then Subscriptions, and choose Jamaal. On a Mac, open the App Store, click your name, then Account Settings.",
  },
  {
    question: "Something isn't working. How do I get help?",
    answer:
      `Email ${CONTACT_EMAIL} with what you were doing, what you expected and what happened. Mention your device and iOS or macOS version if you can.`,
  },
] as const;

export const legal = {
  updated: "11 October 2026",
} as const;
