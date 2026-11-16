# Amazigh Learning App

A modern, interactive mobile application for learning **Moroccan Amazigh (Tamazight)**. It offers structured courses, interactive exercises, audio pronunciation, vocabulary practice, Tifinagh alphabet recognition and cultural discovery.

> **Status:** Planning / setup phase. No application features have been implemented yet. Work is tracked on the [Amazigh Learning – Development Board](https://github.com/users/BrahimS/projects) and in [Issues](https://github.com/BrahimS/Amazigh-Learning-App/issues).

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
| Mobile | React Native + TypeScript |
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

- Node.js 22.11+ and npm
- For Android: Android Studio (SDK 35+, platform-tools) and a JDK 17+
- For iOS (macOS only): Xcode 16+ and CocoaPods

### Setup

```bash
npm install
# iOS only (macOS):
cd ios && pod install && cd ..
```

### Run

```bash
npm start          # Metro bundler
npm run android    # Android emulator or device
npm run ios        # iOS simulator (macOS)
```

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
