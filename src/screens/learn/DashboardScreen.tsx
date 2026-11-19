import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listCourses } from '@/services/firebase/courses';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme';
import type { Course, LearnStackParamList, LocalizedText } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;

export function localized(text: LocalizedText | undefined): string {
  return text?.en ?? text?.fr ?? '';
}

function StatChip({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.statChip,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.bold,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.regular,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function CourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={localized(course.title)}
      onPress={onPress}
    >
      <Card style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={styles.courseText}>
            <Text
              style={[
                styles.courseTitle,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {localized(course.title)}
            </Text>
            <Text
              style={[
                styles.courseDescription,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.latin.regular,
                },
              ]}
            >
              {localized(course.description)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.colors.textSecondary}
          />
        </View>
        <View style={styles.courseMetaRow}>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: theme.colors.secondaryLight + '33' },
            ]}
          >
            <Text
              style={[
                styles.levelText,
                {
                  color: theme.colors.secondaryText,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {course.level}
            </Text>
          </View>
          <Text
            style={[
              styles.courseMeta,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
              },
            ]}
          >
            {course.dialect} · {course.moduleCount} {t('learn.modulesLabel')}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const user = useSessionStore(state => state.user);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listCourses().then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setCourses(result.data);
      } else {
        setError(result.error.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text
          style={[
            styles.greeting,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.bold,
              fontSize: theme.fontSize.xl,
            },
          ]}
        >
          {t('learn.greeting', {
            name: user?.displayName?.split(' ')[0] ?? 'learner',
          })}
        </Text>
        <View style={styles.statsRow}>
          <StatChip
            icon="flash"
            value={String(user?.xp ?? 0)}
            label={t('learn.xpLabel')}
          />
          <StatChip
            icon="flame"
            value={String(user?.currentStreak ?? 0)}
            label={t('learn.streakLabel')}
          />
        </View>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.semiBold,
          },
        ]}
      >
        {t('learn.yourCourses')}
      </Text>

      {error ? (
        <EmptyState icon="cloud-offline-outline" title={t('learn.loadError')} />
      ) : courses === null ? (
        <View style={styles.skeletons}>
          <Skeleton height={110} borderRadius={16} />
          <Skeleton height={110} borderRadius={16} />
        </View>
      ) : courses.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title={t('learn.noCoursesTitle')}
          message={t('learn.noCoursesMessage')}
        />
      ) : (
        courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() =>
              navigation.navigate('CourseDetails', { courseId: course.id })
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
    paddingTop: 16,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {},
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statChip: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  skeletons: {
    gap: 12,
  },
  courseCard: {
    gap: 12,
  },
  courseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  courseText: {
    flex: 1,
    gap: 4,
  },
  courseTitle: {
    fontSize: 17,
  },
  courseDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  courseMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 12,
  },
  courseMeta: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
