# Product Requirements Document (PRD)

**Product:** Amazigh Learning App
**Owner:** @BrahimS
**Status:** Draft. Approval is tracked in the issue "Define Product Requirements Document" (Sprint 1).

## 1. Vision

Make Moroccan Amazigh (Tamazight) easy, enjoyable and culturally grounded to learn on a mobile phone. The app combines structured courses, native-speaker audio, the Tifinagh script and cultural context.

## 2. Problem statement

- Few high-quality digital resources exist for learning Moroccan Amazigh, especially in Tifinagh.
- Existing material rarely distinguishes the regional varieties or offers authentic pronunciation.
- Diaspora learners and heritage speakers lack a structured, motivating learning path.

## 3. Target users (personas)

| Persona | Description | Key needs |
|---------|-------------|-----------|
| Heritage learner | Moroccan diaspora member who understands a little Amazigh | Reconnect with family language and speaking practice |
| Beginner | Tourist, student or researcher with no prior knowledge | Alphabet, survival vocabulary, clear progression |
| Moroccan student | Learner following the national Tamazight curriculum | Tifinagh reading and writing, standard vocabulary |
| Content contributor | Native speaker, teacher or linguist | Submit and validate words, sentences and recordings |
| Administrator | Project team member | Manage courses, cultural content and users |

## 4. Supported varieties

The MVP supports dialect selection between **Tachelhit (Tashelhiyt)**, **Central Atlas Tamazight** and **Tarifit**. Standard Moroccan Amazigh (IRCAM) Tifinagh is the reference script. Latin transcription is shown as a learning aid.

## 5. MVP scope

### In scope

1. Account creation, login, logout, password recovery and profile
2. Onboarding with dialect, learning goal and preference selection
3. Learning dashboard with courses → modules → lessons and progress
4. Interactive exercises: multiple choice, translation, word matching and answer validation with feedback
5. Vocabulary library with search
6. Tifinagh alphabet screen with letter recognition
7. Native-speaker audio playback for words
8. XP, daily streaks and achievements
9. Android and iOS builds for initial testers

### Out of scope for MVP (post-MVP backlog)

- Sentence construction and fill-in-the-blank exercises (stretch goal for Sprint 4)
- Spaced repetition and flashcards
- Push-notification reminders (FCM)
- Daily challenges and advanced statistics
- Cultural discovery section (planned right after the MVP)
- Speech recognition, offline mode, web version, social features and payments

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Users can register with email and password | Critical |
| FR-02 | Users can log in, log out and reset their password | Critical |
| FR-03 | Users choose a dialect and can change it later | High |
| FR-04 | Users browse courses, modules and lessons | Critical |
| FR-05 | Lessons contain ordered steps (content and exercises) | Critical |
| FR-06 | Exercises validate answers and give immediate feedback | Critical |
| FR-07 | Progress is saved per lesson and course | High |
| FR-08 | Vocabulary can be browsed and searched in Tifinagh, Latin, French and English | High |
| FR-09 | Words have native-speaker audio | High |
| FR-10 | Tifinagh letters can be learned and recognised | High |
| FR-11 | XP, streaks and achievements reward learning | Medium |
| FR-12 | Cultural articles, proverbs and traditions can be read | Low (post-MVP) |

## 7. Non-functional requirements

- **Performance:** cold start < 3 s on mid-range Android devices; lesson screens render in < 500 ms.
- **Unicode:** Tifinagh (U+2D30–U+2D7F) renders correctly on Android 8+ and iOS 15+ using a bundled font (e.g. Noto Sans Tifinagh).
- **Security:** Firestore rules restrict each user to their own data; no secrets in the repository.
- **Accessibility:** WCAG 2.1 AA contrast, dynamic font sizes and screen-reader labels.
- **Localization:** UI available in French and English at launch; Arabic is a candidate for later.
- **Privacy:** GDPR-compliant handling of personal data, with account deletion on request.

## 8. Success metrics (MVP)

- 70% of new users complete onboarding
- 40% of users complete their first lesson on day 1
- D7 retention ≥ 20%
- Crash-free sessions ≥ 99%

## 8a. Requirement traceability

Every in-scope feature maps to at least one backlog issue. Post-MVP features are labelled `type:feature`, priority `low`, have no sprint, and stay in the board **Backlog** column.

| Requirement | Backlog issues |
|-------------|----------------|
| FR-01 Register with email/password | #54 |
| FR-02 Login, logout, password reset | #55, #56, #57 |
| FR-03 Dialect choice and change | #60 |
| FR-04 Browse courses, modules, lessons | #62, #63, #64, #65, #66 |
| FR-05 Ordered lesson steps | #65, #66, #67 |
| FR-06 Exercise validation and feedback | #69, #70, #71, #75, #76 |
| FR-07 Progress saved per lesson/course | #67, #97 |
| FR-08 Vocabulary search (Tifinagh, Latin, FR, EN) | #78, #79 |
| FR-09 Native-speaker audio for words | #86, #87, #88, #92 |
| FR-10 Tifinagh letters and recognition | #82, #83 |
| FR-11 XP, streaks, achievements | #93, #94, #95 |
| FR-12 Cultural content (post-MVP) | #100, #101, #102, #103, #104, #105 |

Post-MVP items without an epic (speech recognition, offline mode, web version, social features, payments) are tracked as low-priority backlog issues added in Sprint 1.

## 9. Assumptions and risks

| Risk | Mitigation |
|------|-----------|
| Linguistic accuracy across dialects | Validation by native speakers before content release |
| Availability of audio recordings | Early recruitment of speakers and a recording guideline |
| Tifinagh font rendering on older devices | Bundle a font and test early (Sprint 6 test plus spikes) |
| Small team capacity | Strict MVP scope and two-week sprints |

## 10. Decisions log

| Date | Decision |
|------|----------|
| 2026-11-15 | MIT license selected for source code |
| 2026-11-15 | Zustand selected as the default state manager (Redux Toolkit is the alternative if complexity grows) |
| 2026-11-15 | Two-week sprints; Sprint 1 starts 2026-11-16 |
| 2026-11-15 | ADR-001 to ADR-004 accepted (see `TECHNICAL_ARCHITECTURE.md`) |
| 2026-11-15 | Navigation route names and params typed in `src/types/navigation.ts` |
| 2026-11-15 | Post-MVP items (speech recognition, offline mode, web, social, payments) added to the backlog as low-priority issues |
