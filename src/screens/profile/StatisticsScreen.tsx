import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme';
import type { ProfileStackParamList } from '@/types';

type ProfileNavigation = NativeStackNavigationProp<ProfileStackParamList>;

function StatRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.statRow}>
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
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.semiBold,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function StatisticsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<ProfileNavigation>();
  const user = useSessionStore(state => state.user);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('profile.statisticsTitle')}
        onBack={() => navigation.goBack()}
      />

      <Card style={styles.card}>
        <StatRow label={t('profile.xpLabel')} value={String(user?.xp ?? 0)} />
        <StatRow
          label={t('profile.streakLabel')}
          value={`${user?.currentStreak ?? 0} ${t('profile.daysUnit')}`}
        />
        <StatRow
          label={t('profile.longestStreakLabel')}
          value={`${user?.longestStreak ?? 0} ${t('profile.daysUnit')}`}
        />
        <StatRow
          label={t('profile.dailyGoalLabel')}
          value={`${user?.dailyGoalMinutes ?? 0} min`}
        />
      </Card>

      <Card style={styles.card}>
        <StatRow
          label={t('profile.dialectLabel')}
          value={user?.dialect ?? '—'}
        />
        <StatRow
          label={t('profile.goalLabel')}
          value={user?.learningGoal ?? t('profile.noGoal')}
        />
      </Card>

      <Text
        style={[
          styles.note,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.regular,
          },
        ]}
      >
        {t('profile.statisticsNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    gap: 12,
    padding: 16,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
});
