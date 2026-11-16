import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView (default false). */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Horizontal padding from the spacing scale (default true). */
  padded?: boolean;
  /** Safe-area edges; tabs handle the bottom inset themselves. */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

/**
 * Base layout for every screen: theme background, safe-area handling and
 * consistent horizontal padding (4-pt scale, `spacing.lg`).
 */
export function Screen({
  children,
  scroll = false,
  contentContainerStyle,
  padded = true,
  edges = ['top'],
}: ScreenProps) {
  const theme = useTheme();
  const background = { backgroundColor: theme.colors.background };
  const padding = padded ? { paddingHorizontal: theme.spacing.lg } : null;

  if (scroll) {
    return (
      <SafeAreaView style={[styles.flex, background]} edges={edges}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padding, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, background, padding]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
