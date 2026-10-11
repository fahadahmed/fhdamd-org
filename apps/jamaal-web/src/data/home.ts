import type { Stage } from "./stage";

/**
 * Home page copy that depends on the stage, plus the sections that are the same
 * in all three. Wording follows the redesign handoff. After the trial, the app
 * keeps what the Terms say it keeps: ticking things off, logging habits, marking
 * Anchors and the timer; adding, editing and Night Planning need a subscription.
 */

export const AFTER_TRIAL =
  "If the trial ends and you don't subscribe, nothing is taken away. You can still tick things off, log habits, mark Anchors and run the timer. Adding, editing and Night Planning wait for a subscription, and your data can always be exported.";

export function heroEyebrow(stage: Stage): string {
  return {
    waitlist: "Coming soon to iPhone, iPad and Mac",
    testflight: "Public beta · open now on TestFlight",
    launched: "For iPhone, iPad and Mac",
  }[stage];
}

export const hero = {
  title: "One list.",
  titleLine2: "Just today.",
  accent: "Beautifully ordered.",
  lede: "Jamaal is a calm planner that works out what fits in your day, puts it in the right order, and plans tomorrow with you before bed.",
  trialNote: "14 days free, then $2.99 a month",
} as const;

export interface FormCopy {
  submitLabel: string;
  note: string;
}

/** The signup form's button and small print for the two pre-launch stages. */
export function formCopy(stage: Exclude<Stage, "launched">): FormCopy {
  return stage === "testflight"
    ? {
        submitLabel: "Send my TestFlight invite",
        note: "Use the email you read on the device you'll test on.",
      }
    : {
        submitLabel: "Join the waitlist",
        note: "Two emails at most: one when the beta opens, one at launch.",
      };
}

export const why = {
  eyebrow: "Why another app",
  title: "Reminders is good at remembering.",
  accent: "Jamaal is for deciding.",
  body: "Most of us already have a list app, a calendar and a habit tracker. Remembering things isn't the hard part. The hard part is that none of them tells you what fits in today.",
  columns: { them: "A list app", us: "Jamaal" },
  rows: [
    { them: "Shows everything you've ever added.", us: "Shows today, and only what fits." },
    { them: "Leaves the order up to you.", us: "Orders by what matters and what's due." },
    { them: "Tasks here, habits there, the school run in a calendar.", us: "Tasks, habits and fixed-time things in one list." },
    { them: "Overdue in red. Streaks to keep alive.", us: "No red. No streaks. Nothing to break." },
    { them: "Nothing happens in the evening.", us: "Five minutes at night shapes tomorrow." },
  ],
} as const;

export const principles = {
  eyebrow: "What it won't do",
  title: "Calm is a",
  accent: "feature.",
  body: "Most productivity apps run on guilt. Jamaal is built around a few things it will never do.",
  items: [
    { title: "No streaks.", body: "Miss a day and nothing breaks. Habits show up as a grid of days over weeks, not a number to protect." },
    { title: "No red.", body: "Being late is said in words. Nothing flashes, and there are no overdue badges." },
    { title: "No projects, no tags. Ever.", body: "One flat list. Categories are labels, not folders to manage." },
    { title: "It knows when the day is full.", body: "Rough effort estimates and how much energy you have set a budget for each day." },
    { title: "A voice, not a coach.", body: 'Jamaal suggests one move at a time, and "keep as planned" is always an answer.' },
  ],
} as const;

export const developerNote = {
  eyebrow: "Why I built it",
  quote: "For years I bounced between a reminders app, a calendar, a habit tracker and a to-do list. None of them stuck, because none of them knew how much day I actually had.",
  accent: "Jamaal is the one I kept opening.",
  initial: "F",
  name: "Fahad Ahmed",
  byline: "Made by hand at fhdamd, in Melbourne",
} as const;

export function pricingIntro(stage: Stage): { eyebrow: string; lede: string } {
  return stage === "launched"
    ? {
        eyebrow: "Pricing",
        lede: "Everything is included from day one, and there's nothing to pay up front. One subscription covers iPhone, iPad and Mac.",
      }
    : {
        eyebrow: "Pricing at launch",
        lede: "The beta is free. When Jamaal launches, everything is included from day one with nothing to pay up front, and one subscription covers iPhone, iPad and Mac.",
      };
}

