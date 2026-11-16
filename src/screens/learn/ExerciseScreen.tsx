import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { TextInput } from '@/components/TextInput';
import { getLesson } from '@/services/firebase/modules';
import {
  computeLessonScore,
  useLessonSessionStore,
  type AttemptFeedback,
} from '@/store/lessonSessionStore';
import { useTheme } from '@/theme';
import {
  optionLabel,
  promptLatinTranscription,
  promptLocalized,
  promptTifinagh,
  usesTextInput,
} from '@/utils/exercise';
import type { Exercise, LearnStackParamList } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'Exercise'>;

function ExercisePrompt({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  const tifinagh = promptTifinagh(exercise.prompt);
  const latin = promptLatinTranscription(exercise.prompt);
  const localized = promptLocalized(exercise.prompt);

  return (
    <View style={styles.prompt}>
      {tifinagh ? (
        <AmazighText script="tifinagh" style={styles.promptTifinagh}>
          {tifinagh}
        </AmazighText>
      ) : null}
      {latin ? (
        <Text
          style={[
            styles.promptLatin,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {latin}
        </Text>
      ) : null}
      {localized ? (
        <Text
          style={[
            styles.promptText,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.medium,
            },
          ]}
        >
          {localized}
        </Text>
      ) : null}
    </View>
  );
}

function McqOptions({
  exercise,
  onSelect,
}: {
  exercise: Exercise;
  onSelect: (option: unknown) => void;
}) {
  const theme = useTheme();
  const options = Array.isArray(exercise.options) ? exercise.options : [];
  return (
    <View style={styles.options}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          onPress={() => onSelect(option)}
        >
          <Card style={styles.optionCard}>
            <Text
              style={[
                styles.optionText,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.latin.medium,
                },
              ]}
            >
              {optionLabel(option)}
            </Text>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

export function ExerciseScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const { courseId, moduleId, lessonId } = useRoute<Route>().params;

  const lessonIdInStore = useLessonSessionStore(state => state.lessonId);
  const exercises = useLessonSessionStore(state => state.exercises);
  const currentIndex = useLessonSessionStore(state => state.currentIndex);
  const submitAnswer = useLessonSessionStore(state => state.submitAnswer);
  const nextExercise = useLessonSessionStore(state => state.nextExercise);

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [xpReward, setXpReward] = useState(0);

  useEffect(() => {
    let active = true;
    getLesson(courseId, moduleId, lessonId).then(result => {
      if (active && result.ok && result.data) {
        setXpReward(result.data.xpReward);
      }
    });
    return () => {
      active = false;
    };
  }, [courseId, moduleId, lessonId]);

  const sessionValid = lessonIdInStore === lessonId && exercises.length > 0;
  const exercise: Exercise | undefined = sessionValid
    ? exercises[Math.min(currentIndex, exercises.length - 1)]
    : undefined;

  if (!sessionValid || !exercise) {
    return (
      <Screen>
        <Header
          title={t('learn.lessonExercises')}
          onBack={() => navigation.goBack()}
        />
        <EmptyState icon="alert-circle-outline" title={t('learn.notFound')} />
      </Screen>
    );
  }

  const isLast = currentIndex >= exercises.length - 1;
  const answered = feedback !== null;
  const textInput = usesTextInput(exercise.type);
  const mcqOptions =
    exercise.type === 'mcq' && Array.isArray(exercise.options)
      ? exercise.options
      : null;

  const handleSubmit = (value: string) => {
    if (answered) {
      return;
    }
    setFeedback(submitAnswer(value));
  };

  const handleContinue = () => {
    if (isLast) {
      const { attempts } = useLessonSessionStore.getState();
      const { score, maxScore } = computeLessonScore(
        attempts,
        exercises.length,
      );
      navigation.replace('LessonComplete', {
        lessonId,
        score,
        maxScore,
        xpReward,
      });
      return;
    }
    nextExercise();
    setInput('');
    setFeedback(null);
  };

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('learn.lessonExercises')}
        onBack={() => navigation.goBack()}
      />

      <ProgressBar
        progress={exercises.length === 0 ? 0 : currentIndex / exercises.length}
        label={t('learn.exerciseProgress', {
          current: currentIndex + 1,
          total: exercises.length,
        })}
      />
      <Text
        style={[
          styles.progressLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.regular,
          },
        ]}
      >
        {t('learn.exerciseProgress', {
          current: currentIndex + 1,
          total: exercises.length,
        })}
      </Text>

      <ExercisePrompt exercise={exercise} />

      {mcqOptions ? (
        <McqOptions
          exercise={exercise}
          onSelect={option => handleSubmit(optionLabel(option))}
        />
      ) : textInput ? (
        <View style={styles.textInputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            editable={!answered}
            autoCapitalize="none"
            style={styles.textInput}
          />
          <Button
            title={t('learn.check')}
            onPress={() => handleSubmit(input)}
            disabled={answered || input.trim() === ''}
          />
        </View>
      ) : (
        <View style={styles.unsupported}>
          <EmptyState
            icon="construct-outline"
            title={t('learn.unsupportedExercise')}
          />
          <Button title={t('common.continue')} onPress={handleContinue} />
        </View>
      )}

      {feedback ? (
        <FeedbackBanner
          variant={feedback.correct ? 'correct' : 'incorrect'}
          correctAnswer={feedback.correct ? undefined : feedback.correctAnswer}
          onContinue={handleContinue}
          continueLabel={t('common.continue')}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 48,
  },
  progressLabel: {
    fontSize: 12,
    marginTop: -8,
  },
  prompt: {
    gap: 8,
  },
  promptTifinagh: {
    fontSize: 40,
    lineHeight: 52,
  },
  promptLatin: {
    fontSize: 16,
  },
  promptText: {
    fontSize: 17,
    lineHeight: 25,
  },
  options: {
    gap: 12,
  },
  optionCard: {
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  textInputRow: {
    gap: 12,
  },
  textInput: {
    flex: 1,
  },
  unsupported: {
    gap: 12,
  },
});
