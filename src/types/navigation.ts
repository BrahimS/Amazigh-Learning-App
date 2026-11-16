/**
 * Navigation param lists.
 *
 * Canonical route names and params are documented in `docs/TECHNICAL_ARCHITECTURE.md` §4.1.
 */
import type { NavigatorScreenParams } from '@react-navigation/native';

import type { DialectId } from './dialect';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Register: { dialect?: DialectId };
  Login: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  DialectSelection: undefined;
  LearningPreferences: { dialect: DialectId };
};

export type LearnStackParamList = {
  Dashboard: undefined;
  CourseDetails: { courseId: string };
  Module: { courseId: string; moduleId: string };
  Lesson: { courseId: string; moduleId: string; lessonId: string };
  Exercise: { lessonId: string; stepIndex: number };
  LessonComplete: { lessonId: string; score: number };
};

export type VocabularyStackParamList = {
  Library: { query?: string } | undefined;
  WordDetails: { vocabularyId: string };
  Flashcards: { deckId?: string };
};

export type TifinaghStackParamList = {
  Alphabet: undefined;
  LetterDetails: { letterId: string };
  LetterQuiz: { letterIds?: string[] };
};

export type CultureStackParamList = {
  CultureHome: undefined;
  Article: { articleId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Achievements: undefined;
  Statistics: undefined;
};

export type MainTabParamList = {
  Learn: NavigatorScreenParams<LearnStackParamList>;
  Vocabulary: NavigatorScreenParams<VocabularyStackParamList>;
  Tifinagh: NavigatorScreenParams<TifinaghStackParamList>;
  Culture: NavigatorScreenParams<CultureStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
