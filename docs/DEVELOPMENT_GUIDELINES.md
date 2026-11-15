# Development Guidelines

## Branching model

| Branch | Purpose | Merges into |
|--------|---------|-------------|
| `main` | Production-ready code, tagged releases | n/a |
| `develop` | Integration branch | `main` via release PR |
| `feature/<issue>-<slug>` | New functionality | `develop` |
| `bugfix/<issue>-<slug>` | Non-critical fixes | `develop` |
| `hotfix/<issue>-<slug>` | Critical production fixes (from `main`) | `main` and `develop` |
| `release/<version>` (optional) | Release stabilisation | `main` and `develop` |

## Recommended branch protection

Apply these in **Settings → Branches / Rulesets** once more contributors join. With a single maintainer, requiring approvals would block merges.

**`main`**
- Require a pull request before merging (1 approval once the team is larger than one person)
- Require status checks to pass: `lint`, `typecheck`, `test`
- Require linear history (squash or rebase merges)
- Block force pushes and deletions
- Restrict who can push (maintainers only)

**`develop`**
- Require a pull request before merging
- Require status checks to pass
- Block force pushes

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary (#issue)`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`.

## Pull requests

- Use the PR template. Link the issue with `Closes #N`.
- Keep PRs small (< 400 changed lines when possible).
- Include screenshots for UI changes, on Android and iOS.
- Squash-merge into `develop`.

## Code style

- TypeScript `strict` mode. Avoid `any`.
- ESLint (`@react-native` config) and Prettier. Husky + lint-staged run them on commit.
- Functional components and hooks. One component per file, named exports.
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities and hooks (`useSomething.ts`).
- Screens do not call Firebase directly; use `src/services`.
- All user-facing strings go through i18n. Amazigh content comes from data, not hard-coded strings.
- Tifinagh text must use the bundled Tifinagh font through the `AmazighText` component.

## Testing

- Unit tests for utilities, stores and services (Jest).
- Component tests with React Native Testing Library.
- Firestore rules tests with the Firebase Emulator Suite (`@firebase/rules-unit-testing`).
- E2E smoke tests (Detox or Maestro) before each release.

## CI (GitHub Actions)

Every PR runs: install → lint → type check → unit tests. Releases also build the Android and iOS artifacts.

## Releases

Semantic versioning (`MAJOR.MINOR.PATCH`). Tag `vX.Y.Z` on `main` and keep a `CHANGELOG.md`.
