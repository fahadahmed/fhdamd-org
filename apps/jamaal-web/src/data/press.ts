import type { Stage } from "./stage";

/** Facts and files for the press kit page. Files live in public/press and are checked by a test. */

export const boilerplate = {
  short: "A calm daily planner for iPhone, iPad and Mac.",
  long: [
    "Jamaal is a calm daily planner for iPhone, iPad and Mac. It keeps one list for today, puts it in order by what matters and what's due, checks it against how much time and energy you have, and plans tomorrow with you each evening.",
    "There are no streaks, no red overdue badges and no projects or tags. There is no account: your list lives on your devices and in your own iCloud.",
    "Jamaal is made by hand by Fahad Ahmed at fhdamd, in Melbourne, Australia.",
  ],
} as const;

export function statusLine(stage: Stage): string {
  return {
    waitlist: "Coming soon to iPhone, iPad and Mac. The early access list is open, and a TestFlight beta comes first.",
    testflight: "In public beta on TestFlight for iPhone, iPad and Mac.",
    launched: "Available on the App Store for iPhone, iPad and Mac.",
  }[stage];
}

export const facts: readonly { label: string; value: string }[] = [
  { label: "Name", value: "Jamaal (جمال)" },
  { label: "Platforms", value: "iPhone, iPad and Mac. Apple Watch and Live Activities arrive in version 1.1." },
  { label: "Price", value: "Free for 14 days, then $2.99 a month or $24.99 a year (USD). One subscription covers every device." },
  { label: "Privacy", value: "No account. Data stays on the device and in the person's own iCloud." },
  { label: "Made by", value: "fhdamd (Fahad Ahmed), Melbourne, Australia" },
  { label: "Website", value: "jamaal.app" },
];

export const brand = {
  colours: [
    { name: "Terracotta", hex: "#9A4F2E", use: "The one filled button colour" },
    { name: "Deep", hex: "#0C4767", use: "Dark grounds, the icon" },
    { name: "Ground", hex: "#EFF4F0", use: "Page background" },
    { name: "Teal", hex: "#1F6A58", use: "Done and settled" },
    { name: "Ink", hex: "#0A3A53", use: "Text" },
  ],
  fonts: "Fraunces for display, Hanken Grotesk for text, JetBrains Mono for small labels.",
} as const;

export interface PressFile {
  file: string;
  label: string;
  note: string;
  alt: string;
  /** Pictures get a preview; the SVG icon is previewed too, but is listed for vector use. */
  width?: number;
  height?: number;
}

export const files: readonly PressFile[] = [
  { file: "jamaal-icon-1024.png", label: "App icon", note: "PNG, 1024 × 1024", alt: "The Jamaal app icon: a serif J and a terracotta dot on a deep blue square", width: 1024, height: 1024 },
  { file: "jamaal-icon.svg", label: "App icon (vector)", note: "SVG", alt: "The Jamaal app icon, vector version", width: 1024, height: 1024 },
  { file: "jamaal-iphone-today.png", label: "iPhone: Today", note: "PNG, 786 × 1704", alt: "Today on iPhone: one list with Anchors and tasks in order", width: 786, height: 1704 },
  { file: "jamaal-iphone-focus.png", label: "iPhone: Focus", note: "PNG, 786 × 1704", alt: "Focus on iPhone: one task and one timer", width: 786, height: 1704 },
  { file: "jamaal-iphone-night-planning.png", label: "iPhone: Night Planning", note: "PNG, 786 × 1704", alt: "Night Planning on iPhone: carrying forward what is left", width: 786, height: 1704 },
  { file: "jamaal-iphone-evening.png", label: "iPhone: Close the day", note: "PNG, 786 × 1704", alt: "The last Night Planning step on iPhone: tomorrow is ready", width: 786, height: 1704 },
  { file: "jamaal-ipad-today.png", label: "iPad: Today", note: "PNG, 2388 × 1668", alt: "Jamaal on iPad with the list and the open task side by side", width: 2388, height: 1668 },
  { file: "jamaal-mac-today.png", label: "Mac: Today", note: "PNG, 2560 × 1600", alt: "Jamaal on Mac: the Today list with the open task beside it", width: 2560, height: 1600 },
  { file: "jamaal-widget-today.png", label: "Today widget", note: "PNG, 1092 × 510", alt: "The Today widget on the Home Screen", width: 1092, height: 510 },
];
