# Technical Architecture

## 1. Overview

```
┌──────────────────────────────┐
│ React Native app (TypeScript)│
│  ├─ Screens / Components     │
│  ├─ React Navigation         │
│  ├─ Zustand stores           │
│  └─ Services layer ──────────┼──► Firebase Authentication
│                              │──► Cloud Firestore (content + user data)
│                              │──► Firebase Storage (audio, images)
│                              │──► Firebase Cloud Messaging (post-MVP)
└──────────────────────────────┘
```

The app is a client-heavy React Native application backed by Firebase managed services. There is no custom server for the MVP. Privileged operations (content publishing, role assignment) are done by admins through the Firebase console or admin scripts. Cloud Functions may be introduced later.

## 2. Technology choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React Native (CLI) + TypeScript | Native modules for audio and Firebase; type safety |
| Firebase SDK | `@react-native-firebase/*` | Native SDKs, offline persistence, FCM support |
| Navigation | React Navigation v7 (native stack + bottom tabs) | De-facto standard |
| State | Zustand | **Decided (Sprint 1).** Small API and easy persistence; Redux Toolkit remains the documented fallback if complexity grows |
| Server cache | TanStack Query (optional) | Caching and retries for Firestore reads |
| Forms | React Hook Form + Zod | Validation for auth and profile |
| Audio | `react-native-track-player` or `react-native-sound` (to be decided in "Implement audio player") | Playback speed, caching |
| i18n | `i18next` + `react-i18next` | FR/EN UI strings |
| Testing | Jest, React Native Testing Library, Firebase Emulator Suite; Detox/Maestro for E2E | |
| CI | GitHub Actions (lint, type check, tests) | |

## 3. Application layers

1. **Presentation**: `src/screens`, `src/components`, theme from `src/theme`.
2. **Navigation**: `src/navigation` (AuthStack, OnboardingStack, MainTabs).
3. **State**: `src/store` (auth/session, user preferences, learning progress, gamification).
4. **Services**: `src/services/firebase` (auth, firestore, storage, messaging wrappers). Screens never call Firebase directly.
5. **Domain types**: `src/types` (Course, Module, Lesson, Exercise, VocabularyItem, UserProgress, ...).

## 4. Navigation structure

```
RootNavigator
├── AuthStack (unauthenticated)
│   ├── Splash
│   ├── Welcome / Onboarding carousel
│   ├── Register
│   ├── Login
│   └── ForgotPassword
├── OnboardingStack (first login)
│   ├── DialectSelection
│   └── LearningPreferences (goal, daily target)
└── MainTabs (authenticated)
    ├── Learn      → Dashboard → CourseDetails → Module → Lesson → Exercise → LessonComplete
    ├── Vocabulary → Library → WordDetails / Flashcards
    ├── Tifinagh   → Alphabet → LetterDetails → LetterQuiz
    ├── Culture    → CultureHome → Article (post-MVP)
    └── Profile    → Profile → Settings / Achievements / Statistics
```

### 4.1 Navigation types

Route names and params are typed in `src/types/navigation.ts` and shared with React Navigation. The canonical definitions:

```ts
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
```

`DialectId` is `'tachelhit' | 'central-atlas' | 'tarifit'` (see `src/types`).

## 5. Environments

| Environment | Firebase project | Purpose |
|-------------|-----------------|---------|
| `dev` | `amazigh-learning-dev` | Local development and Emulator Suite |
| `staging` | `amazigh-learning-staging` | Internal testing builds |
| `prod` | `amazigh-learning-prod` | Store releases |

Configuration is selected at build time (`react-native-config` / build flavors). Firebase config files are **not committed**; see `FIREBASE_SECURITY.md`.

## 6. Error handling and logging

- A global error boundary shows a fallback screen.
- Services return typed results and map Firebase error codes to user-friendly messages.
- Crashlytics (optional, post-MVP decision) for crash reporting.

## 7. Offline behaviour

Firestore offline persistence is enabled. Downloaded lesson content and recently played audio are cached so a started lesson can be completed offline. Progress syncs when the device is back online.

## 8. Architecture decision records

| # | Decision | Status |
|---|----------|--------|
| ADR-001 | React Native CLI over Expo (native Firebase and audio modules) | Accepted |
| ADR-002 | Zustand for global state | Accepted |
| ADR-003 | Content stored in Firestore, media in Storage, no custom backend for MVP | Accepted |
| ADR-004 | Separate Firebase projects per environment | Accepted |

All four ADRs were accepted during Sprint 1 (issue "Define technical architecture", #15). Revisit ADR-002 only if state complexity grows beyond what Zustand handles comfortably.
