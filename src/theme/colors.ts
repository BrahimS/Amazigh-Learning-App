/**
 * Color tokens — approved design variant B (`design/Amazigh-Learning-Prototype.xd`).
 * Text colors are chosen to meet WCAG 2.1 AA contrast on `background`/`surface`.
 */
export const colors = {
  /** Forest green */
  primary: '#176B55',
  /** Ochre (decorative / large text only) */
  primaryLight: '#E8B94F',
  /** Terracotta */
  secondary: '#D66B3D',
  secondaryLight: '#EBA88A',
  /** Dark terracotta for text: terracotta itself is 3.1:1 on sand, below AA */
  secondaryText: '#9C4221',
  /** Forest green (success) */
  accent: '#176B55',
  accentLight: '#8CC7B5',
  /** Red (flag ⵣ red) */
  danger: '#B91C1C',
  dangerLight: '#FCA5A5',
  success: '#176B55',
  warning: '#B45309',

  /** Sand */
  background: '#F6F0E5',
  surface: '#FFFFFF',
  border: '#E6DCCB',

  /** Indigo */
  textPrimary: '#273447',
  textSecondary: '#5B6577',
  textInverse: '#FFFFFF',

  /** Exercise feedback states */
  correct: '#176B55',
  incorrect: '#B91C1C',
} as const;

export type Colors = typeof colors;
