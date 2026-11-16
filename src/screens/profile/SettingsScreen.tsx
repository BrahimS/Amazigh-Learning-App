import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';
import type {
  DialectId,
  LearningGoal,
  ProfileStackParamList,
  UiLanguage,
} from '@/types';
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
      style={styles.optionPressable}
    >
      <Card
        style={[
          styles.option,
          selected && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
      >
        <AmazighText
          style={{
            color: selected ? theme.colors.primary : theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.semiBold,
          }}
        >
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
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.semiBold,
          },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

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
    <Screen scroll contentContainerStyle={styles.container}>
      <Header title={t('settings.title')} onBack={() => navigation.goBack()} />

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
        <Text style={[styles.subLabel, { color: theme.colors.textSecondary }]}>
          {t('settings.dailyGoal')}
        </Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 32,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  subLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  options: {
    gap: 10,
  },
  optionPressable: {
    minHeight: 44,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
