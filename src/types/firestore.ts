import type { DialectId, UiLanguage } from './dialect';

/** Firestore Timestamp shape (SDK objects are converted at the service boundary). */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

/** Localised text keyed by UI language, e.g. `{ fr: "Bonjour", en: "Hello" }`. */
export type LocalizedText = Partial<Record<UiLanguage, string>>;

/** Amazigh text in both scripts, e.g. `{ tifinagh: "ⴰⵣⵓⵍ", latin: "azul" }`. */
export interface AmazighText {
  tifinagh: string;
  latin?: string;
}

// ---------------------------------------------------------------- users

export type UserRole = 'learner' | 'contributor' | 'admin';

export type LearningGoal = 'travel' | 'family' | 'school' | 'culture' | 'work';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  dialect: DialectId;
  uiLanguage: UiLanguage;
  learningGoal?: LearningGoal;
  dailyGoalMinutes: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  /** YYYY-MM-DD, used for streak calculation. */
  lastActiveDate?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLessonId?: string;
  percent: number;
  updatedAt: FirestoreTimestamp;
}

export interface LessonResult {
  lessonId: string;
  score: number;
  maxScore: number;
  attempts: number;
  completedAt: FirestoreTimestamp;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: FirestoreTimestamp;
}

/** Spaced-repetition state, post-MVP (`users/{uid}/vocabulary/{wordId}`). */
export interface SpacedRepetitionState {
  ease: number;
  interval: number;
  dueAt: FirestoreTimestamp;
  reviews: number;
}

// -------------------------------------------------------------- content

export type CourseLevel = 'A1' | 'A2' | 'B1';

export interface Course {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  dialect: DialectId;
  level: CourseLevel;
  order: number;
  imageUrl?: string;
  published: boolean;
  moduleCount: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: LocalizedText;
  order: number;
  lessonCount: number;
}

export type LessonStep =
  | { type: 'content'; title: LocalizedText; body: LocalizedText }
  | { type: 'exercise'; exerciseId: string };

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: LocalizedText;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  steps: LessonStep[];
}

export type ExerciseType =
  | 'mcq'
  | 'translation'
  | 'matching'
  | 'sentence'
  | 'fillBlank'
  | 'listening';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: LocalizedText | AmazighText;
  options?: unknown[];
  answer: unknown;
  audioPath?: string;
  dialect: DialectId;
}

export interface VocabularyExample {
  text: AmazighText;
  translations: LocalizedText;
}

export interface VocabularyItem {
  id: string;
  text: AmazighText;
  translations: LocalizedText;
  dialect: DialectId;
  partOfSpeech?: string;
  category?: string;
  examples?: VocabularyExample[];
  audioPath?: string;
  validated: boolean;
  validatedBy?: string;
}

export interface TifinaghLetter {
  id: string;
  glyph: string;
  /** e.g. "U+2D30" */
  unicode: string;
  name: string;
  latin: string;
  ipa?: string;
  audioPath?: string;
  order: number;
  /** Vocabulary document ids. */
  examples?: string[];
}

export type AchievementCriteria = {
  type: 'xp' | 'streak' | 'lessons';
  threshold: number;
};

export interface Achievement {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon?: string;
  criteria: AchievementCriteria;
}

// --------------------------------------------------------------- culture

export type CultureCategory = 'history' | 'traditions' | 'proverbs' | 'regions';

export interface CultureArticle {
  id: string;
  category: CultureCategory;
  title: string;
  body: string;
  images?: string[];
  region?: string;
  published: boolean;
}
