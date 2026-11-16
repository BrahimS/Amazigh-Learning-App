import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listAchievements } from '@/services/firebase/achievements';
import { useTheme } from '@/theme';
import type { Achievement, ProfileStackParamList } from '@/types';
import { localizedText } from '@/utils/localized';

type ProfileNavigation = NativeStackNavigationProp<ProfileStackParamList>;

function criteriaLabel(
  achievement: Achievement,
  t: TFunction<'translation'>,
): string {
  const { type, threshold } = achievement.criteria;
  if (type === 'xp') {
    return t('profile.criteriaXp', { threshold });
  }
  if (type === 'streak') {
    return t('profile.criteriaStreak', { threshold });
  }
  return t('profile.criteriaLessons', { threshold });
}

export function AchievementsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<ProfileNavigation>();
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listAchievements().then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setAchievements(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('profile.achievementsTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('profile.loadError')}
        />
      ) : achievements === null ? (
        <View style={styles.skeletons}>
          <Skeleton height={88} borderRadius={16} />
          <Skeleton height={88} borderRadius={16} />
        </View>
      ) : achievements.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title={t('profile.achievementsEmptyTitle')}
          message={t('profile.achievementsEmptyMessage')}
        />
      ) : (
        achievements.map(achievement => (
          <Card key={achievement.id} style={styles.card}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primaryLight + '26' },
              ]}
            >
              <Ionicons
                name={
                  (achievement.icon as keyof typeof Ionicons.glyphMap) ??
                  'star-outline'
                }
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.cardText}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fonts.latin.semiBold,
                  },
                ]}
              >
                {localizedText(achievement.title)}
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.latin.regular,
                  },
                ]}
              >
                {localizedText(achievement.description)}
              </Text>
              <View
                style={[
                  styles.criteriaBadge,
                  { backgroundColor: theme.colors.secondaryLight + '33' },
                ]}
              >
                <Text
                  style={[
                    styles.criteriaText,
                    {
                      color: theme.colors.secondary,
                      fontFamily: theme.fonts.latin.semiBold,
                    },
                  ]}
                >
                  {criteriaLabel(achievement, t)}
                </Text>
              </View>
            </View>
          </Card>
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
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  criteriaBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  criteriaText: {
    fontSize: 12,
  },
});
