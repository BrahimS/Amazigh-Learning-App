import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.secondary
      : 'transparent';
  const textColor =
    variant === 'outline' ? theme.colors.primary : theme.colors.textInverse;
  const borderColor =
    variant === 'outline' ? theme.colors.primary : 'transparent';

  const containerStyle: ViewStyle = {
    backgroundColor: isDisabled ? theme.colors.border : backgroundColor,
    borderColor,
    borderRadius: theme.radius.md,
    borderWidth: variant === 'outline' ? 2 : 0,
    minHeight: size === 'lg' ? 52 : 44,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.title,
            {
              color: isDisabled ? theme.colors.textSecondary : textColor,
              fontFamily: theme.fonts.latin.semiBold,
              fontSize: size === 'lg' ? theme.fontSize.lg : theme.fontSize.md,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  title: {
    textAlign: 'center',
  },
});