export const pricing = {
  title: "Two weeks free.",
  accent: "Then one simple price.",
  plans: [
    { name: "Monthly", offerName: "Monthly", price: "$2.99", unit: "a month", featured: false },
    { name: "Yearly · save 30%", offerName: "Yearly", price: "$24.99", unit: "a year, about $2.08 a month", featured: true },
  ],
  afterTrial: AFTER_TRIAL,
  currency: "Prices in USD. The App Store shows yours in your own currency.",
} as const;

export const privacy = {
  eyebrow: "Privacy and iCloud",
  title: "Your day is",
  accent: "nobody's business.",
  items: [
    { title: "No account", body: "There's nothing to sign up for. Open the app and start." },
    { title: "In your own iCloud", body: "Your list syncs across your iPhone, iPad and Mac through your own iCloud, and it works offline." },
    { title: "Hidden when locked", body: "Task titles in widgets are hidden while your device is locked." },
  ],
} as const;

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqItems(stage: Stage): FaqItem[] {
  const stageSpecific: FaqItem[] =
    stage === "launched"
      ? []
      : stage === "testflight"
        ? [
            {
              question: "What is TestFlight?",
              answer:
                "Apple's app for trying apps before they're released. Install it from the App Store, open your invite, and Jamaal installs like any other app. Builds update on their own.",
            },
            {
              question: "Is the beta free?",
              answer: "Yes. Nothing to pay and nothing to cancel. When Jamaal launches you can subscribe, or not.",
            },
          ]
        : [
            {
              question: "When does the beta open?",
              answer:
                "Soon. Everyone on the waitlist gets a TestFlight invite the moment it does, without having to come back and sign up again.",
            },
            {
              question: "What will you do with my email?",
              answer:
                "Send you the beta invite and tell you when Jamaal launches. Nothing else, and you can unsubscribe at any time.",
            },
          ];

  const afterTrial: FaqItem =
    stage === "launched"
      ? {
          question: "What happens when the free trial ends?",
          answer:
            "If you don't subscribe, nothing is taken away. You can still tick things off, log habits, mark Anchors and run the timer. Adding, editing and Night Planning wait for a subscription. Subscribe whenever you like to pick up where you left off.",
        }
      : {
          question: "What happens after launch?",
          answer:
            "Jamaal has a 14-day free trial, then costs $2.99 a month or $24.99 a year. If you don't subscribe, you can still tick things off, log habits, mark Anchors and run the timer. Adding, editing and Night Planning wait for a subscription, and nothing is deleted.",
        };

  return [
    ...stageSpecific,
    {
      question: "How is this different from Reminders or a to-do app?",
      answer:
        "Those apps hold everything and leave the deciding to you. Jamaal shows only today, puts it in order by what matters and what's due, checks it against how much time and energy you have, and plans tomorrow with you each evening.",
    },
    {
      question: "Do I need to set up projects or tags?",
      answer:
        "No, and you never will. It's one flat list. Personal, Family and Work are simple labels you can rename or filter by. They aren't folders.",
    },
    {
      question: "What's an Anchor?",
      answer:
        "Something your day moves around that has a window rather than a deadline: the school run, bin night, watering the plants, a weekly class. You mark it attended, not done, and there's never a streak to keep.",
    },
    afterTrial,
    {
      question: "Which devices does it run on?",
      answer:
        "iPhone, iPad and Mac, including the iPhone Duo. The Apple Watch app and Live Activities arrive in version 1.1. An Android version may come later.",
    },
    {
      question: "Does it sync between my devices?",
      answer: "Yes, through your own iCloud. There is no Jamaal account, and it works offline.",
    },
    {
      question: "Will it nag me?",
      answer:
        "No. There's one evening reminder, plus reminders for windows you've asked about. Nothing is red, nothing flashes, and there are no streaks to lose.",
    },
  ];
}

export function joinCopy(stage: Stage): { title: string; accent: string; lede: string } {
  const base = { title: "Tomorrow can be", accent: "calmer." };
  return {
    waitlist: {
      ...base,
      lede: "Join the waitlist. You'll be the first to get a TestFlight invite when the beta opens.",
    },
    testflight: {
      ...base,
      lede: "The beta is open to everyone. Leave your name and email and the invite comes straight from TestFlight.",
    },
    launched: { ...base, lede: "Try Jamaal free for 14 days on iPhone, iPad and Mac." },
  }[stage];
}
