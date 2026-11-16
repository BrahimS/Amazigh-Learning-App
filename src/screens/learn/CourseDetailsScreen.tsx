import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { getCourse } from '@/services/firebase/courses';
import { listModules } from '@/services/firebase/modules';
import { useTheme } from '@/theme';
import { localizedText } from '@/utils/localized';
import type { Course, CourseModule, LearnStackParamList } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'CourseDetails'>;

export function CourseDetailsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const { courseId } = useRoute<Route>().params;
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [modules, setModules] = useState<CourseModule[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [courseResult, modulesResult] = await Promise.all([
        getCourse(courseId),
        listModules(courseId),
      ]);
      if (!active) {
        return;
      }
      if (!courseResult.ok || !modulesResult.ok) {
        setError(true);
        setCourse(null);
        return;
      }
      setCourse(courseResult.data);
      setModules(modulesResult.data);
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  if (error) {
    return (
      <Screen>
        <Header
          title={t('learn.courseDetails')}
          onBack={() => navigation.goBack()}
        />
        <EmptyState icon="cloud-offline-outline" title={t('learn.loadError')} />
      </Screen>
    );
  }

  if (course === undefined || modules === null) {
    return (
      <Screen contentContainerStyle={styles.loading}>
        <Header
          title={t('learn.courseDetails')}
          onBack={() => navigation.goBack()}
        />
        <Skeleton height={120} borderRadius={16} />
        <Skeleton height={80} borderRadius={16} />
        <Skeleton height={80} borderRadius={16} />
      </Screen>
    );
  }

  if (course === null) {
    return (
      <Screen>
        <Header
          title={t('learn.courseDetails')}
          onBack={() => navigation.goBack()}
        />
        <EmptyState icon="book-outline" title={t('learn.notFound')} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('learn.courseDetails')}
        onBack={() => navigation.goBack()}
      />
      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
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
                  color: theme.colors.secondary,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {course.level}
            </Text>
          </View>
          <Text
            style={[
              styles.meta,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
                textTransform: 'capitalize',
              },
            ]}
          >
            {course.dialect}
          </Text>
        </View>
        <AmazighText variant="heading" style={styles.title}>
          {localizedText(course.title)}
        </AmazighText>
        <AmazighText
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {localizedText(course.description)}
        </AmazighText>
      </Card>

      <AmazighText
        variant="heading"
        style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
      >
        {t('learn.lessons')}
      </AmazighText>
      {modules.map(module => (
        <Pressable
          key={module.id}
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('Module', {
              courseId: course.id,
              moduleId: module.id,
            })
          }
        >
          <Card style={styles.moduleCard}>
            <View style={styles.moduleText}>
              <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
                {localizedText(module.title)}
              </AmazighText>
              <AmazighText
                style={[
                  styles.moduleMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {module.lessonCount} {t('learn.lessons').toLowerCase()}
              </AmazighText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={theme.colors.textSecondary}
            />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  loading: {
    gap: 12,
  },
  heroCard: {
    gap: 12,
  },
  heroRow: {
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
  meta: {
    fontSize: 12,
  },
  title: {
    fontSize: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  moduleCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  moduleText: {
    flex: 1,
    gap: 2,
  },
  moduleMeta: {
    fontSize: 12,
  },
});
