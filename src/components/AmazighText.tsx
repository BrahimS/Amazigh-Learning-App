import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

type AmazighTextVariant = 'body' | 'heading' | 'letter' | 'latin';

interface AmazighTextProps extends TextProps {
  /**
   * `letter` renders Tifinagh with the bundled Noto Sans Tifinagh font.
   * `body`/`heading` also support Tifinagh via `script="tifinagh"`.
   */
  variant?: AmazighTextVariant;
  script?: 'tifinagh' | 'latin';
}

export function AmazighText({
  variant = 'body',
  script,
  style,
  ...rest
}: AmazighTextProps) {
  const theme = useTheme();

  const resolvedScript =
    script ?? (variant === 'letter' ? 'tifinagh' : 'latin');
  const fontFamily =
    resolvedScript === 'tifinagh'
      ? theme.fonts.tifinagh.regular
      : theme.fonts.latin.regular;

  const base: TextStyle = {
    color: theme.colors.textPrimary,
    fontFamily,
    fontSize: theme.fontSize.md,
    lineHeight: Math.round(theme.fontSize.md * theme.lineHeight.normal),
    ...(variant === 'heading'
      ? {
          fontFamily:
            resolvedScript === 'tifinagh' ? fontFamily : theme.fonts.latin.bold,
          fontSize: theme.fontSize.xl,
          lineHeight: Math.round(theme.fontSize.xl * theme.lineHeight.tight),
        }
      : {}),
    ...(variant === 'letter'
      ? {
          fontSize: theme.fontSize.xxl * 2,
          lineHeight: Math.round(
            theme.fontSize.xxl * 2 * theme.lineHeight.tight,
          ),
          textAlign: 'center' as const,
        }
      : {}),
  };

  return <Text style={[styles.text, base, style]} {...rest} />;
}

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});
