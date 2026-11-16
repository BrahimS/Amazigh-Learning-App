import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '@/theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

/** Themed text field with label and inline error (44+ pt touch target). */
export function TextInput({ label, error, style, ...rest }: AppTextInputProps) {
  const theme = useTheme();
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.semiBold,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <RNTextInput
        placeholderTextColor={theme.colors.textSecondary}
        accessibilityLabel={label ?? rest.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.regular,
            fontSize: theme.fontSize.md,
          },
          style,
        ]}
        {...rest}
      />
      {hasError ? (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.danger,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
  },
});
