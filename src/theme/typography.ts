/**
 * Typography tokens — mirror `docs/UI_UX_GUIDELINES.md`.
 * Family names match the bundled font files in `src/assets/fonts` (linked via react-native-asset).
 */
export const fonts = {
  latin: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  tifinagh: {
    regular: 'NotoSansTifinagh-Regular',
  },
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
} as const;

export type Fonts = typeof fonts;
