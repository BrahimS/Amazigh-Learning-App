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
import { listLessons } from '@/services/firebase/modules';
import { useTheme } from '@/theme';
import { localizedText } from '@/utils/localized';
import type { LearnStackParamList, Lesson } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'Module'>;

export function ModuleScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const { courseId, moduleId } = useRoute<Route>().params;
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listLessons(courseId, moduleId).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setLessons(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [courseId, moduleId]);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header title={t('learn.lessons')} onBack={() => navigation.goBack()} />
      {error ? (
        <EmptyState icon="cloud-offline-outline" title={t('learn.loadError')} />
      ) : lessons === null ? (
        <View style={styles.skeletons}>
          <Skeleton height={72} borderRadius={16} />
          <Skeleton height={72} borderRadius={16} />
        </View>
      ) : lessons.length === 0 ? (
        <EmptyState icon="book-outline" title={t('learn.notFound')} />
      ) : (
        lessons.map(lesson => (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={localizedText(lesson.title)}
            onPress={() =>
              navigation.navigate('Lesson', {
                courseId,
                moduleId,
                lessonId: lesson.id,
              })
            }
          >
            <Card style={styles.lessonCard}>
              <View style={styles.lessonText}>
                <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
                  {localizedText(lesson.title)}
                </AmazighText>
                <View style={styles.lessonMetaRow}>
                  <Text
                    style={[
                      styles.lessonMeta,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.latin.regular,
                      },
                    ]}
                  >
                    {t('learn.estimatedMinutes', {
                      minutes: lesson.estimatedMinutes,
                    })}{' '}
                    · {t('learn.xpReward', { xp: lesson.xpReward })}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.colors.textSecondary}
              />
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  skeletons: {
    gap: 12,
  },
  lessonCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  lessonText: {
    flex: 1,
    gap: 4,
  },
  lessonMetaRow: {
    flexDirection: 'row',
  },
  lessonMeta: {
    fontSize: 12,
  },
});
