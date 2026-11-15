# UI/UX Guidelines

Design is produced in **Adobe XD** and handed off to development as design tokens and component specs.

## Principles

1. **Learn by doing**: short, interactive steps with immediate feedback.
2. **Script-first**: Tifinagh is always visible; Latin transcription is a toggle.
3. **Cultural authenticity**: colors and motifs inspired by Amazigh art (rugs, jewellery, the ⵣ symbol), used respectfully.
4. **Accessible by default**: WCAG 2.1 AA contrast, 44×44 pt touch targets, screen-reader labels.
5. **Motivating, not noisy**: subtle celebrations for XP, streaks and achievements.

## Design tokens (initial proposal, finalised in "Create color palette and typography")

| Token | Proposal |
|-------|---------|
| `color.primary` | Saffron / ochre (Amazigh flag yellow) |
| `color.secondary` | Atlas blue (flag blue) |
| `color.accent` | Argan green (flag green) |
| `color.danger` | Red (flag ⵣ red) |
| `color.background` | Warm off-white |
| `font.latin` | Inter / Poppins |
| `font.tifinagh` | Noto Sans Tifinagh |
| `spacing` | 4-pt scale (4, 8, 12, 16, 24, 32) |
| `radius` | 8 / 16 / 24 |

## Adobe XD organisation

- One XD document per area: `Design System`, `Onboarding & Auth`, `Learning`, `Vocabulary & Tifinagh`, `Profile & Gamification`.
- Use **components with states** (default, pressed, disabled, correct, incorrect).
- Artboards: iPhone 14 (390×844) and Android medium (360×800).
- Share links for review and developer handoff are added to the relevant issue. Exports go in `/design`. Do not commit large binaries unless they are needed.

## Screen inventory

Splash · Onboarding (3 slides) · Register · Login · Forgot password · Dialect selection · Learning preferences · Dashboard · Course details · Module · Lesson · Exercise types (MCQ, translation, matching, sentence, fill-blank, listening) · Lesson complete · Vocabulary library · Word details · Flashcards · Tifinagh alphabet · Letter details · Letter quiz · Culture home · Article · Profile · Settings · Achievements · Statistics.

## Feedback patterns

- Correct answer: green highlight, short sound, +XP chip.
- Incorrect answer: red highlight, show the correct answer, "Continue" button.
- Loading: skeletons, no spinners on full screens.
- Empty states: illustration plus a call to action.

## Review process

Each design issue moves to **In Review** with an XD share link. It is **Done** when the Product Owner approves it and the developer handoff specs are available.
