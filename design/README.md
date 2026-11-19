# UX/UI design artboards

Design boards for the Amazigh Learning App, built from
[`docs/UI_UX_GUIDELINES.md`](../docs/UI_UX_GUIDELINES.md). They mirror the app
tokens in [`src/theme`](../src/theme), so they can be reviewed before code and
used as the developer handoff.

The boards are generated as SVG: each artboard is a single SVG that **Adobe XD
imports via File → Import** (shapes and text stay editable), and `overview.html`
is a self-contained review page with the same screens.

[`Amazigh-Learning-Prototype.xd`](Amazigh-Learning-Prototype.xd) is the Adobe XD
document built from those SVGs. It holds two variants to compare, as native,
named XD layers (iOS size only):

| Variant | Palette                                                                              | Latin font | Row         |
| ------- | ------------------------------------------------------------------------------------ | ---------- | ----------- |
| A       | Current app (`src/theme`): saffron `#B45309`, Atlas blue `#1D4ED8`, argan `#15803D`  | Poppins    | `A / …` top |
| B       | Master prompt: forest `#176B55`, terracotta `#D66B3D`, ochre `#E8B94F`, sand, indigo | Inter      | `B / …`     |

**Variant B is approved** (2026-11-19) and is the app theme in `src/theme`. The
`B / …` artboards in the `.xd` include the product owner's edits (motif marks
removed on 11 screens, spacing tweaks), which are not in the generated SVGs:
the `.xd` is the source of truth.

Both variants are wired as a clickable prototype (Prototype mode → Play),
starting at `B / … 01-splash`. Install Poppins, Inter and Noto Sans Tifinagh before opening it.

## Layout

| Path                                      | Contents                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `xd/1-design-system/`                     | Colour, type, spacing, radius, button/input/card states, feedback banners, icons                          |
| `xd/2-onboarding-and-auth/<device>/`      | Splash, onboarding, welcome, register, login (+error), forgot password, dialect, preferences              |
| `xd/3-learning/<device>/`                 | Dashboard (+loading), course, module, lesson, six exercise types (+ MCQ states), lesson complete, culture |
| `xd/4-vocabulary-and-tifinagh/<device>/`  | Library (+empty), word details, flashcards, alphabet, letter details, letter quiz                         |
| `xd/5-profile-and-gamification/<device>/` | Profile, settings, achievements, statistics, daily-goal celebration                                       |
| `xd-variant-b/`                           | The same boards with the master-prompt palette and Inter                                                  |
| `xd-plugin/`                              | XD plugin and scripts that build `Amazigh-Learning-Prototype.xd`                                          |
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

### Rebuild the XD document (macOS + Adobe XD)

```bash
DESIGN_VARIANT=B node design/generate-artboards.mjs  # variant B SVGs
cd design/xd-plugin && npm install && npm run data   # SVG → plugin/data.js
```

1. Copy `design/xd-plugin/plugin/` to
   `~/Library/Application Support/Adobe/Adobe XD/develop/amazigh-learning-ui/`,
   then in XD use Plugins → Development → Reload Plugins.
2. In an open document run Plugins → Amazigh Learning UI → **Build variant A**,
   then **Build variant B** (about 10 s each) and save.
3. XD plugins cannot create prototype links, so add them to the saved file:
   `python3 design/xd-plugin/add-prototype-links.py saved.xd design/xd-plugin/plugin/flows.json design/Amazigh-Learning-Prototype.xd`.
   The links are listed in `plugin/flows.json` (source board, layer name,
   target board; tab-bar links are added to every board).

`overview.html` is gitignored because it embeds the fonts; open it in a
browser to review all boards, or open any `.svg` directly.

## Content rules

- Sample words come from `content/vocabulary/*.csv` and the emulator seed; they
  are **unvalidated** and marked "Pending native-speaker review" (#85). No
  linguistic material is invented.
- Names, e-mail addresses, XP and streak values in Profile, Statistics,
  Achievements and Celebration screens are fictional placeholders.
- Audio is shown as a player control only; playback is not implemented.
