/**
 * Navigation param lists.
 *
 * Canonical route names and params are documented in `docs/TECHNICAL_ARCHITECTURE.md` §4.1.
 * When React Navigation is configured (issue #37), these lists are passed to the
 * navigators via `NavigatorScreenParams`.
 */
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
  Library: { query?: string };
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
  Learn: LearnStackParamList;
  Vocabulary: VocabularyStackParamList;
  Tifinagh: TifinaghStackParamList;
  Culture: CultureStackParamList;
  Profile: ProfileStackParamList;
};

export type RootStackParamList = {
  Auth: AuthStackParamList;
  Onboarding: OnboardingStackParamList;
  Main: MainTabParamList;
};
