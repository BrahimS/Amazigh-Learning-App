# Amazigh Learning App

A modern, interactive mobile application for learning **Moroccan Amazigh (Tamazight)**. It offers structured courses, interactive exercises, audio pronunciation, vocabulary practice, Tifinagh alphabet recognition and cultural discovery.

> **Status:** Sprint 1 foundation in review. The app shell (navigation, state, theme, components) is scaffolded; feature screens are placeholders tracked in [Issues](https://github.com/BrahimS/Amazigh-Learning-App/issues) and on the [Development Board](https://github.com/users/BrahimS/projects/17).

## Features (MVP scope)

- Structured courses, modules and lessons for the main Moroccan Amazigh varieties (Tachelhit, Central Atlas Tamazight, Tarifit)
- Interactive exercises: multiple choice, translation, word matching, sentence construction, fill in the blank and listening
- Vocabulary library with search, flashcards and spaced repetition
- Tifinagh alphabet learning and letter recognition
- Native-speaker audio pronunciation for words and sentences
- Gamification: XP, daily streaks, achievements and statistics
- A cultural discovery section covering history, traditions, proverbs and regions

## Technology stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + TypeScript (Expo SDK 58, managed workflow) |
| Navigation | React Navigation |
| State | Zustand (Redux Toolkit is the documented alternative; see `docs/TECHNICAL_ARCHITECTURE.md`) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Media | Firebase Storage |
| Notifications | Firebase Cloud Messaging |
| Design | Adobe XD |

## Repository structure

```
.
├── .github/            # Issue and pull request templates
├── design/             # Adobe XD exports and design references (no secrets)
├── docs/               # Product, technical and agile documentation
├── firebase/           # Firestore/Storage rules and indexes (added in Sprint 2+)
└── src/
    ├── assets/         # fonts, images, audio placeholders
    ├── components/     # reusable UI components
    ├── hooks/          # shared React hooks
    ├── navigation/     # React Navigation stacks and tabs
    ├── screens/        # feature screens
    ├── services/       # Firebase and data services
    ├── store/          # global state
    ├── theme/          # design tokens (colors, typography, spacing)
    ├── types/          # shared TypeScript types
    └── utils/          # helpers
```

## Documentation

| Document | Purpose |
|----------|---------|
| [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) | Vision, personas, MVP scope, requirements |
| [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) | System design and technology decisions |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Firestore collections and data model |
| [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md) | Design system and Adobe XD workflow |
| [Agile Workflow](docs/AGILE_WORKFLOW.md) | Scrum process, board, labels, Definition of Done |
| [Sprint Plan](docs/SPRINT_PLAN.md) | Sprint 1–6 goals, scope and dates |
| [Development Guidelines](docs/DEVELOPMENT_GUIDELINES.md) | Branching, commits, code style, reviews |
| [Firebase Security](docs/FIREBASE_SECURITY.md) | Security rules, secrets handling, roles |

## Getting started

### Prerequisites

- Node.js 22.13+ and npm
- For Android: Android Studio (SDK 35+, platform-tools) and a JDK 17+
- For iOS: a Mac with Xcode 16+ (or EAS Build for cloud builds)

### Setup

```bash
npm install
```

This is an [Expo](https://expo.dev) managed-workflow app: the `android/` and `ios/`
native projects are generated on demand by `expo prebuild` (run automatically by
`expo run:android` / `expo run:ios`). Never commit them.

### Run

**Recommended — one command:**

```bash
npm run dev:android   # Android emulator/device
npm run dev:ios       # iOS simulator (macOS only)
```

`dev:*` starts the Firebase emulators (Firestore + Auth) if they are not already
running, seeds the sample curriculum, then builds the dev client, installs it and
starts Metro. Already-running emulators are reused and left alone; emulators
started by the script stop when you quit (Ctrl+C).

**Manual:**

```bash
npm start          # Expo dev server (use with a dev build, see below)
npm run android    # build + install the Android dev client on a connected device/emulator
npm run ios        # same for iOS (macOS only)
npm run start:go   # Expo Go (limited: no custom native config yet)
```

For hot-reload development, run `npm start` after `expo run:android` has installed the dev client.
If port 8081 is busy, Expo offers another port — if the app cannot connect, open
the dev menu and enter the URL Metro shows.

### Firebase emulators in development

Development builds talk to the local Firebase emulators **by default** — no
configuration needed. The app picks the right address per platform:

- Android emulator → `10.0.2.2` (the host machine)
- iOS simulator / web → `localhost`

To override (e.g. a **physical device**, which needs your machine's LAN IP), set
`EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST` / `EXPO_PUBLIC_AUTH_EMULATOR_HOST` in
`.env.development` (or `.env.development.local`). To bypass the emulators in a
development build, set `EXPO_PUBLIC_USE_EMULATORS=false`. Staging and production
builds always use real Firebase.

Standalone emulator helpers (the `dev:*` scripts wrap these):

```bash
npm run test:emulator   # Firestore rules tests against the emulators
npm run seed:emulator   # (re)seed sample curriculum data
```

### Environments

Expo inlines `EXPO_PUBLIC_*` variables into the JS bundle at build time, loaded from
`.env.development` / `.env.staging` / `.env.production` (see `.env.example`). Only
**non-secret** values belong there — Firebase config files stay out of git.

```bash
npm run android:dev       # EXPO_PUBLIC_APP_ENV=development
npm run android:staging   # EXPO_PUBLIC_APP_ENV=staging
npm run android:prod      # EXPO_PUBLIC_APP_ENV=production
# same for ios:dev / ios:staging / ios:prod
```

The `*:dev` / `*:staging` / `*:prod` scripts source the matching `.env.*` file before
building, so every `EXPO_PUBLIC_*` value is picked up. See `docs/FIREBASE_SECURITY.md`
for Firebase project setup.

### Checks

```bash
npm run typecheck  # TypeScript strict mode
npm run lint       # ESLint
npm test           # Jest
npm run format     # Prettier
```

Aliases: import from `src/` as `@/…` (e.g. `@/components/WelcomeCard`), configured in `babel.config.js`, `tsconfig.json` and `jest.config.js`.

Firebase configuration files (`google-services.json`, `GoogleService-Info.plist`) are **never committed**; see [Firebase Security](docs/FIREBASE_SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE). Linguistic content and audio recordings provided by contributors may be covered by separate licensing terms, which will be documented with the content.
