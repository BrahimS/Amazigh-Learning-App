# Contributing to Amazigh Learning App

Thank you for helping build a learning tool for the Amazigh language. This guide explains how work moves from idea to `main`.

## Ways to contribute

- **Code**: pick an issue in the *Ready* column of the project board.
- **Linguistic content**: vocabulary, translations, example sentences and recordings. All content is validated by native speakers before release; label such issues `linguistic-content`.
- **Design**: Adobe XD work tracked under the UI/UX epic.
- **Bug reports and ideas**: open an issue using one of the templates.

## Workflow

1. Make sure an issue exists and is assigned to you. Move it to **In Progress**.
2. Branch from `develop`:
   - `feature/<issue-number>-short-name`
   - `bugfix/<issue-number>-short-name`
   - `hotfix/<issue-number>-short-name` (branch from `main`; merge back into `main` and `develop`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat(auth): add password reset (#42)`.
4. Open a pull request into `develop` using the PR template and link the issue (`Closes #42`). Move the issue to **In Review**.
5. When the PR is approved and CI is green, squash-merge it. The issue moves to **Testing**, then to **Done** once its acceptance criteria are verified.

See [docs/DEVELOPMENT_GUIDELINES.md](docs/DEVELOPMENT_GUIDELINES.md) and [docs/AGILE_WORKFLOW.md](docs/AGILE_WORKFLOW.md) for details.

## Definition of Done

- All acceptance criteria are met and verified
- Code is reviewed and merged into `develop`
- Tests are added or updated and passing
- Tifinagh and Latin-script text renders correctly where relevant
- Documentation is updated
- No secrets, credentials or Firebase config files are committed

## Secrets

Never commit Firebase credentials, `google-services.json`, `GoogleService-Info.plist`, service-account keys, `.env` files or API keys. See [docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md).

## Code of Conduct

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
