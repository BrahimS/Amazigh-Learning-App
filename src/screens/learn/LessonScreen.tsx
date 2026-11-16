import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { getExercise } from '@/services/firebase/exercises';
import { getLesson } from '@/services/firebase/modules';
import { useLessonSessionStore } from '@/store/lessonSessionStore';
import { useTheme } from '@/theme';
import { localizedText } from '@/utils/localized';
import type { Exercise, LearnStackParamList, Lesson } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'Lesson'>;

interface LessonData {
  lesson: Lesson;
  contentSteps: Extract<Lesson['steps'][number], { type: 'content' }>[];
  exerciseIds: string[];
}

async function loadLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<LessonData | null> {
  const result = await getLesson(courseId, moduleId, lessonId);
  if (!result.ok || !result.data) {
    return null;
  }
  const lesson = result.data;
  return {
    lesson,
    contentSteps: lesson.steps.filter(
      (step): step is Extract<Lesson['steps'][number], { type: 'content' }> =>
        step.type === 'content',
    ),
    exerciseIds: lesson.steps
      .filter(step => step.type === 'exercise')
      .map(step => (step as { exerciseId: string }).exerciseId),
  };
}

export function LessonScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const { courseId, moduleId, lessonId } = useRoute<Route>().params;
  const [data, setData] = useState<LessonData | undefined>(undefined);
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;
    loadLesson(courseId, moduleId, lessonId).then(result => {
      if (!active) {
        return;
      }
      if (result) {
        setData(result);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [courseId, moduleId, lessonId]);

  const startExercises = async () => {
    if (!data || data.exerciseIds.length === 0) {
      return;
    }
    setStarting(true);
    const results = await Promise.all(
      data.exerciseIds.map(id => getExercise(id)),
    );
    const exercises: Exercise[] = results
      .filter((r): r is { ok: true; data: Exercise } => r.ok && r.data !== null)
      .map(r => r.data);
    setStarting(false);
    if (exercises.length === 0) {
      setError(true);
      return;
    }
    useLessonSessionStore.getState().startLesson(lessonId, exercises);
    navigation.navigate('Exercise', { courseId, moduleId, lessonId });
  };

  if (error) {
    return (
      <Screen>
        <Header title={t('learn.lessons')} onBack={() => navigation.goBack()} />
        <EmptyState icon="cloud-offline-outline" title={t('learn.loadError')} />
      </Screen>
    );
  }

  if (data === undefined) {
    return (
      <Screen contentContainerStyle={styles.loading}>
        <Header title={t('learn.lessons')} onBack={() => navigation.goBack()} />
        <Skeleton height={100} borderRadius={16} />
        <Skeleton height={140} borderRadius={16} />
      </Screen>
    );
  }

  const { lesson, contentSteps, exerciseIds } = data;

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={localizedText(lesson.title)}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.metaRow}>
        <Text
          style={[
            styles.meta,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {t('learn.estimatedMinutes', { minutes: lesson.estimatedMinutes })} ·{' '}
          {t('learn.xpReward', { xp: lesson.xpReward })}
        </Text>
      </View>

      {contentSteps.map((step, index) => (
        <Card key={`content-${index}`} style={styles.stepCard}>
          <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
            {localizedText(step.title)}
          </AmazighText>
          <AmazighText
            style={[styles.stepBody, { color: theme.colors.textSecondary }]}
          >
            {localizedText(step.body)}
          </AmazighText>
        </Card>
      ))}

      {exerciseIds.length > 0 ? (
        <View style={styles.exerciseSection}>
          <AmazighText
            variant="heading"
            style={{ color: theme.colors.textPrimary, fontSize: 18 }}
          >
            {t('learn.lessonExercises')} ({exerciseIds.length})
          </AmazighText>
          <Button
            title={t('learn.startLesson')}
            size="lg"
            loading={starting}
            onPress={() => void startExercises()}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 48,
  },
  loading: {
    gap: 12,
  },
  metaRow: {
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
  },
  stepCard: {
    gap: 8,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  exerciseSection: {
    gap: 12,
    marginTop: 16,
  },
});
