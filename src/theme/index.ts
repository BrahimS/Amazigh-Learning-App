import { colors } from './colors';
import { fontSize, fonts, lineHeight } from './typography';
import { radius, spacing } from './spacing';

export const theme = {
  colors,
  fonts,
  fontSize,
  lineHeight,
  spacing,
  radius,
} as const;

export type Theme = typeof theme;

/** Access design tokens from any component. Dark mode will extend this hook. */
export function useTheme(): Theme {
  return theme;
}

export { colors } from './colors';
export { fonts, fontSize, lineHeight } from './typography';
export { radius, spacing } from './spacing';
