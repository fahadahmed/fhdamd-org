/**
 * How the home page is drawn, as opposed to what it says. Every word on the
 * site comes from DatoCMS; what stays here is the choice of screenshot and
 * where each device sits, which belong to the design and are tied to the files
 * in src/assets/screens. Entries line up by position with the records in
 * DatoCMS (day chapters, the Night Planning steps, the order examples).
 */

/** One device in a chapter's picture. x, y and w are in a 600 x 640 space the stage scales. */
export interface DayDevice {
  type: "phone" | "duo" | "ipad" | "mac" | "watch" | "widget";
  src: string;
  x: number;
  y: number;
  w: number;
  /** Describes the screenshot, so it travels with the file. */
  alt: string;
  z?: number;
  /** Which part of a tall screenshot to show. */
  position?: string;
  /** Overrides the screen ratio. */
  aspect?: string;
  /** Not in the app yet: shows the "Coming in 1.1" badge. */
  coming?: boolean;
}

export const STAGE_SPACE = { width: 600, height: 640 } as const;

/** The devices for each chapter of "A day with Jamaal", in order. */
export const DAY_DEVICES: readonly (readonly DayDevice[])[] = [
  [
    { type: "phone", src: "g-TD-01", x: 60, y: 10, w: 270, alt: "Today on iPhone" },
    { type: "widget", src: "WG-03-today-medium", x: 250, y: 470, w: 330, z: 2, alt: "Today widget" },
  ],
  [
    { type: "mac", src: "g-macOS", x: 0, y: 90, w: 560, alt: "Jamaal on Mac" },
    { type: "phone", src: "g-TK-01-full", x: 380, y: 180, w: 200, z: 2, alt: "Day is full" },
  ],
  [
    { type: "phone", src: "g-FS-02", x: 20, y: 20, w: 260, alt: "Focus on iPhone" },
    { type: "duo", src: "g-Duo-tabletop", x: 300, y: 30, w: 240, alt: "iPhone Duo tabletop focus" },
    { type: "watch", src: "g-WA-04", x: 390, y: 430, w: 150, z: 3, coming: true, alt: "Focus on Apple Watch" },
  ],
  [
    { type: "phone", src: "g-TD-01", x: 40, y: 20, w: 270, position: "50% 22%", alt: "Anchors on Today" },
    { type: "widget", src: "WG-01-upcoming", x: 350, y: 40, w: 190, z: 2, alt: "Next Anchor widget" },
    { type: "watch", src: "g-WA-02", x: 365, y: 320, w: 160, z: 3, coming: true, alt: "Anchors on Apple Watch" },
  ],
  [
    { type: "ipad", src: "g-iPad-HB-02", x: 10, y: 110, w: 560, aspect: "1170 / 820", alt: "Habits on iPad" },
    { type: "watch", src: "g-WA-03-water", x: 420, y: 400, w: 150, z: 2, coming: true, alt: "Water on Apple Watch" },
  ],
  [
    { type: "phone", src: "g-NP-05", x: 40, y: 10, w: 270, alt: "Close the day" },
    { type: "widget", src: "WG-03-evening", x: 230, y: 450, w: 350, z: 2, alt: "Plan tomorrow widget" },
  ],
];

/**
 * Where each example task sits on the "matters / due" grid (`gx`, `gy`) and where
 * it ends up in the list (`ly`), in the order Jamaal puts them. `n` is the number on its card.
 */
export const ORDER_CHIP_LAYOUT = [
  { n: "1", gx: 0.51, gy: 6, ly: 0 },
  { n: "2", gx: 0, gy: 6, ly: 25 },
  { n: "3", gx: 0.51, gy: 56, ly: 50 },
  { n: "", gx: 0, gy: 56, ly: 82 },
] as const;

/** The screen shown for each Night Planning step, in order, and the iPad and Mac canvas. */
export const PLAN_SCREENS = ["g-NP-01", "g-NP-02", "g-NP-03", "g-NP-04", "g-NP-05"] as const;
export const PLAN_CANVAS_SCREEN = "g-NP-07-wide";
