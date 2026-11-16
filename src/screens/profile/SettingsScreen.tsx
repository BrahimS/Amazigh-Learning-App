import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';
import type { DialectId, LearningGoal, UiLanguage } from '@/types';
import { USER_DIALECTS } from '@/types';

const GOALS: LearningGoal[] = ['travel', 'family', 'school', 'culture', 'work'];
const DAILY_OPTIONS = [5, 10, 15, 20, 30] as const;
const LANGUAGES: UiLanguage[] = ['fr', 'en'];

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Card
        style={[
          styles.option,
          selected && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
      >
        <AmazighText style={{ fontFamily: theme.fonts.latin.semiBold }}>
          {label}
        </AmazighText>
      </Card>
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <AmazighText
        style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
      >
        {title.toUpperCase()}
      </AmazighText>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const uiLanguage = usePreferencesStore(state => state.uiLanguage);
  const dialect = usePreferencesStore(state => state.dialect);
  const learningGoal = usePreferencesStore(state => state.learningGoal);
  const dailyGoalMinutes = usePreferencesStore(state => state.dailyGoalMinutes);
  const setUiLanguage = usePreferencesStore(state => state.setUiLanguage);
  const setDialect = usePreferencesStore(state => state.setDialect);
  const setLearningGoal = usePreferencesStore(state => state.setLearningGoal);
  const setDailyGoalMinutes = usePreferencesStore(
    state => state.setDailyGoalMinutes,
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AmazighText variant="heading" style={styles.title}>
        {t('settings.title')}
      </AmazighText>

      <Section title={t('settings.language')}>
        <View style={styles.options}>
          {LANGUAGES.map(lang => (
            <OptionRow
              key={lang}
              label={lang === 'fr' ? 'Français' : 'English'}
              selected={uiLanguage === lang}
              onPress={() => setUiLanguage(lang)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.dialect')}>
        <View style={styles.options}>
          {USER_DIALECTS.map(option => (
            <OptionRow
              key={option}
              label={t(`onboarding.dialects.${option}.name`)}
              selected={dialect === option}
              onPress={() => setDialect(option as DialectId)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.learning')}>
        <View style={styles.options}>
          {GOALS.map(option => (
            <OptionRow
              key={option}
              label={t(`onboarding.goals.${option}`)}
              selected={learningGoal === option}
              onPress={() => setLearningGoal(option)}
            />
          ))}
        </View>
        <AmazighText
          style={[styles.subLabel, { color: theme.colors.textSecondary }]}
        >
          {t('settings.dailyGoal')}
        </AmazighText>
        <View style={styles.options}>
          {DAILY_OPTIONS.map(option => (
            <OptionRow
              key={option}
              label={`${option} min`}
              selected={dailyGoalMinutes === option}
              onPress={() => setDailyGoalMinutes(option)}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  options: {
    gap: 10,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
