# UX/UI design artboards

Design boards for the Amazigh Learning App, built from
[`docs/UI_UX_GUIDELINES.md`](../docs/UI_UX_GUIDELINES.md). They mirror the app
tokens in [`src/theme`](../src/theme), so they can be reviewed before code and
used as the developer handoff.

Adobe XD is not scriptable and is not available on Linux, so the boards are
generated as SVG instead: each artboard is a single SVG that **Adobe XD imports
via File → Import** (shapes and text stay editable), and `overview.html` is a
self-contained review page with the same screens.

## Layout

| Path                                      | Contents                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `xd/1-design-system/`                     | Colour, type, spacing, radius, button/input/card states, feedback banners, icons                          |
| `xd/2-onboarding-and-auth/<device>/`      | Splash, onboarding, welcome, register, login (+error), forgot password, dialect, preferences              |
| `xd/3-learning/<device>/`                 | Dashboard (+loading), course, module, lesson, six exercise types (+ MCQ states), lesson complete, culture |
| `xd/4-vocabulary-and-tifinagh/<device>/`  | Library (+empty), word details, flashcards, alphabet, letter details, letter quiz                         |
| `xd/5-profile-and-gamification/<device>/` | Profile, settings, achievements, statistics, daily-goal celebration                                       |
| `tokens.json`                             | The token values used by the generator                                                                    |
| `generate-artboards.mjs`                  | The generator (Node, no dependencies beyond the repo)                                                     |

Each screen exists at two sizes: `ios/` (iPhone 14, 390×844) and
`android/` (Android medium, 360×800).

Note: `Culture` has no document of its own in the guidelines, so it sits in
`3-learning`.

## Regenerate

```bash
node design/generate-artboards.mjs           # SVG artboards + tokens.json
node design/generate-artboards.mjs --overview # also writes overview.html
```

`overview.html` is gitignored because it embeds the fonts; open it in a
browser to review all boards, or open any `.svg` directly.

## Content rules

- Sample words come from `content/vocabulary/*.csv` and the emulator seed; they
  are **unvalidated** and marked "Pending native-speaker review" (#85). No
  linguistic material is invented.
- Names, e-mail addresses, XP and streak values in Profile, Statistics,
  Achievements and Celebration screens are fictional placeholders.
- Audio is shown as a player control only; playback is not implemented.
