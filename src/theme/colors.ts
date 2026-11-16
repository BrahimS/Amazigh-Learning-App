/**
 * Color tokens — mirror `docs/UI_UX_GUIDELINES.md`.
 * Text colors are chosen to meet WCAG 2.1 AA contrast on `background`/`surface`.
 */
export const colors = {
  /** Saffron / ochre (Amazigh flag yellow) */
  primary: '#B45309',
  primaryLight: '#F59E0B',
  /** Atlas blue (flag blue) */
  secondary: '#1D4ED8',
  secondaryLight: '#93C5FD',
  /** Argan green (flag green) */
  accent: '#15803D',
  accentLight: '#86EFAC',
  /** Red (flag ⵣ red) */
  danger: '#B91C1C',
  dangerLight: '#FCA5A5',
  success: '#15803D',
  warning: '#B45309',

  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E7E5E4',

  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textInverse: '#FFFFFF',

  /** Exercise feedback states */
  correct: '#15803D',
  incorrect: '#B91C1C',
} as const;

export type Colors = typeof colors;
