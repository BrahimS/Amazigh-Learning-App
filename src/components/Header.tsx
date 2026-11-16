import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AmazighText } from '@/components/AmazighText';
import { useTheme } from '@/theme';

interface HeaderProps {
  title: string;
  /** Renders a back button when provided (stack screens). */
  onBack?: () => void;
  /** Optional element rendered on the right side. */
  right?: React.ReactNode;
}

/** Screen header: 44×44 back target, themed title, optional right slot. */
export function Header({ title, onBack, right }: HeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={theme.colors.textPrimary}
          />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <AmazighText
        variant="heading"
        numberOfLines={1}
        style={[styles.title, { color: theme.colors.textPrimary }]}
      >
        {title}
      </AmazighText>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingVertical: 8,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
});
