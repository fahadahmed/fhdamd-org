/** Page copy and data, kept out of the markup. Wording follows the Claude Design pages. */

export const hero = {
  prelaunch: { eyebrow: "Arriving December 2026 · early access list" },
  launched: { eyebrow: "Now on iPhone, iPad and Mac" },
  title: "One list. Just today.",
  accent: "Beautifully ordered.",
  lede: "Personal, family and work on a single Today list, around the things your day already moves around. A short plan each evening decides what belongs on tomorrow.",
  trialNote: "Free for 14 days, everything included. No card up front.",
  signupNote: "One email when it's ready, one if TestFlight opens. Nothing else.",
} as const;

export interface Kind {
  label: string;
  title: string;
  body: string;
  /** Habit only: the density strip is shown under the title. */
  density?: boolean;
}

export const kinds: readonly Kind[] = [
  {
    label: "Task · you do it",
    title: "Done, or moved on.",
    body: "Call the clinic, draft the review, book the lessons. When the day is full, Jamaal says so in plain words and offers tomorrow.",
  },
  {
    label: "Habit · you cultivate it",
    title: "Density, never streaks.",
    body: "A grid of days that fills toward today. A missed day is a quiet mark, not a reset to zero.",
    density: true,
  },
  {
    label: "Anchor · you move around it",
    title: "The fixed points stay fixed.",
    body: "Prayer times, the school run, bin night. The planner may move your tasks, never your commitments.",
  },
];

/** The 14-day habit strip: heatmap token names, `missed` is a quiet mark. */
export type DensityCell = "d1" | "d2" | "d3" | "missed";
export const density: readonly DensityCell[] = [
  "d3", "d3", "d2", "d3", "d3", "d1", "missed", "d2", "d3", "d3", "d2", "d3", "d3", "d1",
];

export const anchors = {
  eyebrow: "Anchors",
  title: "Your day already has a shape.",
  accent: "Plan around it.",
  body: "Some things don't move: prayer, the school run, bin night. Others come round every few days. Anchors hold them as windows that open and close, and the planner fits your tasks into the gaps between them. It never moves an Anchor.",
  items: [
    { name: "Salah", detail: "Prayer times for your city" },
    { name: "School run", detail: "Mon–Fri · 08:15 and 15:00" },
    { name: "Bin night", detail: "Tuesdays · 19:00–23:00" },
    { name: "Water the plants", detail: "3–4 days after last time" },
  ],
  imageAlt: "The Anchors list: prayer times, school run, bin night, watering the plants",
} as const;

export const priority = {
  eyebrow: "How the list is ordered",
  title: "Eisenhower,",
  accent: "without the grid.",
  body: "You only say how much something matters: low, medium or high. Jamaal works out how urgent it is from its due date and how often it has slipped. Together they set the order of Today, what stays visible on a low-energy day, and what Night Planning suggests you schedule. You never sort a matrix.",
  columns: ["Matters", "Matters less"],
  rows: [
    {
      label: "Urgent",
      cells: [
        { title: "First on Today", detail: "Shown even on a low day", strong: true },
        { title: "Fitted in", detail: "Where the day has room", strong: false },
      ],
    },
    {
      label: "Not urgent",
      cells: [
        { title: "Suggested tonight", detail: "Night Planning offers a slot", strong: false },
        { title: "Let go gently", detail: "Drifts down, no guilt", strong: false },
      ],
    },
  ],
  gridLabel: "How importance and urgency decide where a task goes",
} as const;

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

export const wellbeing = {
  eyebrow: "Wellbeing",
  title: "A read on your fortnight,",
  accent: "from what you did.",
  body: "One number and one plain sentence, built from tasks done, Anchors attended, habits kept and how heavy the days ran. There's no mood to log and nothing to fill in. It starts after seven active days and compares you only with yourself.",
  imageAlt: "The Wellbeing screen: a score of 78, about the same as last week",
} as const;

export const nots = {
  eyebrow: "What it leaves out",
  title: "Nothing nags.",
  accent: "Nothing punishes.",
  body: "The few words it shows are calm and plain, and they only appear when they're useful.",
  items: [
    { a: "No streaks", b: "A miss is a mark, not a failure" },
    { a: "No projects or boards", b: "Categories are just labels" },
    { a: "No chat window", b: "The voice lives in the list" },
    { a: "No machine learning", b: "Plain rules you can predict" },
    { a: "No buzzing for attention", b: "Night and morning; the rest is opt-in" },
  ],
} as const;

export const pricing = {
  eyebrow: "Pricing",
  title: "Two weeks free.",
  accent: "Then one simple plan.",
  body: "If you don't subscribe, nothing is taken away. You can still tick things off, log habits, mark Anchors and run the timer. Adding, editing and Night Planning wait for a subscription. Your data can always be exported.",
  plans: [
    { name: "Yearly", note: "About $2.08 a month", price: "$24.99", featured: true },
    { name: "Monthly", note: undefined, price: "$2.99", featured: false },
  ],
  footnote:
    "Prices in USD. The App Store shows yours in local currency. One subscription covers iPhone, iPad and Mac.",
} as const;

export const closing = {
  prelaunch: {
    title: "Be first to",
    accent: "a quieter day.",
    body: "Coming to iPhone, iPad and Mac before the new year. Kept in your own iCloud.",
  },
  launched: {
    title: "Start",
    accent: "a quieter day.",
    body: "For iPhone, iPad and Mac. Kept in your own iCloud.",
  },
} as const;
