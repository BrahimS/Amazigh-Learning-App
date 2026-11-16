import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listLetters } from '@/services/firebase/letters';
import { useTheme } from '@/theme';
import type { TifinaghLetter, TifinaghStackParamList } from '@/types';

type TifinaghNavigation = NativeStackNavigationProp<TifinaghStackParamList>;

interface QuizQuestion {
  letter: TifinaghLetter;
  options: TifinaghLetter[];
}

function buildQuestions(letters: TifinaghLetter[]): QuizQuestion[] {
  return letters.map(letter => {
    const others = letters.filter(l => l.id !== letter.id);
    const distractors = others.slice(0, 3);
    const options = [letter, ...distractors];
    // Deterministic-ish shuffle so the correct answer is not always first.
    return { letter, options: options.sort(() => Math.random() - 0.5) };
  });
}

export function LetterQuizScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<TifinaghNavigation>();
  const [letters, setLetters] = useState<TifinaghLetter[] | null>(null);
  const [error, setError] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer?: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;
    listLetters().then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setLetters(result.data);
        if (result.data.length >= 2) {
          setQuestions(buildQuestions(result.data));
        }
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const total = questions?.length ?? 0;
  const question = questions?.[index];

  function handleSelect(letter: TifinaghLetter) {
    if (feedback !== null || question === undefined) {
      return;
    }
    const correct = letter.id === question.letter.id;
    setSelectedId(letter.id);
    setFeedback({
      correct,
      correctAnswer: correct
        ? undefined
        : `${question.letter.glyph} — ${question.letter.latin}`,
    });
    if (correct) {
      setScore(value => value + 1);
    }
  }

  function handleContinue() {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(value => value + 1);
      setSelectedId(null);
      setFeedback(null);
    }
  }

  function restart() {
    if (letters === null) {
      return;
    }
    setQuestions(buildQuestions(letters));
    setIndex(0);
    setSelectedId(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }

  const optionState = useMemo(
    () => (option: TifinaghLetter) => {
      if (feedback === null) {
        return 'idle' as const;
      }
      if (option.id === question?.letter.id) {
        return 'correct' as const;
      }
      if (option.id === selectedId) {
        return 'incorrect' as const;
      }
      return 'dimmed' as const;
    },
    [feedback, question, selectedId],
  );

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('tifinagh.quizTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('tifinagh.loadError')}
        />
      ) : letters === null || (letters.length >= 2 && questions === null) ? (
        <View style={styles.skeletons}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={64} borderRadius={16} />
          <Skeleton height={64} borderRadius={16} />
        </View>
      ) : letters.length < 2 ? (
        <EmptyState
          icon="help-circle-outline"
          title={t('tifinagh.notEnoughTitle')}
          message={t('tifinagh.notEnoughMessage')}
        />
      ) : finished ? (
        <View style={styles.finished}>
          <Ionicons
            name="ribbon-outline"
            size={56}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.finishedTitle,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.bold,
                fontSize: theme.fontSize.xl,
              },
            ]}
          >
            {t('tifinagh.quizCompleteTitle')}
          </Text>
          <Text
            style={[
              styles.finishedMessage,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
              },
            ]}
          >
            {t('tifinagh.quizCompleteMessage', { score, total })}
          </Text>
          <Button
            title={t('vocabulary.restart')}
            onPress={restart}
            style={styles.restartButton}
          />
        </View>
      ) : question ? (
        <>
          <ProgressBar
            progress={(index + 1) / total}
            label={t('tifinagh.quizProgress', {
              current: index + 1,
              total,
            })}
          />

          <Card style={styles.questionCard}>
            <Text
              style={[
                styles.questionText,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {t('tifinagh.quizQuestion', { latin: question.letter.latin })}
            </Text>
          </Card>

          <View style={styles.options}>
            {question.options.map(option => {
              const state = optionState(option);
              const borderColor =
                state === 'correct'
                  ? theme.colors.accent
                  : state === 'incorrect'
                  ? theme.colors.danger
                  : theme.colors.border;
              const backgroundColor =
                state === 'correct'
                  ? theme.colors.accent + '22'
                  : state === 'incorrect'
                  ? theme.colors.danger + '22'
                  : theme.colors.surface;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={option.glyph}
                  accessibilityState={{ disabled: feedback !== null }}
                  disabled={feedback !== null}
                  onPress={() => handleSelect(option)}
                >
                  <Card
                    style={[
                      styles.optionCard,
                      { backgroundColor, borderColor },
                    ]}
                  >
                    <AmazighText
                      variant="letter"
                      style={[
                        styles.optionGlyph,
                        {
                          color:
                            state === 'dimmed'
                              ? theme.colors.textSecondary
                              : theme.colors.textPrimary,
                          fontFamily: theme.fonts.tifinagh.regular,
                        },
                      ]}
                    >
                      {option.glyph}
                    </AmazighText>
                    <Text
                      style={[
                        styles.optionLatin,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.fonts.latin.regular,
                        },
                      ]}
                    >
                      {option.latin}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {feedback ? (
            <FeedbackBanner
              variant={feedback.correct ? 'correct' : 'incorrect'}
              correctAnswer={feedback.correctAnswer}
              onContinue={handleContinue}
              continueLabel={t('common.continue')}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  skeletons: {
    gap: 12,
  },
  questionCard: {
    padding: 20,
  },
  questionText: {
    fontSize: 17,
    textAlign: 'center',
  },
  options: {
    gap: 10,
  },
  optionCard: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  optionGlyph: {
    fontSize: 36,
    width: 56,
  },
  optionLatin: {
    fontSize: 16,
  },
  finished: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  finishedTitle: {},
  finishedMessage: {
    fontSize: 15,
    textAlign: 'center',
  },
  restartButton: {
    marginTop: 12,
    minWidth: 200,
  },
});
