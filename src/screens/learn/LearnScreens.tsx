import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { listCourses } from '@/services/firebase/courses';
import { useTheme } from '@/theme';
import type { Course, LocalizedText } from '@/types';

function localized(text: LocalizedText | undefined): string {
  return text?.en ?? text?.fr ?? '';
}

export function DashboardScreen() {
  const theme = useTheme();
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

  if (error !== null || courses === null) {
    return (
      <PlaceholderScreen
        title="Dashboard"
        subtitle={error ?? 'Loading your courses…'}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.heading,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.bold,
            fontSize: theme.fontSize.xl,
          },
        ]}
      >
        Your learning journey
      </Text>
      {courses.length === 0 ? (
        <Text style={{ color: theme.colors.textSecondary }}>
          No published courses yet.
        </Text>
      ) : null}
      {courses.map(course => (
        <Card key={course.id} style={styles.card}>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.semiBold,
              fontSize: theme.fontSize.lg,
            }}
          >
            {localized(course.title)}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
              fontSize: theme.fontSize.sm,
              marginTop: theme.spacing.xs,
            }}
          >
            {localized(course.description)}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
              fontSize: theme.fontSize.xs,
              marginTop: theme.spacing.sm,
            }}
          >
            {course.dialect} · {course.level} · {course.moduleCount} modules
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

export function CourseDetailsScreen() {
  return <PlaceholderScreen title="Course details" />;
}

export function ModuleScreen() {
  return <PlaceholderScreen title="Module" />;
}

export function LessonScreen() {
  return <PlaceholderScreen title="Lesson" />;
}

export function ExerciseScreen() {
  return <PlaceholderScreen title="Exercise" />;
}

export function LessonCompleteScreen() {
  return <PlaceholderScreen title="Lesson complete" />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
  heading: { marginBottom: 4 },
  card: { padding: 16 },
});
