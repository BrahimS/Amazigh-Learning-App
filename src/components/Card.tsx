import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';

interface CardProps extends ViewProps {
  /** Visual feedback state used by exercises and achievements. */
  state?: 'default' | 'correct' | 'incorrect';
}

export function Card({
  state = 'default',
  style,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();

  const borderColor =
    state === 'correct'
      ? theme.colors.correct
      : state === 'incorrect'
      ? theme.colors.incorrect
      : theme.colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
  },
});
