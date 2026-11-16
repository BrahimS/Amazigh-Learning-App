import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme';
import type { LearnStackParamList } from '@/types';

type LearnNavigation = NativeStackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'LessonComplete'>;

export function LessonCompleteScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnNavigation>();
  const { score, maxScore, xpReward } = useRoute<Route>().params;

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View
          style={[
            styles.trophyCircle,
            { backgroundColor: theme.colors.primaryLight + '33' },
          ]}
        >
          <Ionicons name="trophy" size={56} color={theme.colors.primary} />
        </View>
        <AmazighText variant="heading" style={styles.title}>
          {t('learn.lessonCompleteTitle')}
        </AmazighText>
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {t('learn.lessonCompleteMessage')}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.statValue,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.bold,
              },
            ]}
          >
            {score}/{maxScore}
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
            {t('learn.scoreLabel')}
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.statValue,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.bold,
              },
            ]}
          >
            +{xpReward}
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
            {t('learn.xpEarned', { xp: xpReward })}
          </Text>
        </View>
      </View>

      <Button
        title={t('learn.backToCourses')}
        size="lg"
        onPress={() => navigation.popToTop()}
        style={styles.done}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: 24,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  trophyCircle: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  done: {
    marginTop: 8,
  },
});
