# Database Schema (Cloud Firestore)

Initial schema. It is refined in the issue "Define Firestore collections" (Sprint 1).

## Conventions

- Collection names: camelCase plural. Document IDs: auto-IDs unless noted.
- Timestamps: Firestore `Timestamp`, fields `createdAt` and `updatedAt`.
- Localised text: map keyed by locale, e.g. `{ fr: "Bonjour", en: "Hello" }`.
- Amazigh text: `{ tifinagh: "ⴰⵣⵓⵍ", latin: "azul" }`.
- `dialect` values: `tachelhit` | `tamazight` | `tarifit` | `standard`.

## Collections

### `users/{uid}`
| Field | Type | Notes |
|-------|------|-------|
| displayName | string | |
| email | string | |
| photoURL | string? | |
| role | `learner` \| `contributor` \| `admin` | Set only by admins (custom claims mirror) |
| dialect | string | Selected dialect |
| uiLanguage | `fr` \| `en` | |
| learningGoal | string | e.g. `travel`, `family`, `school` |
| dailyGoalMinutes | number | |
| xp | number | |
| currentStreak / longestStreak | number | |
| lastActiveDate | string (YYYY-MM-DD) | Streak calculation |
| createdAt / updatedAt | timestamp | |

Sub-collections:
- `users/{uid}/progress/{courseId}`: `{ completedLessons: string[], currentLessonId, percent, updatedAt }`
- `users/{uid}/lessonResults/{lessonId}`: `{ score, maxScore, attempts, completedAt }`
- `users/{uid}/achievements/{achievementId}`: `{ unlockedAt }`
- `users/{uid}/vocabulary/{wordId}`: spaced-repetition state `{ ease, interval, dueAt, reviews }` (post-MVP)

### `courses/{courseId}`
`{ title: LocalizedText, description: LocalizedText, dialect, level: 'A1'|'A2'|'B1', order, imageUrl, published: boolean, moduleCount }`

### `courses/{courseId}/modules/{moduleId}`
`{ title: LocalizedText, order, lessonCount }`

### `courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`
`{ title: LocalizedText, order, estimatedMinutes, xpReward, steps: LessonStep[] }`

`LessonStep` is either `{ type: 'content', ... }` or `{ type: 'exercise', exerciseId }`.

### `exercises/{exerciseId}`
| Field | Type | Notes |
|-------|------|-------|
| type | `mcq` \| `translation` \| `matching` \| `sentence` \| `fillBlank` \| `listening` | |
| prompt | LocalizedText / AmazighText | |
| options | array | For MCQ and matching |
| answer | any | Correct answer(s); accepted variants |
| audioPath | string? | Storage path |
| dialect | string | |

### `vocabulary/{wordId}`
`{ text: AmazighText, translations: LocalizedText, dialect, partOfSpeech, category, examples: [{ text: AmazighText, translations }], audioPath, validated: boolean, validatedBy }`

### `tifinaghLetters/{letterId}`
`{ glyph: "ⴰ", unicode: "U+2D30", name: "ya", latin: "a", ipa, audioPath, order, examples: wordId[] }`

### `achievements/{achievementId}`
`{ title: LocalizedText, description: LocalizedText, icon, criteria: { type: 'xp'|'streak'|'lessons', threshold } }`

### `culture/{articleId}` (post-MVP)
`{ category: 'history'|'traditions'|'proverbs'|'regions', title, body, images, region, published }`

## Storage layout

```
audio/words/{dialect}/{wordId}.m4a
audio/sentences/{dialect}/{sentenceId}.m4a
audio/letters/{letterId}.m4a
images/courses/{courseId}.webp
images/culture/{articleId}/{n}.webp
users/{uid}/avatar.jpg
```

## Indexes (initial)

- `courses`: `dialect ASC, order ASC` where `published == true`
- `vocabulary`: `dialect ASC, category ASC`
