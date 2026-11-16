import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Empty state per the guidelines: illustration/icon plus a call to action. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="text">
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.primaryLight + '26' },
        ]}
      >
        <Ionicons name={icon} size={40} color={theme.colors.primary} />
      </View>
      <AmazighText variant="heading" style={styles.title}>
        {title}
      </AmazighText>
      {message ? (
        <AmazighText
          style={[styles.message, { color: theme.colors.textSecondary }]}
        >
          {message}
        </AmazighText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="outline"
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  action: {
    marginTop: 24,
  },
});
