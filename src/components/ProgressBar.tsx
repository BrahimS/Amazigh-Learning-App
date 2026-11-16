import React from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

interface ProgressBarProps {
  /** Value between 0 and 1. */
  progress: number;
  /** Accessible label describing what is progressing. */
  label?: string;
}

/** Thin progress indicator (lesson/exercise progress, daily goal). */
export function ProgressBar({ progress, label }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.border,
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.sm,
            width: `${clamped * 100}%` as DimensionValue,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
