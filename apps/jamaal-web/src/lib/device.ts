/**
 * Shared facts about the device frames in the design: which types exist, the
 * screen aspect ratio each one uses by default, and the image widths worth
 * generating for each. The frame's look (bezel, radius, padding) is in
 * DeviceFrame.astro, scaled with container query units so a frame fits
 * whatever width it is given.
 */
export const DEVICE_TYPES = ["phone", "duo", "ipad", "mac", "watch", "widget"] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

/** Screen width / height, as a CSS `aspect-ratio` value. Widgets size to their image. */
const DEFAULT_ASPECT: Record<DeviceType, string | null> = {
  phone: "393 / 852",
  duo: "673 / 952",
  ipad: "1194 / 834",
  mac: "1280 / 800",
  watch: "208 / 248",
  widget: null,
};

export function deviceAspect(type: DeviceType, override?: string): string | null {
  return override ?? DEFAULT_ASPECT[type];
}

/** Widths (px) to generate for each device. Astro skips any larger than the source image. */
export const DEVICE_WIDTHS: Record<DeviceType, number[]> = {
  phone: [320, 480, 640, 786],
  duo: [320, 480, 640, 960],
  ipad: [480, 720, 1080, 1440],
  mac: [640, 960, 1280, 1600],
  watch: [160, 240, 320],
  widget: [320, 480, 640, 1092],
};

