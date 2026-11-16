import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';
import type {
  DialectId,
  LearningGoal,
  OnboardingStackParamList,
} from '@/types';
import { USER_DIALECTS } from '@/types';

type OnboardingNavigation = NativeStackNavigationProp<OnboardingStackParamList>;

const GOALS: LearningGoal[] = ['travel', 'family', 'school', 'culture', 'work'];
const DAILY_OPTIONS = [5, 10, 15, 20, 30] as const;

export function DialectSelectionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<OnboardingNavigation>();
  const setDialect = usePreferencesStore(state => state.setDialect);
  const [selected, setSelected] = useState<DialectId | null>(null);

  const handleSelect = (dialect: DialectId) => {
    setSelected(dialect);
    setDialect(dialect);
    navigation.navigate('LearningPreferences', { dialect });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AmazighText variant="heading" style={styles.title}>
        {t('onboarding.dialectTitle')}
      </AmazighText>
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('onboarding.dialectSubtitle')}
      </AmazighText>

      <View style={styles.options}>
        {USER_DIALECTS.map(dialect => {
          const isSelected = selected === dialect;
          return (
            <Pressable
              key={dialect}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleSelect(dialect)}
            >
              <Card
                style={[
                  styles.option,
                  isSelected && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
                  {t(`onboarding.dialects.${dialect}.name`)}
                </AmazighText>
                <AmazighText
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t(`onboarding.dialects.${dialect}.description`)}
                </AmazighText>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function LearningPreferencesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const route =
    useRoute<RouteProp<OnboardingStackParamList, 'LearningPreferences'>>();
  const { dialect } = route.params;

  const learningGoal = usePreferencesStore(state => state.learningGoal);
  const dailyGoalMinutes = usePreferencesStore(state => state.dailyGoalMinutes);
  const setLearningGoal = usePreferencesStore(state => state.setLearningGoal);
  const setDailyGoalMinutes = usePreferencesStore(
    state => state.setDailyGoalMinutes,
  );
  const completeOnboarding = usePreferencesStore(
    state => state.completeOnboarding,
  );

  const [goal, setGoal] = useState<LearningGoal | null>(learningGoal);
  const [minutes, setMinutes] = useState<number>(dailyGoalMinutes);

  const handleStart = () => {
    if (goal) {
      setLearningGoal(goal);
    }
    setDailyGoalMinutes(minutes);
    completeOnboarding();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AmazighText variant="heading" style={styles.title}>
        {t('onboarding.goalTitle')}
      </AmazighText>
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('onboarding.goalSubtitle')} (
        {t(`onboarding.dialects.${dialect}.name`)})
      </AmazighText>

      <View style={styles.options}>
        {GOALS.map(option => {
          const isSelected = goal === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setGoal(option)}
            >
              <Card
                style={[
                  styles.option,
                  isSelected && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
                  {t(`onboarding.goals.${option}`)}
                </AmazighText>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <AmazighText
        variant="heading"
        style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
      >
        {t('onboarding.dailyTitle')}
      </AmazighText>
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('onboarding.dailySubtitle')}
      </AmazighText>

      <View style={styles.options}>
        {DAILY_OPTIONS.map(option => {
          const isSelected = minutes === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setMinutes(option)}
            >
              <Card
                style={[
                  styles.option,
                  isSelected && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
                  {option} min
                </AmazighText>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={t('onboarding.start')}
        size="lg"
        onPress={handleStart}
        style={styles.start}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    paddingVertical: 16,
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 32,
    marginBottom: 8,
  },
  start: {
    marginTop: 32,
    marginBottom: 48,
  },
});
