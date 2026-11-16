import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ArticleScreen } from '@/screens/culture/ArticleScreen';
import { CultureHomeScreen } from '@/screens/culture/CultureHomeScreen';
import { CourseDetailsScreen } from '@/screens/learn/CourseDetailsScreen';
import { DashboardScreen } from '@/screens/learn/DashboardScreen';
import { ExerciseScreen } from '@/screens/learn/ExerciseScreen';
import { LessonCompleteScreen } from '@/screens/learn/LessonCompleteScreen';
import { LessonScreen } from '@/screens/learn/LessonScreen';
import { ModuleScreen } from '@/screens/learn/ModuleScreen';
import { AchievementsScreen } from '@/screens/profile/AchievementsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { StatisticsScreen } from '@/screens/profile/StatisticsScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { FlashcardsScreen } from '@/screens/vocabulary/FlashcardsScreen';
import { LibraryScreen } from '@/screens/vocabulary/LibraryScreen';
import { WordDetailsScreen } from '@/screens/vocabulary/WordDetailsScreen';
import { AlphabetScreen } from '@/screens/tifinagh/AlphabetScreen';
import { LetterDetailsScreen } from '@/screens/tifinagh/LetterDetailsScreen';
import { LetterQuizScreen } from '@/screens/tifinagh/LetterQuizScreen';
import type {
  CultureStackParamList,
  LearnStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  TifinaghStackParamList,
  VocabularyStackParamList,
} from '@/types';

const LearnStack = createNativeStackNavigator<LearnStackParamList>();
const VocabularyStack = createNativeStackNavigator<VocabularyStackParamList>();
const TifinaghStack = createNativeStackNavigator<TifinaghStackParamList>();
const CultureStack = createNativeStackNavigator<CultureStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="Dashboard" component={DashboardScreen} />
      <LearnStack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <LearnStack.Screen name="Module" component={ModuleScreen} />
      <LearnStack.Screen name="Lesson" component={LessonScreen} />
      <LearnStack.Screen name="Exercise" component={ExerciseScreen} />
      <LearnStack.Screen
        name="LessonComplete"
        component={LessonCompleteScreen}
      />
    </LearnStack.Navigator>
  );
}

function VocabularyStackNavigator() {
  return (
    <VocabularyStack.Navigator screenOptions={{ headerShown: false }}>
      <VocabularyStack.Screen name="Library" component={LibraryScreen} />
      <VocabularyStack.Screen
        name="WordDetails"
        component={WordDetailsScreen}
      />
      <VocabularyStack.Screen name="Flashcards" component={FlashcardsScreen} />
    </VocabularyStack.Navigator>
  );
}

function TifinaghStackNavigator() {
  return (
    <TifinaghStack.Navigator screenOptions={{ headerShown: false }}>
      <TifinaghStack.Screen name="Alphabet" component={AlphabetScreen} />
      <TifinaghStack.Screen
        name="LetterDetails"
        component={LetterDetailsScreen}
      />
      <TifinaghStack.Screen name="LetterQuiz" component={LetterQuizScreen} />
    </TifinaghStack.Navigator>
  );
}

function CultureStackNavigator() {
  return (
    <CultureStack.Navigator screenOptions={{ headerShown: false }}>
      <CultureStack.Screen name="CultureHome" component={CultureHomeScreen} />
      <CultureStack.Screen name="Article" component={ArticleScreen} />
    </CultureStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Achievements" component={AchievementsScreen} />
      <ProfileStack.Screen name="Statistics" component={StatisticsScreen} />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Learn"
        component={LearnStackNavigator}
        options={{ title: t('tabs.learn') }}
      />
      <Tab.Screen
        name="Vocabulary"
        component={VocabularyStackNavigator}
        options={{ title: t('tabs.vocabulary') }}
      />
      <Tab.Screen
        name="Tifinagh"
        component={TifinaghStackNavigator}
        options={{ title: t('tabs.tifinagh') }}
      />
      <Tab.Screen
        name="Culture"
        component={CultureStackNavigator}
        options={{ title: t('tabs.culture') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
