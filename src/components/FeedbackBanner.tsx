import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

interface FeedbackBannerProps {
  variant: 'correct' | 'incorrect';
  /** The accepted answer, shown after a mistake (guidelines feedback pattern). */
  correctAnswer?: string;
  onContinue?: () => void;
  continueLabel?: string;
}

/**
 * Exercise feedback: green highlight when correct; red highlight plus the
 * correct answer and a Continue button when incorrect.
 */
export function FeedbackBanner({
  variant,
  correctAnswer,
  onContinue,
  continueLabel = 'Continue',
}: FeedbackBannerProps) {
  const theme = useTheme();
  const isCorrect = variant === 'correct';
  const accent = isCorrect ? theme.colors.accent : theme.colors.danger;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor:
            (isCorrect ? theme.colors.accentLight : theme.colors.dangerLight) +
            '40',
          borderColor: accent,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={isCorrect ? 'checkmark-circle' : 'close-circle'}
          size={28}
          color={accent}
        />
        <AmazighText
          variant="heading"
          style={[styles.title, { color: accent }]}
        >
          {isCorrect ? 'Correct!' : 'Not quite'}
        </AmazighText>
      </View>
      {!isCorrect && correctAnswer ? (
        <AmazighText
          style={[styles.answer, { color: theme.colors.textPrimary }]}
        >
          Correct answer: {correctAnswer}
        </AmazighText>
      ) : null}
      {onContinue ? (
        <Button
          title={continueLabel}
          onPress={onContinue}
          style={styles.continue}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  answer: {
    fontSize: 15,
  },
  continue: {
    alignSelf: 'flex-start',
  },
});
