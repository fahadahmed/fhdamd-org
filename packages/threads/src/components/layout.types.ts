export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16 | 20 | 24

export const toSpaceVar = (n: SpaceScale): string =>
  n === 0 ? "0px" : `var(--th-space-${n})`
