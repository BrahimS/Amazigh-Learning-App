#!/usr/bin/env node
/**
 * Generates the UX/UI design artboards from docs/UI_UX_GUIDELINES.md as SVG
 * files that import into Adobe XD (File → Import), grouped into the five XD
 * documents named in the guidelines. Tokens mirror src/theme.
 *
 *   node design/generate-artboards.mjs            # SVG artboards + tokens.json
 *   node design/generate-artboards.mjs --overview # also writes overview.html
 *   DESIGN_VARIANT=B node design/generate-artboards.mjs # master-prompt palette + Inter → xd-variant-b/
 *
 * Sample words come from content/vocabulary/*.csv and the emulator seed; they
 * are unvalidated (#85). Nothing linguistic is invented here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { latinToTifinagh as tif } from '../scripts/lib/tifinagh.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const VARIANT_B = process.env.DESIGN_VARIANT === 'B';
const OUT = path.join(ROOT, VARIANT_B ? 'xd-variant-b' : 'xd');

// ─── Tokens (mirror src/theme) ──────────────────────────────────────────────
const C = {
  primary: '#B45309',
  primaryPressed: '#92400E',
  primaryLight: '#F59E0B',
  primaryTint: '#FEF3C7',
  secondary: '#1D4ED8',
  secondaryLight: '#93C5FD',
  secondaryTint: '#DBEAFE',
  accent: '#15803D',
  accentLight: '#86EFAC',
  accentTint: '#DCFCE7',
  danger: '#B91C1C',
  dangerLight: '#FCA5A5',
  dangerTint: '#FEE2E2',
  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E7E5E4',
  skeleton: '#EFEBE6',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textInverse: '#FFFFFF',
};
// Variant B: master-prompt palette (forest green, terracotta, ochre, sand, indigo).
if (VARIANT_B) {
  Object.assign(C, {
    primary: '#176B55',
    primaryPressed: '#0F4F3F',
    primaryLight: '#E8B94F',
    primaryTint: '#DDEEE7',
    secondary: '#D66B3D',
    secondaryLight: '#EBA88A',
    secondaryTint: '#F8E1D6',
    accent: '#176B55',
    accentLight: '#8CC7B5',
    accentTint: '#DDEEE7',
    background: '#F6F0E5',
    border: '#E6DCCB',
    skeleton: '#ECE3D3',
    textPrimary: '#273447',
    textSecondary: '#5B6577',
  });
}
const FONT_SIZE = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 };
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
const RADIUS = { sm: 8, md: 16, lg: 24 };
const FAMILY = {
  latin: VARIANT_B ? 'Inter, sans-serif' : 'Poppins, sans-serif',
  tif: "'Noto Sans Tifinagh', sans-serif",
};

const DEVICES = {
  ios: {
    label: 'iPhone 14',
    W: 390,
    H: 844,
    P: SPACING.xl,
    top: 47,
    bottom: 34,
  },
  android: {
    label: 'Android medium',
    W: 360,
    H: 800,
    P: SPACING.lg,
    top: 28,
    bottom: 16,
  },
};

// ─── SVG primitives ─────────────────────────────────────────────────────────
const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const attrs = o =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

const g = (id, ...children) =>
  `<g${id ? attrs({ id }) : ''}>${children.flat().join('')}</g>`;

function rect(x, y, w, h, o = {}) {
  return `<rect${attrs({
    x,
    y,
    width: w,
    height: h,
    rx: o.r ?? 0,
    fill: o.fill ?? 'none',
    stroke: o.stroke,
    'stroke-width': o.stroke ? o.sw ?? 1 : undefined,
    'stroke-dasharray': o.dash,
    opacity: o.opacity,
  })}/>`;
}

const circle = (cx, cy, r, o = {}) =>
  `<circle${attrs({
    cx,
    cy,
    r,
    fill: o.fill ?? 'none',
    stroke: o.stroke,
    'stroke-width': o.stroke ? o.sw ?? 1 : undefined,
    opacity: o.opacity,
  })}/>`;

function text(x, y, s, o = {}) {
  const {
    size = FONT_SIZE.md,
    weight = 400,
    fill = C.textPrimary,
    font = 'latin',
    anchor = 'start',
    opacity,
  } = o;
  return `<text${attrs({
    x,
    y,
    'font-family': FAMILY[font],
    'font-size': size,
    'font-weight': weight,
    fill,
    'text-anchor': anchor,
    opacity,
  })}>${esc(s)}</text>`;
}

/** Approximate rendered width, used only for layout (chips, centring). */
const tw = (s, size, weight = 400) =>
  [...String(s)].length * size * (weight >= 600 ? 0.62 : 0.57);

function wrap(s, size, maxW) {
  const words = s.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (tw(next, size) > maxW && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wrapped paragraph; returns { svg, height }. */
function para(x, y, s, o = {}) {
  const size = o.size ?? FONT_SIZE.md;
  const lh = Math.round(size * 1.5);
  const lines = wrap(s, size, o.maxW ?? 300);
  const svg = lines
    .map((l, i) =>
      text(x, y + i * lh, l, { ...o, size, anchor: o.anchor ?? 'start' }),
    )
    .join('');
  return { svg, height: lines.length * lh };
}

// ─── Icons (24-unit stroke icons, Ionicons-like outlines) ────────────────────
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  flame:
    '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-8.5z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  speaker:
    '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5M20 18v3H6.5"/>',
  cards:
    '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M7 3.5h11a2 2 0 0 1 2 2V17"/>',
  culture:
    '<path d="M3 21h18M5 21V10M19 21V10M9.5 21v-6h5v6M2 10l10-6.5L22 10z"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  trophy:
    '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3.5 3.5 0 0 0 4 4.5M16 6h3.5a3.5 3.5 0 0 1-4 4.5M12 13v4M8 21h8M9 17h6v4H9z"/>',
  chart: '<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>',
  settings:
    '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  logout: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  sparkles:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  construct:
    '<path d="M14.5 5.5a4 4 0 0 0 5 5L11 19a2.1 2.1 0 0 1-3-3l8.5-8.5"/>',
};

function icon(name, x, y, size = 24, color = C.textPrimary, o = {}) {
  const s = size / 24;
  const filled = o.filled;
  return `<g${attrs({
    id: o.id ?? `icon/${name}`,
    transform: `translate(${x} ${y}) scale(${s})`,
    fill: filled ? color : 'none',
    stroke: filled ? 'none' : color,
    'stroke-width': o.sw ?? 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })}>${ICONS[name]}</g>`;
}

/** Diamond band inspired by Amazigh rug motifs (decorative, used sparingly). */
function motif(x, y, w, color = C.primary, size = 12, opacity = 1) {
  const n = Math.floor(w / (size * 2));
  const off = x + (w - n * size * 2) / 2;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = off + size + i * size * 2;
    d += `M${cx} ${y}l${size} ${size}-${size} ${size}-${size}-${size}z`;
    d += `M${cx} ${y + size * 0.55}l${size * 0.45} ${size * 0.45}-${
      size * 0.45
    } ${size * 0.45}-${size * 0.45}-${size * 0.45}z`;
  }
  return `<path${attrs({
    id: 'motif/diamond-band',
    d,
    fill: color,
    'fill-rule': 'evenodd',
    opacity,
  })}/>`;
}

// ─── Components (with states) ───────────────────────────────────────────────
function button(x, y, w, label, o = {}) {
  const variant = o.variant ?? 'primary';
  const state = o.state ?? 'default';
  const h = o.size === 'md' ? 44 : 52;
  const disabled = state === 'disabled';
  const bg = disabled
    ? C.border
    : {
        primary: state === 'pressed' ? C.primaryPressed : C.primary,
        secondary: C.secondary,
        success: C.accent,
        danger: C.danger,
        outline: 'none',
        ghost: 'none',
      }[variant];
  const fg = disabled
    ? C.textSecondary
    : variant === 'outline' || variant === 'ghost'
    ? o.color ?? C.primary
    : C.textInverse;
  const stroke =
    variant === 'outline' && !disabled ? o.color ?? C.primary : undefined;
  const size = o.size === 'md' ? FONT_SIZE.md : FONT_SIZE.lg;
  const iconW = o.icon ? 28 : 0;
  const cx = x + w / 2 + iconW / 2;
  return g(
    `Button / ${variant} / ${state}`,
    rect(x, y, w, h, { r: RADIUS.md, fill: bg, stroke, sw: 2 }),
    o.icon
      ? icon(o.icon, cx - tw(label, size, 600) / 2 - 30, y + h / 2 - 11, 22, fg)
      : '',
    text(cx, y + h / 2 + size * 0.36, label, {
      size,
      weight: 600,
      fill: fg,
      anchor: 'middle',
    }),
  );
}

function textInput(x, y, w, label, o = {}) {
  const state = o.state ?? 'default';
  const border =
    state === 'error'
      ? C.danger
      : state === 'focused'
      ? C.secondary
      : state === 'success'
      ? C.accent
      : C.border;
  const hasValue = o.value !== undefined;
  const parts = [
    text(x, y + 14, label, {
      size: FONT_SIZE.sm,
      weight: 500,
      fill: C.textPrimary,
    }),
    rect(x, y + 24, w, 48, {
      r: RADIUS.md,
      fill: state === 'disabled' ? C.background : C.surface,
      stroke: border,
      sw: state === 'focused' || state === 'error' ? 2 : 1,
    }),
    text(x + SPACING.lg, y + 54, hasValue ? o.value : o.placeholder ?? '', {
      size: FONT_SIZE.md,
      fill: hasValue ? C.textPrimary : C.textSecondary,
      font: o.tifValue ? 'tif' : 'latin',
    }),
  ];
  if (state === 'focused' && hasValue) {
    const cx = x + SPACING.lg + tw(o.value, FONT_SIZE.md) + 2;
    parts.push(rect(cx, y + 38, 2, 20, { fill: C.secondary }));
  }
  if (o.trailing)
    parts.push(icon(o.trailing, x + w - 40, y + 36, 22, C.textSecondary));
  let h = 72;
  if (o.helper || state === 'error') {
    parts.push(
      text(x, y + 92, o.helper ?? '', {
        size: FONT_SIZE.xs,
        fill: state === 'error' ? C.danger : C.textSecondary,
      }),
    );
    h = 96;
  }
  return { svg: g(`TextInput / ${state}`, parts), height: h };
}

function card(x, y, w, h, o = {}) {
  const state = o.state ?? 'default';
  const map = {
    default: [C.surface, C.border, 1],
    selected: [C.secondaryTint, C.secondary, 2],
    correct: [C.accentTint, C.accent, 2],
    incorrect: [C.dangerTint, C.danger, 2],
    locked: [C.background, C.border, 1],
    pressed: [C.background, C.border, 1],
  };
  const [fill, stroke, sw] = map[state];
  return rect(x, y, w, h, { r: o.r ?? RADIUS.md, fill, stroke, sw });
}

/** Returns { svg, width }. */
function chip(x, y, label, o = {}) {
  const size = o.size ?? FONT_SIZE.sm;
  const iconW = o.icon ? 22 : 0;
  const w = Math.round(tw(label, size, 500) + SPACING.lg * 2 + iconW);
  const h = o.h ?? 36;
  const sel = o.selected;
  const fill = o.fill ?? (sel ? C.primary : C.surface);
  const fg = o.fg ?? (sel ? C.textInverse : C.textPrimary);
  const stroke = o.stroke ?? (sel ? undefined : C.border);
  return {
    width: w,
    svg: g(
      `Chip / ${label}${sel ? ' / selected' : ''}`,
      rect(x, y, w, h, { r: h / 2, fill, stroke }),
      o.icon ? icon(o.icon, x + SPACING.md, y + h / 2 - 9, 18, fg) : '',
      text(
        x + SPACING.lg + iconW - (o.icon ? 4 : 0),
        y + h / 2 + size * 0.36,
        label,
        {
          size,
          weight: 500,
          fill: fg,
          font: o.font ?? 'latin',
        },
      ),
    ),
  };
}

function chipRow(x, y, labels, o = {}) {
  let cx = x;
  const out = [];
  labels.forEach((l, i) => {
    const c = chip(cx, y, l, { ...o, selected: o.selectedIndex === i });
    out.push(c.svg);
    cx += c.width + SPACING.sm;
  });
  return out.join('');
}

function badge(x, y, label, tone = 'primary') {
  const tones = {
    primary: [C.primaryTint, C.primaryPressed],
    accent: [C.accentTint, C.accent],
    secondary: [C.secondaryTint, C.secondary],
    danger: [C.dangerTint, C.danger],
    neutral: [C.background, C.textSecondary],
  };
  const [bg, fg] = tones[tone];
  const w = tw(label, FONT_SIZE.xs, 600) + SPACING.md * 2;
  return {
    width: w,
    svg: g(
      `Badge / ${label}`,
      rect(x, y, w, 24, { r: 12, fill: bg }),
      text(x + SPACING.md, y + 16, label, {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: fg,
      }),
    ),
  };
}

function progressBar(x, y, w, value, color = C.accent, h = 8) {
  return g(
    'ProgressBar',
    rect(x, y, w, h, { r: h / 2, fill: C.border }),
    value > 0
      ? rect(x, y, Math.max(h, w * value), h, { r: h / 2, fill: color })
      : '',
  );
}

function toggle(x, y, on) {
  return g(
    `Switch / ${on ? 'on' : 'off'}`,
    rect(x, y, 52, 32, { r: 16, fill: on ? C.accent : C.border }),
    circle(on ? x + 36 : x + 16, y + 16, 12, { fill: C.surface }),
  );
}

function skeleton(x, y, w, h, r = RADIUS.sm) {
  return rect(x, y, w, h, { r, fill: C.skeleton });
}

/** Tifinagh-first word: glyphs above Latin transcription. */
function amazighWord(x, y, latin, o = {}) {
  const size = o.size ?? FONT_SIZE.xl;
  const anchor = o.anchor ?? 'start';
  return g(
    `AmazighText / ${latin}`,
    text(x, y, tif(latin), {
      size,
      font: 'tif',
      fill: o.fill ?? C.textPrimary,
      anchor,
    }),
    o.latin === false
      ? ''
      : text(x, y + Math.round(size * 0.55) + FONT_SIZE.sm + 4, latin, {
          size: o.latinSize ?? FONT_SIZE.sm,
          fill: o.latinFill ?? C.textSecondary,
          anchor,
          weight: 500,
        }),
  );
}

function feedbackBanner(ctx, correct, o = {}) {
  const { W, H, P, bottom } = ctx;
  const h = correct ? 168 : 196;
  const y = H - bottom - h;
  const tone = correct ? C.accent : C.danger;
  const parts = [
    rect(0, y, W, h + bottom, { fill: correct ? C.accentTint : C.dangerTint }),
    circle(P + 18, y + 34, 18, { fill: tone }),
    icon(correct ? 'check' : 'close', P + 7, y + 23, 22, C.textInverse, {
      sw: 3,
    }),
    text(P + 46, y + 41, correct ? 'Correct!' : 'Not quite', {
      size: FONT_SIZE.xl,
      weight: 600,
      fill: tone,
    }),
  ];
  if (correct) {
    const c = chip(W - P - 90, y + 18, `+${o.xp ?? 10} XP`, {
      fill: C.primary,
      fg: C.textInverse,
      icon: 'star',
    });
    parts.push(c.svg);
  } else {
    parts.push(
      text(P, y + 78, 'Correct answer', {
        size: FONT_SIZE.sm,
        weight: 500,
        fill: C.danger,
      }),
      text(P, y + 106, tif(o.answer), {
        size: FONT_SIZE.lg,
        font: 'tif',
        fill: C.textPrimary,
      }),
      text(P + tw(tif(o.answer), FONT_SIZE.lg) + 16, y + 106, o.answer, {
        size: FONT_SIZE.md,
        weight: 600,
        fill: C.textPrimary,
      }),
    );
  }
  parts.push(
    button(P, y + h - 52 - SPACING.lg, W - P * 2, 'Continue', {
      variant: correct ? 'success' : 'danger',
    }),
  );
  return g(`FeedbackBanner / ${correct ? 'correct' : 'incorrect'}`, parts);
}

function statusBar(ctx, dark = false) {
  const { W, top, P } = ctx;
  const fg = dark ? C.textInverse : C.textPrimary;
  const y = Math.round(top * 0.62);
  return g(
    'StatusBar',
    text(ctx.device === 'ios' ? P + 8 : P, y + 5, '9:41', {
      size: ctx.device === 'ios' ? 16 : 14,
      weight: 600,
      fill: fg,
    }),
    rect(W - P - 26, y - 6, 24, 12, { r: 3, stroke: fg, sw: 1.5 }),
    rect(W - P - 24, y - 4, 17, 8, { r: 1.5, fill: fg }),
    [0, 1, 2, 3].map(i =>
      rect(W - P - 52 + i * 5, y + 3 - i * 3, 3, 4 + i * 3, { r: 1, fill: fg }),
    ),
  );
}

/** Screen header (back + title + optional right action). Returns { svg, bottom }. */
function header(ctx, title, o = {}) {
  const { W, P, top } = ctx;
  const y = top + SPACING.sm;
  const parts = [];
  let tx = P;
  if (o.back !== false) {
    parts.push(
      rect(P - 10, y, 44, 44, { r: 22, fill: 'none' }),
      icon(o.close ? 'close' : 'back', P, y + 10, 24, C.textPrimary),
    );
    tx = P + 44;
  }
  if (o.large) {
    parts.push(
      text(P, y + 34 + (o.back === false ? 0 : 52), title, {
        size: FONT_SIZE.xxl,
        weight: 700,
      }),
    );
  } else if (title) {
    parts.push(text(tx, y + 29, title, { size: FONT_SIZE.lg, weight: 600 }));
  }
  if (o.right) parts.push(o.right(W - P, y));
  const bottom = o.large ? y + (o.back === false ? 56 : 108) : y + 56;
  return { svg: g('Header', parts), bottom };
}

const TABS = [
  ['Learn', 'book'],
  ['Vocabulary', 'cards'],
  ['Tifinagh', null],
  ['Culture', 'culture'],
  ['Profile', 'person'],
];

function tabBar(ctx, active) {
  const { W, H, bottom } = ctx;
  const h = 64;
  const y = H - bottom - h;
  const cw = W / TABS.length;
  return g(
    'TabBar',
    rect(0, y, W, h + bottom, { fill: C.surface }),
    rect(0, y, W, 1, { fill: C.border }),
    TABS.map(([label, ic], i) => {
      const on = label === active;
      const color = on ? C.primary : C.textSecondary;
      const cx = cw * i + cw / 2;
      return g(
        `Tab / ${label}${on ? ' / active' : ''}`,
        ic
          ? icon(ic, cx - 12, y + 10, 24, color)
          : text(cx, y + 31, 'ⵣ', {
              size: 24,
              font: 'tif',
              fill: color,
              anchor: 'middle',
            }),
        text(cx, y + 52, label, {
          size: 11,
          weight: on ? 600 : 500,
          fill: color,
          anchor: 'middle',
        }),
      );
    }),
  );
}

function emptyState(ctx, y, title, body, cta, iconName = 'search') {
  const { W, P } = ctx;
  const cx = W / 2;
  const b = para(cx, y + 170, body, {
    size: FONT_SIZE.md,
    fill: C.textSecondary,
    anchor: 'middle',
    maxW: W - P * 4,
  });
  return g(
    'EmptyState',
    circle(cx, y + 60, 60, { fill: C.primaryTint }),
    motif(cx - 60, y + 112, 120, C.primary, 6, 0.35),
    icon(iconName, cx - 24, y + 36, 48, C.primary),
    text(cx, y + 140, title, {
      size: FONT_SIZE.xl,
      weight: 600,
      anchor: 'middle',
    }),
    b.svg,
    cta
      ? button(P * 2, y + 186 + b.height, W - P * 4, cta, {
          variant: 'outline',
        })
      : '',
  );
}

function listRow(ctx, y, iconName, label, o = {}) {
  const { W, P } = ctx;
  const color = o.color ?? C.textPrimary;
  return g(
    `ListRow / ${label}`,
    rect(P, y, W - P * 2, 60, {
      r: RADIUS.md,
      fill: C.surface,
      stroke: C.border,
    }),
    circle(P + 30, y + 30, 18, { fill: o.tint ?? C.primaryTint }),
    icon(iconName, P + 19, y + 19, 22, o.iconColor ?? C.primary),
    text(P + 60, y + 36, label, {
      size: FONT_SIZE.md,
      weight: 500,
      fill: color,
    }),
    o.value
      ? text(W - P - 40, y + 36, o.value, {
          size: FONT_SIZE.sm,
          fill: C.textSecondary,
          anchor: 'end',
        })
      : '',
    o.chevron === false
      ? ''
      : icon('chevron', W - P - 34, y + 19, 22, C.textSecondary),
    o.right ?? '',
  );
}

function statTile(x, y, w, iconName, value, label, color) {
  return g(
    `StatTile / ${label}`,
    rect(x, y, w, 88, { r: RADIUS.md, fill: C.surface, stroke: C.border }),
    icon(iconName, x + SPACING.md, y + SPACING.md, 22, color),
    text(x + SPACING.md, y + 58, value, { size: FONT_SIZE.xl, weight: 700 }),
    text(x + SPACING.md, y + 78, label, {
      size: FONT_SIZE.xs,
      fill: C.textSecondary,
    }),
  );
}

function exerciseTop(ctx, step, total, label) {
  const { W, P, top } = ctx;
  const y = top + SPACING.sm;
  return g(
    'ExerciseHeader',
    icon('close', P, y + 10, 24, C.textSecondary),
    progressBar(P + 44, y + 18, W - P * 2 - 44 - 48, step / total),
    text(W - P, y + 28, `${step}/${total}`, {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.textSecondary,
      anchor: 'end',
    }),
    text(P, y + 84, label.toUpperCase(), {
      size: FONT_SIZE.xs,
      weight: 600,
      fill: C.primary,
    }),
  );
}

function homeIndicator(ctx, dark = false) {
  if (ctx.device !== 'ios') return '';
  return rect(ctx.W / 2 - 67, ctx.H - 13, 134, 5, {
    r: 2.5,
    fill: dark ? C.textInverse : C.textPrimary,
  });
}

// ─── Screens ────────────────────────────────────────────────────────────────
// Sample content: seed data + content/vocabulary/tachelhit.csv (unvalidated).
const WORDS = [
  ['azul', 'hello', 'greetings'],
  ['tanmirt', 'thank you', 'greetings'],
  ['mrḥba', 'welcome', 'greetings'],
  ['yan', 'one', 'numbers'],
  ['sin', 'two', 'numbers'],
  ['kraḍ', 'three', 'numbers'],
  ['yumma', 'mother', 'family'],
];

const SCREENS = [];
const screen = (doc, name, fn) => SCREENS.push({ doc, name, fn });

const DOCS = {
  ds: '1 Design System',
  auth: '2 Onboarding & Auth',
  learn: '3 Learning',
  vocab: '4 Vocabulary & Tifinagh',
  profile: '5 Profile & Gamification',
};

// Onboarding & Auth ----------------------------------------------------------
screen(DOCS.auth, 'Splash', ctx => {
  const { W, H } = ctx;
  return [
    rect(0, 0, W, H, { fill: C.primary }),
    statusBar(ctx, true),
    motif(0, 120, W, C.primaryLight, 14, 0.5),
    circle(W / 2, H / 2 - 60, 84, { fill: C.surface, opacity: 0.14 }),
    text(W / 2, H / 2 - 38, 'ⵣ', {
      size: 84,
      font: 'tif',
      fill: C.textInverse,
      anchor: 'middle',
    }),
    text(W / 2, H / 2 + 76, tif('azul'), {
      size: 40,
      font: 'tif',
      fill: C.textInverse,
      anchor: 'middle',
    }),
    text(W / 2, H / 2 + 118, 'Amazigh Learning', {
      size: FONT_SIZE.xl,
      weight: 600,
      fill: C.textInverse,
      anchor: 'middle',
    }),
    text(W / 2, H / 2 + 146, 'Learn Moroccan Amazigh', {
      size: FONT_SIZE.sm,
      fill: C.textInverse,
      anchor: 'middle',
      opacity: 0.85,
    }),
    motif(0, H - 150, W, C.primaryLight, 14, 0.5),
    homeIndicator(ctx, true),
  ];
});

const ONBOARDING = [
  {
    title: 'Learn by doing',
    body: 'Short, interactive lessons with instant feedback on every answer.',
    art: (ctx, cx, cy) => [
      card(cx - 110, cy - 70, 220, 140, { state: 'correct', r: RADIUS.lg }),
      amazighWord(cx, cy - 8, 'azul', { size: 40, anchor: 'middle' }),
      circle(cx + 100, cy - 62, 22, { fill: C.accent }),
      icon('check', cx + 88, cy - 74, 24, C.textInverse, { sw: 3 }),
    ],
  },
  {
    title: 'Tifinagh first',
    body: 'Read the Tifinagh script from day one, with Latin transcription whenever you need it.',
    art: (ctx, cx, cy) =>
      ['a', 'z', 'u', 'l'].map((l, i) => {
        const x = cx - 132 + i * 68;
        return [
          card(x, cy - 40, 60, 80, { state: i === 1 ? 'selected' : 'default' }),
          text(x + 30, cy + 8, tif(l), {
            size: 32,
            font: 'tif',
            anchor: 'middle',
          }),
          text(x + 30, cy + 30, l, {
            size: FONT_SIZE.sm,
            fill: C.textSecondary,
            anchor: 'middle',
          }),
        ];
      }),
  },
  {
    title: 'Keep your streak',
    body: 'Earn XP, build a daily streak and unlock achievements as you progress.',
    art: (ctx, cx, cy) => [
      circle(cx, cy, 70, { fill: C.primaryTint }),
      icon('flame', cx - 36, cy - 40, 72, C.primary, { sw: 1.6 }),
      chip(cx + 30, cy + 40, '+20 XP', {
        fill: C.primary,
        fg: C.textInverse,
        icon: 'star',
      }).svg,
      chip(cx - 150, cy - 70, '5-day streak', {
        fill: C.surface,
        icon: 'flame',
      }).svg,
    ],
  },
];
ONBOARDING.forEach((slide, idx) =>
  screen(DOCS.auth, `Onboarding ${idx + 1}`, ctx => {
    const { W, H, P, bottom } = ctx;
    const cy = H * 0.36;
    const t = para(W / 2, H * 0.6 + 44, slide.body, {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
      anchor: 'middle',
      maxW: W - P * 3,
    });
    const last = idx === ONBOARDING.length - 1;
    return [
      statusBar(ctx),
      last
        ? ''
        : text(W - P, ctx.top + 36, 'Skip', {
            size: FONT_SIZE.md,
            weight: 600,
            fill: C.primary,
            anchor: 'end',
          }),
      slide.art(ctx, W / 2, cy),
      text(W / 2, H * 0.6, slide.title, {
        size: FONT_SIZE.xxl,
        weight: 700,
        anchor: 'middle',
      }),
      t.svg,
      [0, 1, 2].map(i =>
        rect(
          W / 2 - 34 + i * 24 + (i > idx ? 12 : 0),
          H - bottom - 120,
          i === idx ? 24 : 8,
          8,
          {
            r: 4,
            fill: i === idx ? C.primary : C.border,
          },
        ),
      ),
      button(
        P,
        H - bottom - 52 - SPACING.xl,
        W - P * 2,
        last ? 'Get started' : 'Next',
      ),
      homeIndicator(ctx),
    ];
  }),
);

screen(DOCS.auth, 'Welcome', ctx => {
  const { W, H, P, bottom } = ctx;
  return [
    statusBar(ctx),
    motif(0, ctx.top + 40, W, C.primary, 10, 0.25),
    text(W / 2, H * 0.32, tif('azul'), {
      size: 56,
      font: 'tif',
      fill: C.primary,
      anchor: 'middle',
    }),
    text(W / 2, H * 0.32 + 36, 'azul', {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
      anchor: 'middle',
      weight: 500,
    }),
    text(W / 2, H * 0.46, 'Learn Moroccan Amazigh', {
      size: FONT_SIZE.xxl - 2,
      weight: 700,
      anchor: 'middle',
    }),
    para(
      W / 2,
      H * 0.46 + 34,
      'Tachelhit, Tamazight and Tarifit — in Tifinagh and Latin script.',
      {
        size: FONT_SIZE.md,
        fill: C.textSecondary,
        anchor: 'middle',
        maxW: W - P * 3,
      },
    ).svg,
    button(
      P,
      H - bottom - 52 * 2 - SPACING.md - SPACING.xl - 36,
      W - P * 2,
      'Create account',
    ),
    button(P, H - bottom - 52 - SPACING.xl - 36, W - P * 2, 'Sign in', {
      variant: 'outline',
    }),
    text(
      W / 2,
      H - bottom - SPACING.xl,
      'By continuing you accept the Terms and Privacy Policy',
      {
        size: FONT_SIZE.xs,
        fill: C.textSecondary,
        anchor: 'middle',
      },
    ),
    homeIndicator(ctx),
  ];
});

screen(DOCS.auth, 'Register', ctx => {
  const { W, P, H, bottom } = ctx;
  const h = header(ctx, 'Create your account', { large: true });
  let y = h.bottom + SPACING.sm;
  const sub = text(P, y, 'Save your progress across devices.', {
    size: FONT_SIZE.md,
    fill: C.textSecondary,
  });
  y += SPACING.xl;
  const fields = [
    textInput(P, y, W - P * 2, 'Name', { value: 'Tiziri' }),
    textInput(P, y + 88, W - P * 2, 'Email', { value: 'tiziri@example.com' }),
    textInput(P, y + 176, W - P * 2, 'Password', {
      state: 'focused',
      value: '••••••',
      trailing: 'eye',
      helper: 'At least 8 characters',
    }),
  ];
  y += 176 + 96 + SPACING.xl;
  return [
    statusBar(ctx),
    h.svg,
    sub,
    fields.map(f => f.svg),
    button(P, y, W - P * 2, 'Create account'),
    text(W / 2, H - bottom - SPACING.xl, 'Already have an account? Sign in', {
      size: FONT_SIZE.sm,
      weight: 500,
      fill: C.primary,
      anchor: 'middle',
    }),
    homeIndicator(ctx),
  ];
});

function loginScreen(ctx, error) {
  const { W, P, H, bottom } = ctx;
  const h = header(ctx, 'Welcome back', { large: true });
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y, 'Sign in to continue your journey.', {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
    }),
  ];
  y += SPACING.xl;
  if (error) {
    parts.push(
      g(
        'InlineAlert / error',
        rect(P, y, W - P * 2, 52, { r: RADIUS.sm, fill: C.dangerTint }),
        icon('info', P + SPACING.md, y + 15, 22, C.danger),
        text(P + 44, y + 31, 'Incorrect email or password.', {
          size: FONT_SIZE.sm,
          weight: 500,
          fill: C.danger,
        }),
      ),
    );
    y += 52 + SPACING.lg;
  }
  const email = textInput(P, y, W - P * 2, 'Email', {
    value: 'tiziri@example.com',
    state: error ? 'error' : 'default',
    helper: error ? ' ' : undefined,
  });
  y += email.height + SPACING.lg;
  const pw = textInput(P, y, W - P * 2, 'Password', {
    value: '••••••••',
    trailing: 'eye',
    state: error ? 'error' : 'focused',
  });
  y += pw.height;
  parts.push(
    email.svg,
    pw.svg,
    text(W - P, y + 28, 'Forgot password?', {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.primary,
      anchor: 'end',
    }),
    button(P, y + 52, W - P * 2, 'Sign in'),
    rect(P, y + 140, W - P * 2, 1, { fill: C.border }),
    rect(W / 2 - 20, y + 130, 40, 20, { fill: C.background }),
    text(W / 2, y + 145, 'or', {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
      anchor: 'middle',
    }),
    button(P, y + 168, W - P * 2, 'Continue as guest', { variant: 'outline' }),
    text(W / 2, H - bottom - SPACING.xl, 'New here? Create an account', {
      size: FONT_SIZE.sm,
      weight: 500,
      fill: C.primary,
      anchor: 'middle',
    }),
    homeIndicator(ctx),
  );
  return parts;
}
screen(DOCS.auth, 'Login', ctx => loginScreen(ctx, false));
screen(DOCS.auth, 'Login — error', ctx => loginScreen(ctx, true));

screen(DOCS.auth, 'Forgot password', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Reset your password', { large: true });
  let y = h.bottom + SPACING.sm;
  const b = para(
    P,
    y,
    'Enter the email you signed up with and we will send you a reset link.',
    {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
      maxW: W - P * 2,
    },
  );
  y += b.height + SPACING.lg;
  const email = textInput(P, y, W - P * 2, 'Email', {
    value: 'tiziri@example.com',
    state: 'success',
  });
  y += email.height + SPACING.xl;
  return [
    statusBar(ctx),
    h.svg,
    b.svg,
    email.svg,
    button(P, y, W - P * 2, 'Send reset link', { state: 'disabled' }),
    g(
      'InlineAlert / success',
      rect(P, y + 76, W - P * 2, 76, { r: RADIUS.md, fill: C.accentTint }),
      icon('mail', P + SPACING.lg, y + 92, 24, C.accent),
      text(P + 52, y + 104, 'Check your inbox', {
        size: FONT_SIZE.md,
        weight: 600,
        fill: C.accent,
      }),
      text(P + 52, y + 128, 'Reset link sent to tiziri@example.com', {
        size: FONT_SIZE.sm - 1,
        fill: C.textPrimary,
      }),
    ),
    homeIndicator(ctx),
  ];
});

screen(DOCS.auth, 'Dialect selection', ctx => {
  const { W, P, H, bottom } = ctx;
  const h = header(ctx, 'Choose your dialect', { large: true });
  let y = h.bottom + SPACING.sm;
  const dialects = [
    ['Tachelhit', 'Souss and Anti-Atlas'],
    ['Tamazight', 'Middle and High Atlas'],
    ['Tarifit', 'Rif'],
  ];
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y, 'You can change this later in Settings.', {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
    }),
    progressBar(P, ctx.top + 22, 0, 0),
  ];
  y += SPACING.xl;
  dialects.forEach(([name, region], i) => {
    const sel = i === 0;
    parts.push(
      g(
        `DialectCard / ${name}${sel ? ' / selected' : ''}`,
        card(P, y, W - P * 2, 84, { state: sel ? 'selected' : 'default' }),
        circle(P + 36, y + 42, 20, { fill: sel ? C.secondary : C.primaryTint }),
        icon('globe', P + 24, y + 30, 24, sel ? C.textInverse : C.primary),
        text(P + 72, y + 38, name, { size: FONT_SIZE.lg, weight: 600 }),
        text(P + 72, y + 62, region, {
          size: FONT_SIZE.sm,
          fill: C.textSecondary,
        }),
        sel
          ? [
              circle(W - P - 30, y + 42, 12, { fill: C.secondary }),
              icon('check', W - P - 39, y + 33, 18, C.textInverse, { sw: 3 }),
            ]
          : circle(W - P - 30, y + 42, 12, { stroke: C.border, sw: 2 }),
      ),
    );
    y += 84 + SPACING.md;
  });
  parts.push(
    [0, 1].map(i =>
      rect(W / 2 - 20 + i * 24, H - bottom - 112, i === 0 ? 24 : 8, 8, {
        r: 4,
        fill: i === 0 ? C.primary : C.border,
      }),
    ),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Continue'),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.auth, 'Learning preferences', ctx => {
  const { W, P, H, bottom } = ctx;
  const h = header(ctx, 'Set your goals', { large: true });
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y, 'Daily goal', { size: FONT_SIZE.md, weight: 600 }),
  ];
  y += SPACING.md;
  const mins = [5, 10, 15, 20, 30];
  const cw = (W - P * 2 - SPACING.sm * 4) / 5;
  mins.forEach((m, i) => {
    const x = P + i * (cw + SPACING.sm);
    const sel = m === 10;
    parts.push(
      g(
        `GoalOption / ${m} min${sel ? ' / selected' : ''}`,
        card(x, y, cw, 64, { state: sel ? 'selected' : 'default' }),
        text(x + cw / 2, y + 30, String(m), {
          size: FONT_SIZE.lg,
          weight: 700,
          anchor: 'middle',
          fill: sel ? C.secondary : C.textPrimary,
        }),
        text(x + cw / 2, y + 50, 'min', {
          size: FONT_SIZE.xs,
          anchor: 'middle',
          fill: C.textSecondary,
        }),
      ),
    );
  });
  y += 64 + SPACING.xl + 8;
  parts.push(
    text(P, y, 'Why are you learning?', { size: FONT_SIZE.md, weight: 600 }),
  );
  y += SPACING.md;
  parts.push(
    chipRow(P, y, ['Travel', 'Family', 'School'], { selectedIndex: 1, h: 44 }),
  );
  parts.push(chipRow(P, y + 44 + SPACING.sm, ['Culture', 'Work'], { h: 44 }));
  y += 44 * 2 + SPACING.sm + SPACING.xl + 8;
  parts.push(
    listRow(ctx, y, 'eye', 'Show Latin transcription', {
      chevron: false,
      right: toggle(W - P - 64, y + 14, true),
    }),
    para(
      P,
      y + 84,
      'Tifinagh is always shown. Turn this off to practise reading without help.',
      {
        size: FONT_SIZE.xs + 1,
        fill: C.textSecondary,
        maxW: W - P * 2,
      },
    ).svg,
    [0, 1].map(i =>
      rect(
        W / 2 - 20 + i * 24 + (i === 0 ? 0 : -16),
        H - bottom - 112,
        i === 1 ? 24 : 8,
        8,
        { r: 4, fill: i === 1 ? C.primary : C.border },
      ),
    ),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Start learning'),
    homeIndicator(ctx),
  );
  return parts;
});

// Learning ---------------------------------------------------------------------
function dashboard(ctx, loading) {
  const { W, P } = ctx;
  let y = ctx.top + SPACING.lg;
  const parts = [statusBar(ctx)];
  if (loading) {
    parts.push(
      skeleton(P, y, 180, 28),
      skeleton(P, y + 40, 120, 16),
      [0, 1, 2].map(i =>
        skeleton(
          P + i * ((W - P * 2 - 16) / 3 + 8),
          y + 76,
          (W - P * 2 - 16) / 3,
          88,
          RADIUS.md,
        ),
      ),
      skeleton(P, y + 196, W - P * 2, 172, RADIUS.lg),
      skeleton(P, y + 400, 140, 20),
      skeleton(P, y + 436, W - P * 2, 96, RADIUS.md),
      tabBar(ctx, 'Learn'),
      homeIndicator(ctx),
    );
    return parts;
  }
  parts.push(
    text(P, y + 24, 'Azul, Tiziri', { size: FONT_SIZE.xxl, weight: 700 }),
    text(P + tw('Azul, Tiziri', FONT_SIZE.xxl, 700) + 8, y + 24, tif('azul'), {
      size: FONT_SIZE.xl,
      font: 'tif',
      fill: C.primary,
    }),
    text(P, y + 52, 'Ready for today’s lesson?', {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
    }),
    circle(ctx.W - P - 22, y + 18, 22, { fill: C.primaryTint }),
    text(ctx.W - P - 22, y + 25, 'T', {
      size: FONT_SIZE.lg,
      weight: 600,
      fill: C.primary,
      anchor: 'middle',
    }),
  );
  y += 76;
  const sw = (W - P * 2 - SPACING.sm * 2) / 3;
  parts.push(
    statTile(P, y, sw, 'flame', '5', 'day streak', C.primary),
    statTile(
      P + sw + SPACING.sm,
      y,
      sw,
      'star',
      '120',
      'total XP',
      C.primaryLight,
    ),
    statTile(
      P + (sw + SPACING.sm) * 2,
      y,
      sw,
      'target',
      '6/10',
      'min today',
      C.accent,
    ),
  );
  y += 88 + SPACING.xl;
  parts.push(
    g(
      'ContinueCard',
      rect(P, y, W - P * 2, 176, { r: RADIUS.lg, fill: C.secondary }),
      motif(P + 16, y + 150, W - P * 2 - 32, C.secondaryLight, 8, 0.35),
      text(P + SPACING.lg, y + 32, 'CONTINUE LEARNING', {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: C.secondaryLight,
      }),
      text(P + SPACING.lg, y + 62, 'Introducing yourself', {
        size: FONT_SIZE.lg + 2,
        weight: 600,
        fill: C.textInverse,
      }),
      text(P + SPACING.lg, y + 86, 'Azul basics · Module 1 · 12 min', {
        size: FONT_SIZE.sm,
        fill: C.textInverse,
        opacity: 0.85,
      }),
      rect(P + SPACING.lg, y + 104, W - P * 2 - 32 - 112, 8, {
        r: 4,
        fill: C.textInverse,
        opacity: 0.25,
      }),
      rect(P + SPACING.lg, y + 104, (W - P * 2 - 32 - 112) * 0.5, 8, {
        r: 4,
        fill: C.textInverse,
      }),
      rect(W - P - SPACING.lg - 96, y + 88, 96, 40, {
        r: RADIUS.md,
        fill: C.surface,
      }),
      text(W - P - SPACING.lg - 48, y + 113, 'Resume', {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.secondary,
        anchor: 'middle',
      }),
    ),
  );
  y += 176 + SPACING.xl + 8;
  parts.push(text(P, y, 'Your courses', { size: FONT_SIZE.lg, weight: 600 }));
  y += SPACING.md;
  const bA1 = badge(P + SPACING.lg, y + 58, 'A1', 'primary');
  parts.push(
    g(
      'CourseCard / Azul basics',
      card(P, y, W - P * 2, 116),
      text(P + SPACING.lg, y + 30, 'Azul basics', {
        size: FONT_SIZE.md + 1,
        weight: 600,
      }),
      text(P + SPACING.lg, y + 50, 'First steps: greetings and essentials', {
        size: FONT_SIZE.sm - 1,
        fill: C.textSecondary,
      }),
      bA1.svg,
      badge(P + SPACING.lg + bA1.width + 6, y + 58, 'Tachelhit', 'neutral').svg,
      progressBar(P + SPACING.lg, y + 96, W - P * 2 - 32 - 70, 1 / 3),
      text(W - P - SPACING.lg, y + 102, '1/3', {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: C.textSecondary,
        anchor: 'end',
      }),
      text(W - P - SPACING.lg, y + 32, tif('azul'), {
        size: FONT_SIZE.xl,
        font: 'tif',
        fill: C.primary,
        anchor: 'end',
      }),
    ),
    tabBar(ctx, 'Learn'),
    homeIndicator(ctx),
  );
  return parts;
}
screen(DOCS.learn, 'Dashboard', ctx => dashboard(ctx, false));
screen(DOCS.learn, 'Dashboard — loading', ctx => dashboard(ctx, true));

screen(DOCS.learn, 'Course details', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Course');
  let y = h.bottom + SPACING.sm;
  const parts = [statusBar(ctx), h.svg];
  const b1 = badge(P + SPACING.xl, y + 24, 'A1', 'primary');
  const desc = para(
    P + SPACING.xl,
    y + 118,
    'First steps in Tamazight: greetings and essential phrases.',
    {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
      maxW: W - P * 2 - SPACING.xl * 2,
    },
  );
  parts.push(
    g(
      'CourseHero',
      rect(P, y, W - P * 2, 196, {
        r: RADIUS.lg,
        fill: C.surface,
        stroke: C.border,
      }),
      b1.svg,
      badge(P + SPACING.xl + b1.width + 6, y + 24, 'Tachelhit', 'neutral').svg,
      text(W - P - SPACING.xl, y + 46, tif('azul'), {
        size: 32,
        font: 'tif',
        fill: C.primary,
        anchor: 'end',
      }),
      text(P + SPACING.xl, y + 86, 'Azul basics', {
        size: FONT_SIZE.xxl - 2,
        weight: 700,
      }),
      desc.svg,
      progressBar(
        P + SPACING.xl,
        y + 168,
        W - P * 2 - SPACING.xl * 2 - 92,
        1 / 3,
      ),
      text(W - P - SPACING.xl, y + 175, '1 of 3 lessons', {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: C.textSecondary,
        anchor: 'end',
      }),
    ),
  );
  y += 196 + SPACING.xl + 8;
  parts.push(text(P, y, 'Modules', { size: FONT_SIZE.lg, weight: 600 }));
  y += SPACING.md;
  const mods = [
    ['Module 1 — First words', '2 lessons · 22 min', 0.5, false],
    ['Module 2 — Daily life', '1 lesson · 15 min', 0, true],
  ];
  mods.forEach(([t, meta, p, locked], i) => {
    parts.push(
      g(
        `ModuleCard / ${t}${locked ? ' / locked' : ''}`,
        card(P, y, W - P * 2, 100, { state: locked ? 'locked' : 'default' }),
        circle(P + 34, y + 40, 20, { fill: locked ? C.border : C.primaryTint }),
        locked
          ? icon('lock', P + 23, y + 29, 22, C.textSecondary)
          : text(P + 34, y + 47, String(i + 1), {
              size: FONT_SIZE.lg,
              weight: 700,
              fill: C.primary,
              anchor: 'middle',
            }),
        text(P + 68, y + 36, t, {
          size: FONT_SIZE.md,
          weight: 600,
          fill: locked ? C.textSecondary : C.textPrimary,
        }),
        text(P + 68, y + 58, locked ? 'Complete Module 1 to unlock' : meta, {
          size: FONT_SIZE.sm - 1,
          fill: C.textSecondary,
        }),
        locked ? '' : progressBar(P + 68, y + 76, W - P * 2 - 68 - 50, p),
        locked ? '' : icon('chevron', W - P - 36, y + 28, 22, C.textSecondary),
      ),
    );
    y += 100 + SPACING.md;
  });
  parts.push(tabBar(ctx, 'Learn'), homeIndicator(ctx));
  return parts;
});

screen(DOCS.learn, 'Module', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Module 1 — First words');
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y + 4, '2 lessons · 1 completed', {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
    }),
  ];
  y += SPACING.xl;
  const lessons = [
    ['Greetings', '10 min', 20, 'done'],
    ['Introducing yourself', '12 min', 25, 'current'],
  ];
  lessons.forEach(([t, mins, xp, st], i) => {
    const done = st === 'done';
    const hgt = done ? 84 : 140;
    parts.push(
      g(
        `LessonRow / ${t} / ${st}`,
        card(P, y, W - P * 2, hgt, { state: done ? 'default' : 'selected' }),
        circle(P + 34, y + 42, 20, { fill: done ? C.accent : C.secondary }),
        done
          ? icon('check', P + 23, y + 31, 22, C.textInverse, { sw: 3 })
          : text(P + 34, y + 49, String(i + 1), {
              size: FONT_SIZE.lg,
              weight: 700,
              fill: C.textInverse,
              anchor: 'middle',
            }),
        text(P + 68, y + 38, t, { size: FONT_SIZE.md, weight: 600 }),
        icon('clock', P + 68, y + 50, 16, C.textSecondary),
        text(P + 88, y + 63, mins, {
          size: FONT_SIZE.sm - 1,
          fill: C.textSecondary,
        }),
        icon('star', P + 140, y + 50, 16, C.primary),
        text(P + 160, y + 63, `+${xp} XP`, {
          size: FONT_SIZE.sm - 1,
          weight: 600,
          fill: C.primary,
        }),
        done
          ? text(W - P - SPACING.lg, y + 48, 'Review', {
              size: FONT_SIZE.sm,
              weight: 600,
              fill: C.primary,
              anchor: 'end',
            })
          : '',
        done
          ? ''
          : button(P + SPACING.lg, y + 80, W - P * 2 - 32, 'Start lesson', {
              size: 'md',
              variant: 'secondary',
            }),
      ),
    );
    y += hgt + SPACING.md;
  });
  parts.push(tabBar(ctx, 'Learn'), homeIndicator(ctx));
  return parts;
});

screen(DOCS.learn, 'Lesson — content step', ctx => {
  const { W, P, H, bottom } = ctx;
  const parts = [statusBar(ctx), exerciseTop(ctx, 1, 2, 'Greetings')];
  let y = ctx.top + SPACING.sm + 112;
  parts.push(
    text(P, y, 'Hello in Tamazight', { size: FONT_SIZE.xxl - 2, weight: 700 }),
  );
  y += SPACING.xl;
  parts.push(
    g(
      'WordHero',
      rect(P, y, W - P * 2, 220, {
        r: RADIUS.lg,
        fill: C.surface,
        stroke: C.border,
      }),
      motif(P + 24, y + 196, W - P * 2 - 48, C.primary, 6, 0.2),
      text(W / 2, y + 100, tif('azul'), {
        size: 56,
        font: 'tif',
        fill: C.primary,
        anchor: 'middle',
      }),
      text(W / 2, y + 140, 'azul', {
        size: FONT_SIZE.lg,
        weight: 600,
        anchor: 'middle',
      }),
      text(W / 2, y + 166, 'hello', {
        size: FONT_SIZE.md,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
      circle(W - P - 36, y + 36, 22, { fill: C.primaryTint }),
      icon('speaker', W - P - 48, y + 24, 24, C.primary),
    ),
  );
  y += 220 + SPACING.lg;
  parts.push(chip(P, y, 'Latin', { selected: true, icon: 'eye' }).svg);
  y += 36 + SPACING.xl + 8;
  parts.push(
    para(P, y, '“Azul” is the most common way to say hello.', {
      size: FONT_SIZE.md,
      maxW: W - P * 2,
    }).svg,
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Continue'),
    homeIndicator(ctx),
  );
  return parts;
});

function mcq(ctx, state) {
  const { W, P, H, bottom } = ctx;
  const parts = [statusBar(ctx), exerciseTop(ctx, 2, 2, 'Multiple choice')];
  let y = ctx.top + SPACING.sm + 116;
  parts.push(
    text(P, y, 'Which word means “hello”?', {
      size: FONT_SIZE.xl,
      weight: 600,
    }),
  );
  y += SPACING.xl + 8;
  const opts = ['azul', 'agadir', 'amaziɣ'];
  opts.forEach((o, i) => {
    let st = 'default';
    if (state === 'selected' && i === 0) st = 'selected';
    if (state === 'correct' && i === 0) st = 'correct';
    if (state === 'incorrect' && i === 2) st = 'incorrect';
    if (state === 'incorrect' && i === 0) st = 'correct';
    const fg =
      st === 'correct'
        ? C.accent
        : st === 'incorrect'
        ? C.danger
        : st === 'selected'
        ? C.secondary
        : C.textPrimary;
    parts.push(
      g(
        `OptionCard / ${o} / ${st}`,
        card(P, y, W - P * 2, 84, { state: st }),
        text(P + SPACING.lg + 4, y + 40, tif(o), {
          size: FONT_SIZE.xl,
          font: 'tif',
          fill: fg,
        }),
        text(P + SPACING.lg + 4, y + 66, o, {
          size: FONT_SIZE.sm,
          weight: 500,
          fill: C.textSecondary,
        }),
        st === 'correct'
          ? [
              circle(W - P - 32, y + 42, 14, { fill: C.accent }),
              icon('check', W - P - 42, y + 32, 20, C.textInverse, { sw: 3 }),
            ]
          : st === 'incorrect'
          ? [
              circle(W - P - 32, y + 42, 14, { fill: C.danger }),
              icon('close', W - P - 42, y + 32, 20, C.textInverse, { sw: 3 }),
            ]
          : circle(W - P - 32, y + 42, 12, {
              stroke: st === 'selected' ? C.secondary : C.border,
              sw: st === 'selected' ? 6 : 2,
            }),
      ),
    );
    y += 84 + SPACING.md;
  });
  if (state === 'correct') parts.push(feedbackBanner(ctx, true, { xp: 20 }));
  else if (state === 'incorrect')
    parts.push(feedbackBanner(ctx, false, { answer: 'azul' }));
  else
    parts.push(
      button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check', {
        state: state === 'idle' ? 'disabled' : 'default',
      }),
    );
  parts.push(homeIndicator(ctx));
  return parts;
}
screen(DOCS.learn, 'Exercise — MCQ', ctx => mcq(ctx, 'idle'));
screen(DOCS.learn, 'Exercise — MCQ selected', ctx => mcq(ctx, 'selected'));
screen(DOCS.learn, 'Exercise — MCQ correct', ctx => mcq(ctx, 'correct'));
screen(DOCS.learn, 'Exercise — MCQ incorrect', ctx => mcq(ctx, 'incorrect'));

screen(DOCS.learn, 'Exercise — translation', ctx => {
  const { W, P, H, bottom } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const input = textInput(P, y + 96, W - P * 2, 'Your answer', {
    value: 'tanmirt',
    state: 'focused',
  });
  return [
    statusBar(ctx),
    exerciseTop(ctx, 1, 4, 'Translation'),
    text(P, y, 'Translate into Tamazight', { size: FONT_SIZE.xl, weight: 600 }),
    g(
      'PromptCard',
      card(P, y + 20, W - P * 2, 60),
      text(P + SPACING.lg, y + 57, '“thank you”', {
        size: FONT_SIZE.lg,
        weight: 500,
      }),
    ),
    input.svg,
    g(
      'TifinaghPreview',
      text(P, y + 216, 'Tifinagh preview', {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: C.textSecondary,
      }),
      text(P, y + 248, tif('tanmirt'), {
        size: FONT_SIZE.xl,
        font: 'tif',
        fill: C.primary,
      }),
    ),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check'),
    homeIndicator(ctx),
  ];
});

screen(DOCS.learn, 'Exercise — matching', ctx => {
  const { W, P, H, bottom } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const parts = [
    statusBar(ctx),
    exerciseTop(ctx, 2, 4, 'Matching'),
    text(P, y, 'Match the pairs', { size: FONT_SIZE.xl, weight: 600 }),
  ];
  y += SPACING.xl + 8;
  const colW = (W - P * 2 - SPACING.md) / 2;
  const left = ['yan', 'sin', 'kraḍ'];
  const right = ['two', 'three', 'one'];
  left.forEach((w, i) => {
    const st = i === 0 ? 'correct' : i === 1 ? 'selected' : 'default';
    parts.push(
      g(
        `MatchTile / ${w} / ${st}`,
        card(P, y + i * 92, colW, 80, { state: st }),
        amazighWord(P + colW / 2, y + i * 92 + 36, w, {
          size: FONT_SIZE.xl,
          anchor: 'middle',
          fill: st === 'correct' ? C.accent : C.textPrimary,
        }),
      ),
    );
  });
  right.forEach((w, i) => {
    const st = i === 2 ? 'correct' : 'default';
    parts.push(
      g(
        `MatchTile / ${w} / ${st}`,
        card(P + colW + SPACING.md, y + i * 92, colW, 80, { state: st }),
        text(P + colW * 1.5 + SPACING.md, y + i * 92 + 46, w, {
          size: FONT_SIZE.md,
          weight: 500,
          anchor: 'middle',
          fill: st === 'correct' ? C.accent : C.textPrimary,
        }),
      ),
    );
  });
  parts.push(
    text(W / 2, y + 3 * 92 + 24, '1 of 3 pairs matched', {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
      anchor: 'middle',
    }),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check', {
      state: 'disabled',
    }),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.learn, 'Exercise — sentence', ctx => {
  const { W, P, H, bottom } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const placed = chip(P + SPACING.md, y + 92, `${tif('azul')}  azul`, {
    h: 44,
    fill: C.surface,
  });
  return [
    statusBar(ctx),
    exerciseTop(ctx, 3, 4, 'Build the sentence'),
    text(P, y, 'Translate: “hello to you”', {
      size: FONT_SIZE.xl,
      weight: 600,
    }),
    g(
      'AnswerArea',
      rect(P, y + 76, W - P * 2, 76, {
        r: RADIUS.md,
        fill: C.background,
        stroke: C.border,
        dash: '6 6',
      }),
      placed.svg,
      rect(P + SPACING.md + placed.width + SPACING.sm, y + 92, 96, 44, {
        r: 22,
        stroke: C.border,
        dash: '4 4',
        fill: 'none',
      }),
    ),
    g(
      'WordBank',
      text(P, y + 196, 'Word bank', {
        size: FONT_SIZE.xs,
        weight: 600,
        fill: C.textSecondary,
      }),
      (() => {
        let x = P;
        return ['fllawn', 'azul', 'tanmirt', 'ih'].map((w, i) => {
          const c = chip(x, y + 212, `${tif(w)}  ${w}`, {
            h: 44,
            fill: i === 1 ? C.border : C.surface,
            fg: i === 1 ? C.border : C.textPrimary,
          });
          x += c.width + SPACING.sm;
          if (x > W - P - 80) x = P;
          return c.svg;
        });
      })(),
    ),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check', {
      state: 'disabled',
    }),
    homeIndicator(ctx),
  ];
});

screen(DOCS.learn, 'Exercise — fill in the blank', ctx => {
  const { W, P, H, bottom } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const input = textInput(P, y + 168, W - P * 2, 'Missing word', {
    value: 'azul',
    state: 'focused',
  });
  return [
    statusBar(ctx),
    exerciseTop(ctx, 4, 4, 'Fill in the blank'),
    text(P, y, 'Complete the sentence', { size: FONT_SIZE.xl, weight: 600 }),
    g(
      'SentenceCard',
      card(P, y + 20, W - P * 2, 124),
      rect(P + SPACING.lg, y + 44, 84, 40, {
        r: RADIUS.sm,
        fill: C.secondaryTint,
        stroke: C.secondary,
        sw: 2,
      }),
      text(P + SPACING.lg + 42, y + 71, '?', {
        size: FONT_SIZE.lg,
        weight: 600,
        fill: C.secondary,
        anchor: 'middle',
      }),
      text(P + SPACING.lg + 96, y + 74, tif('fllawn'), {
        size: FONT_SIZE.xl,
        font: 'tif',
      }),
      text(P + SPACING.lg, y + 116, '___ fllawn — “hello to you”', {
        size: FONT_SIZE.sm,
        fill: C.textSecondary,
      }),
    ),
    input.svg,
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check'),
    homeIndicator(ctx),
  ];
});

screen(DOCS.learn, 'Exercise — listening', ctx => {
  const { W, P, H, bottom } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const input = textInput(P, y + 248, W - P * 2, 'What did you hear?', {
    placeholder: 'Type in Latin or Tifinagh',
  });
  return [
    statusBar(ctx),
    exerciseTop(ctx, 1, 3, 'Listening'),
    text(P, y, 'Type what you hear', { size: FONT_SIZE.xl, weight: 600 }),
    g(
      'AudioPlayer',
      circle(W / 2 - 36, y + 128, 56, { fill: C.secondary }),
      icon('speaker', W / 2 - 36 - 22, y + 106, 44, C.textInverse),
      circle(W / 2 + 64, y + 148, 32, { fill: C.secondaryTint }),
      text(W / 2 + 64, y + 154, '0.75×', {
        size: FONT_SIZE.sm - 1,
        weight: 600,
        fill: C.secondary,
        anchor: 'middle',
      }),
      text(W / 2 - 36, y + 214, 'Tap to play', {
        size: FONT_SIZE.sm,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
    ),
    input.svg,
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Check', {
      state: 'disabled',
    }),
    homeIndicator(ctx),
  ];
});

screen(DOCS.learn, 'Lesson complete', ctx => {
  const { W, P, H, bottom } = ctx;
  const cx = W / 2;
  let y = ctx.top + 60;
  const sw = (W - P * 2 - SPACING.sm * 2) / 3;
  return [
    statusBar(ctx),
    motif(0, y, W, C.primary, 10, 0.25),
    circle(cx, y + 120, 64, { fill: C.accentTint }),
    circle(cx, y + 120, 44, { fill: C.accent }),
    icon('check', cx - 22, y + 98, 44, C.textInverse, { sw: 3 }),
    icon('sparkles', cx + 52, y + 50, 28, C.primaryLight),
    icon('sparkles', cx - 86, y + 150, 20, C.primaryLight),
    text(cx, y + 230, 'Lesson complete!', {
      size: FONT_SIZE.xxl,
      weight: 700,
      anchor: 'middle',
    }),
    text(cx, y + 260, 'Greetings', {
      size: FONT_SIZE.md,
      fill: C.textSecondary,
      anchor: 'middle',
    }),
    statTile(P, y + 296, sw, 'target', '3/3', 'score', C.accent),
    statTile(
      P + sw + SPACING.sm,
      y + 296,
      sw,
      'star',
      '+20',
      'XP earned',
      C.primaryLight,
    ),
    statTile(
      P + (sw + SPACING.sm) * 2,
      y + 296,
      sw,
      'flame',
      '6',
      'day streak',
      C.primary,
    ),
    g(
      'GoalCard',
      card(P, y + 404, W - P * 2, 72),
      text(P + SPACING.lg, y + 432, 'Daily goal', {
        size: FONT_SIZE.sm,
        weight: 600,
      }),
      text(W - P - SPACING.lg, y + 432, '10/10 min', {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.accent,
        anchor: 'end',
      }),
      progressBar(P + SPACING.lg, y + 450, W - P * 2 - 32, 1),
    ),
    button(
      P,
      H - bottom - 52 * 2 - SPACING.md - SPACING.xl,
      W - P * 2,
      'Continue',
    ),
    button(P, H - bottom - 52 - SPACING.xl, W - P * 2, 'Review lesson', {
      variant: 'outline',
    }),
    homeIndicator(ctx),
  ];
});

screen(DOCS.learn, 'Culture home', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Culture', { back: false, large: true });
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    chipRow(P, y, ['All', 'History', 'Traditions', 'Proverbs'], {
      selectedIndex: 0,
    }),
  ];
  y += 36 + SPACING.xl;
  const arts = [
    [
      'Yennayer, the Amazigh New Year',
      'Traditions',
      'North Africa',
      'Celebrated around January 12–13 with a shared family meal.',
    ],
    [
      'The Tifinagh script',
      'History',
      null,
      'One of the oldest writing systems still in use today.',
    ],
  ];
  arts.forEach(([t, cat, region, ex]) => {
    const cb = badge(P + SPACING.lg, y + 120, cat, 'secondary');
    parts.push(
      g(
        `ArticleCard / ${t}`,
        card(P, y, W - P * 2, 220, { r: RADIUS.lg }),
        rect(P, y, W - P * 2, 104, {
          r: RADIUS.lg,
          fill: cat === 'History' ? C.secondaryTint : C.primaryTint,
        }),
        rect(P, y + 80, W - P * 2, 24, {
          fill: cat === 'History' ? C.secondaryTint : C.primaryTint,
        }),
        motif(
          P + 24,
          y + 40,
          W - P * 2 - 48,
          cat === 'History' ? C.secondary : C.primary,
          12,
          0.35,
        ),
        cb.svg,
        region
          ? text(P + SPACING.lg + cb.width + 8, y + 137, region, {
              size: FONT_SIZE.xs,
              fill: C.textSecondary,
            })
          : '',
        text(P + SPACING.lg, y + 172, t, {
          size: FONT_SIZE.md + 1,
          weight: 600,
        }),
        text(P + SPACING.lg, y + 198, ex, {
          size: FONT_SIZE.xs + 1,
          fill: C.textSecondary,
        }),
      ),
    );
    y += 220 + SPACING.lg;
  });
  parts.push(tabBar(ctx, 'Culture'), homeIndicator(ctx));
  return parts;
});

screen(DOCS.learn, 'Article', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, '');
  let y = h.bottom;
  const body = [
    'Yennayer is the Amazigh New Year, celebrated around January 12–13. Families gather for a shared meal, and the day marks the return of light after the winter solstice.',
    'It is one of the most important festivals across Amazigh communities in North Africa.',
  ];
  const parts = [
    statusBar(ctx),
    h.svg,
    rect(P, y, W - P * 2, 160, { r: RADIUS.lg, fill: C.primaryTint }),
    motif(P + 24, y + 68, W - P * 2 - 48, C.primary, 12, 0.35),
  ];
  y += 160 + SPACING.xl;
  const cb = badge(P, y, 'Traditions', 'secondary');
  parts.push(
    cb.svg,
    text(P + cb.width + 8, y + 17, 'North Africa', {
      size: FONT_SIZE.xs,
      fill: C.textSecondary,
    }),
  );
  y += 24 + SPACING.xl + 8;
  const t = para(P, y, 'Yennayer, the Amazigh New Year', {
    size: FONT_SIZE.xxl - 2,
    weight: 700,
    maxW: W - P * 2,
  });
  parts.push(t.svg);
  y += t.height + SPACING.md;
  body.forEach(b => {
    const p = para(P, y, b, { size: FONT_SIZE.md, maxW: W - P * 2 });
    parts.push(p.svg);
    y += p.height + SPACING.md;
  });
  parts.push(tabBar(ctx, 'Culture'), homeIndicator(ctx));
  return parts;
});

// Vocabulary & Tifinagh ------------------------------------------------------
function wordCard(ctx, y, [latin, en, cat], o = {}) {
  const { W, P } = ctx;
  return g(
    `WordCard / ${latin}`,
    card(P, y, W - P * 2, 76),
    text(P + SPACING.lg, y + 36, tif(latin), {
      size: FONT_SIZE.xl,
      font: 'tif',
      fill: C.primary,
    }),
    text(P + SPACING.lg, y + 60, latin, {
      size: FONT_SIZE.sm,
      weight: 500,
      fill: C.textSecondary,
    }),
    text(W - P - 44, y + 36, en, {
      size: FONT_SIZE.md,
      weight: 500,
      anchor: 'end',
    }),
    text(W - P - 44, y + 58, cat, {
      size: FONT_SIZE.xs,
      fill: C.textSecondary,
      anchor: 'end',
    }),
    icon('chevron', W - P - 36, y + 27, 22, C.textSecondary),
    o.review
      ? badge(P + SPACING.lg + 80, y + 46, 'Pending review', 'primary').svg
      : '',
  );
}

function library(ctx, empty) {
  const { W, P } = ctx;
  const h = header(ctx, 'Vocabulary', {
    back: false,
    large: true,
    right: (x, y) =>
      chip(x - 132, y + 4, 'Flashcards', {
        icon: 'cards',
        fill: C.primaryTint,
        fg: C.primaryPressed,
        stroke: 'none',
      }).svg,
  });
  let y = h.bottom + SPACING.sm;
  const search = textInput(P, y - 24, W - P * 2, '', {
    value: empty ? 'xyz' : undefined,
    placeholder: 'Search Tifinagh, Latin or English',
    state: empty ? 'focused' : 'default',
  });
  const parts = [
    statusBar(ctx),
    h.svg,
    search.svg,
    icon('search', W - P - 40, y + 12, 22, C.textSecondary),
  ];
  y += 48 + SPACING.lg;
  if (empty) {
    parts.push(
      emptyState(
        ctx,
        y + 40,
        'No words found',
        'Try another spelling, or search in Tifinagh.',
        'Clear search',
      ),
    );
  } else {
    parts.push(
      chipRow(P, y, ['All', 'Greetings', 'Numbers', 'Family'], {
        selectedIndex: 0,
      }),
    );
    y += 36 + SPACING.lg;
    WORDS.slice(0, ctx.device === 'ios' ? 6 : 5).forEach(w => {
      parts.push(wordCard(ctx, y, w));
      y += 76 + SPACING.sm;
    });
  }
  parts.push(tabBar(ctx, 'Vocabulary'), homeIndicator(ctx));
  return parts;
}
screen(DOCS.vocab, 'Vocabulary library', ctx => library(ctx, false));
screen(DOCS.vocab, 'Vocabulary library — empty', ctx => library(ctx, true));

screen(DOCS.vocab, 'Word details', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, '');
  let y = h.bottom;
  const parts = [
    statusBar(ctx),
    h.svg,
    g(
      'WordHero',
      rect(P, y, W - P * 2, 232, {
        r: RADIUS.lg,
        fill: C.surface,
        stroke: C.border,
      }),
      text(W / 2, y + 100, tif('azul'), {
        size: 64,
        font: 'tif',
        fill: C.primary,
        anchor: 'middle',
      }),
      text(W / 2, y + 142, 'azul', {
        size: FONT_SIZE.xl,
        weight: 600,
        anchor: 'middle',
      }),
      text(W / 2, y + 170, 'hello · bonjour', {
        size: FONT_SIZE.md,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
      circle(W / 2, y + 206, 0),
      circle(W - P - 36, y + 36, 22, { fill: C.primaryTint }),
      icon('speaker', W - P - 48, y + 24, 24, C.primary),
    ),
  ];
  y += 232 + SPACING.lg;
  parts.push(
    chipRow(P, y, ['Greetings', 'Interjection', 'Tachelhit'], {
      size: FONT_SIZE.xs + 1,
      h: 32,
    }),
  );
  y += 32 + SPACING.xl + 8;
  parts.push(
    text(P, y, 'Example', { size: FONT_SIZE.lg, weight: 600 }),
    g(
      'ExampleCard',
      card(P, y + SPACING.md, W - P * 2, 104),
      text(P + SPACING.lg, y + 52, tif('azul fllawn'), {
        size: FONT_SIZE.xl,
        font: 'tif',
      }),
      text(P + SPACING.lg, y + 76, 'azul fllawn', {
        size: FONT_SIZE.sm,
        weight: 500,
        fill: C.textSecondary,
      }),
      text(P + SPACING.lg, y + 98, 'hello to you', {
        size: FONT_SIZE.sm,
        fill: C.textPrimary,
      }),
    ),
    g(
      'ReviewNotice',
      rect(P, y + 136, W - P * 2, 52, { r: RADIUS.sm, fill: C.primaryTint }),
      icon('info', P + SPACING.md, y + 151, 22, C.primaryPressed),
      text(P + 44, y + 167, 'Pending native-speaker review', {
        size: FONT_SIZE.sm - 1,
        weight: 500,
        fill: C.primaryPressed,
      }),
    ),
    button(P, y + 212, W - P * 2, 'Practise with flashcards', {
      variant: 'outline',
      icon: 'cards',
    }),
    tabBar(ctx, 'Vocabulary'),
    homeIndicator(ctx),
  );
  return parts;
});

function flashcard(ctx, revealed) {
  const { W, P, H, bottom } = ctx;
  const h = header(ctx, 'Flashcards', { close: true });
  const y = h.bottom + SPACING.sm;
  const cardH = H - y - bottom - 52 - SPACING.xl * 2 - 64;
  const cy = y + 40 + cardH / 2;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(W - P, ctx.top + 36, '3/10', {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.textSecondary,
      anchor: 'end',
    }),
    progressBar(P, y, W - P * 2, 0.3, C.primary),
    rect(P + 16, y + 52, W - P * 2 - 32, cardH, {
      r: RADIUS.lg,
      fill: C.border,
    }),
    g(
      `Flashcard / ${revealed ? 'back' : 'front'}`,
      rect(P, y + 40, W - P * 2, cardH, {
        r: RADIUS.lg,
        fill: C.surface,
        stroke: revealed ? C.primary : C.border,
        sw: revealed ? 2 : 1,
      }),
      text(W / 2, cy - (revealed ? 60 : 10), tif('tanmirt'), {
        size: revealed ? 40 : 56,
        font: 'tif',
        fill: C.primary,
        anchor: 'middle',
      }),
      text(W / 2, cy + (revealed ? -18 : 40), 'tanmirt', {
        size: FONT_SIZE.lg,
        weight: 600,
        anchor: 'middle',
      }),
      revealed
        ? [
            rect(P + 48, cy + 6, W - P * 2 - 96, 1, { fill: C.border }),
            text(W / 2, cy + 52, 'thank you', {
              size: FONT_SIZE.xxl - 2,
              weight: 700,
              anchor: 'middle',
            }),
            text(W / 2, cy + 80, 'merci', {
              size: FONT_SIZE.md,
              fill: C.textSecondary,
              anchor: 'middle',
            }),
          ]
        : text(W / 2, y + 40 + cardH - 28, 'Tap to reveal', {
            size: FONT_SIZE.sm,
            fill: C.textSecondary,
            anchor: 'middle',
          }),
    ),
  ];
  const by = H - bottom - 52 - SPACING.xl;
  if (revealed) {
    const bw = (W - P * 2 - SPACING.md) / 2;
    parts.push(
      button(P, by, bw, 'Review again', {
        variant: 'outline',
        icon: 'refresh',
      }),
      button(P + bw + SPACING.md, by, bw, 'I knew it', {
        variant: 'success',
        icon: 'check',
      }),
    );
  } else parts.push(button(P, by, W - P * 2, 'Reveal'));
  parts.push(homeIndicator(ctx));
  return parts;
}
screen(DOCS.vocab, 'Flashcards — front', ctx => flashcard(ctx, false));
screen(DOCS.vocab, 'Flashcards — back', ctx => flashcard(ctx, true));

const ALPHABET = [
  'a',
  'b',
  'g',
  'gʷ',
  'd',
  'ḍ',
  'e',
  'f',
  'k',
  'kʷ',
  'h',
  'ḥ',
  'ɛ',
  'x',
  'q',
  'i',
  'j',
  'l',
  'm',
  'n',
  'u',
  'r',
  'ṛ',
  'ɣ',
  's',
  'ṣ',
  'c',
  't',
  'ṭ',
  'w',
  'y',
  'z',
  'ẓ',
];

screen(DOCS.vocab, 'Tifinagh alphabet', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Tifinagh', { back: false, large: true });
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y, `${ALPHABET.length} letters · IRCAM standard`, {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
    }),
    chip(W - P - 104, y - 24, 'Quiz', { icon: 'target', selected: true }).svg,
  ];
  y += SPACING.lg;
  const cols = 6;
  const gap = SPACING.sm;
  const tile = (W - P * 2 - gap * (cols - 1)) / cols;
  ALPHABET.forEach((l, i) => {
    const x = P + (i % cols) * (tile + gap);
    const ty = y + Math.floor(i / cols) * (tile + 14 + gap);
    const sel = l === 'z';
    parts.push(
      g(
        `LetterTile / ${l}${sel ? ' / selected' : ''}`,
        card(x, ty, tile, tile + 14, {
          state: sel ? 'selected' : 'default',
          r: RADIUS.sm + 4,
        }),
        text(x + tile / 2, ty + tile / 2 + 8, tif(l), {
          size: tile * 0.42,
          font: 'tif',
          fill: sel ? C.secondary : C.textPrimary,
          anchor: 'middle',
        }),
        text(x + tile / 2, ty + tile + 4, l, {
          size: FONT_SIZE.xs,
          weight: 500,
          fill: C.textSecondary,
          anchor: 'middle',
        }),
      ),
    );
  });
  parts.push(tabBar(ctx, 'Tifinagh'), homeIndicator(ctx));
  return parts;
});

screen(DOCS.vocab, 'Letter details', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, '');
  let y = h.bottom;
  const facts = [
    ['Name', 'ya'],
    ['Latin', 'a'],
    ['Sound', '/a/'],
    ['Unicode', 'U+2D30'],
  ];
  const fw = (W - P * 2 - SPACING.sm) / 2;
  const parts = [
    statusBar(ctx),
    h.svg,
    g(
      'LetterHero',
      rect(P, y, W - P * 2, 220, { r: RADIUS.lg, fill: C.primary }),
      motif(P + 24, y + 190, W - P * 2 - 48, C.primaryLight, 7, 0.5),
      text(W / 2, y + 140, 'ⴰ', {
        size: 120,
        font: 'tif',
        fill: C.textInverse,
        anchor: 'middle',
      }),
    ),
  ];
  y += 220 + SPACING.lg;
  facts.forEach(([k, v], i) => {
    const x = P + (i % 2) * (fw + SPACING.sm);
    const fy = y + Math.floor(i / 2) * (68 + SPACING.sm);
    parts.push(
      g(
        `Fact / ${k}`,
        card(x, fy, fw, 68),
        text(x + SPACING.lg, fy + 26, k, {
          size: FONT_SIZE.xs,
          fill: C.textSecondary,
        }),
        text(x + SPACING.lg, fy + 52, v, { size: FONT_SIZE.lg, weight: 600 }),
      ),
    );
  });
  y += 68 * 2 + SPACING.sm + SPACING.xl + 8;
  parts.push(
    text(P, y, 'In a word', { size: FONT_SIZE.lg, weight: 600 }),
    wordCard(ctx, y + SPACING.md, WORDS[0]),
    button(P, y + 108, W - P * 2, 'Practise in quiz', {
      variant: 'outline',
      icon: 'target',
    }),
    tabBar(ctx, 'Tifinagh'),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.vocab, 'Letter quiz', ctx => {
  const { W, P } = ctx;
  let y = ctx.top + SPACING.sm + 116;
  const parts = [
    statusBar(ctx),
    exerciseTop(ctx, 4, 10, 'Letter quiz'),
    text(P, y, 'Which sound is this letter?', {
      size: FONT_SIZE.xl,
      weight: 600,
    }),
    g(
      'GlyphCard',
      card(P, y + 24, W - P * 2, 168, { r: RADIUS.lg }),
      text(W / 2, y + 150, 'ⵣ', {
        size: 96,
        font: 'tif',
        fill: C.primary,
        anchor: 'middle',
      }),
    ),
  ];
  y += 216;
  const opts = ['s', 'z', 'ẓ', 'r'];
  const ow = (W - P * 2 - SPACING.md) / 2;
  opts.forEach((o, i) => {
    const x = P + (i % 2) * (ow + SPACING.md);
    const oy = y + Math.floor(i / 2) * (72 + SPACING.md);
    const st = o === 'z' ? 'correct' : 'default';
    parts.push(
      g(
        `QuizOption / ${o} / ${st}`,
        card(x, oy, ow, 72, { state: st }),
        text(x + ow / 2, oy + 45, o, {
          size: FONT_SIZE.xl,
          weight: 600,
          fill: st === 'correct' ? C.accent : C.textPrimary,
          anchor: 'middle',
        }),
      ),
    );
  });
  parts.push(feedbackBanner(ctx, true, { xp: 5 }), homeIndicator(ctx));
  return parts;
});

// Profile & Gamification -----------------------------------------------------
screen(DOCS.profile, 'Profile', ctx => {
  const { W, P } = ctx;
  let y = ctx.top + SPACING.xl;
  const cx = W / 2;
  const sw = (W - P * 2 - SPACING.sm * 2) / 3;
  const dch = chip(cx - 60, y + 156, 'Tachelhit', {
    icon: 'globe',
    h: 32,
    size: FONT_SIZE.xs + 1,
    fill: C.primaryTint,
    fg: C.primaryPressed,
    stroke: 'none',
  });
  const parts = [
    statusBar(ctx),
    circle(cx, y + 48, 48, { fill: C.primary }),
    text(cx, y + 64, 'T', {
      size: 40,
      weight: 600,
      fill: C.textInverse,
      anchor: 'middle',
    }),
    text(cx, y + 124, 'Tiziri', {
      size: FONT_SIZE.xl,
      weight: 700,
      anchor: 'middle',
    }),
    text(cx, y + 146, 'tiziri@example.com', {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
      anchor: 'middle',
    }),
    dch.svg,
  ];
  y += 208;
  parts.push(
    statTile(P, y, sw, 'star', '120', 'total XP', C.primaryLight),
    statTile(P + sw + SPACING.sm, y, sw, 'flame', '5', 'day streak', C.primary),
    statTile(
      P + (sw + SPACING.sm) * 2,
      y,
      sw,
      'trophy',
      '12',
      'best streak',
      C.secondary,
    ),
  );
  y += 88 + SPACING.xl;
  parts.push(
    listRow(ctx, y, 'trophy', 'Achievements', { value: '1/4' }),
    listRow(ctx, y + 68, 'chart', 'Statistics'),
    listRow(ctx, y + 136, 'settings', 'Settings'),
    button(P, y + 220, W - P * 2, 'Sign out', {
      variant: 'outline',
      color: C.danger,
      icon: 'logout',
    }),
    tabBar(ctx, 'Profile'),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.profile, 'Settings', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Settings');
  let y = h.bottom + SPACING.sm;
  const section = (label, yy) =>
    text(P, yy, label.toUpperCase(), {
      size: FONT_SIZE.xs,
      weight: 600,
      fill: C.textSecondary,
    });
  const segW = (W - P * 2 - 8) / 2;
  const parts = [
    statusBar(ctx),
    h.svg,
    section('App language', y),
    g(
      'SegmentedControl / language',
      rect(P, y + 12, W - P * 2, 48, { r: RADIUS.md, fill: C.border }),
      rect(P + 4, y + 16, segW, 40, { r: RADIUS.md - 4, fill: C.surface }),
      text(P + 4 + segW / 2, y + 42, 'English', {
        size: FONT_SIZE.sm,
        weight: 600,
        anchor: 'middle',
      }),
      text(P + 4 + segW * 1.5, y + 42, 'Français', {
        size: FONT_SIZE.sm,
        weight: 500,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
    ),
  ];
  y += 60 + SPACING.xl + 8;
  parts.push(
    section('Learning', y),
    listRow(ctx, y + 12, 'globe', 'Dialect', { value: 'Tachelhit' }),
    listRow(ctx, y + 80, 'target', 'Daily goal', { value: '10 min' }),
    listRow(ctx, y + 148, 'eye', 'Latin transcription', {
      chevron: false,
      right: toggle(W - P - 64, y + 162, true),
    }),
  );
  y += 148 + 60 + SPACING.xl + 8;
  parts.push(
    section('Notifications', y),
    listRow(ctx, y + 12, 'bell', 'Daily reminder', {
      chevron: false,
      right: toggle(W - P - 64, y + 26, false),
    }),
  );
  y += 72 + SPACING.xl + 8;
  parts.push(
    section('About', y),
    listRow(ctx, y + 12, 'info', 'Version', { value: '0.1.0', chevron: false }),
    tabBar(ctx, 'Profile'),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.profile, 'Achievements', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Achievements');
  let y = h.bottom + SPACING.sm;
  const parts = [
    statusBar(ctx),
    h.svg,
    text(P, y + 4, '1 of 4 unlocked', {
      size: FONT_SIZE.sm,
      fill: C.textSecondary,
    }),
  ];
  y += SPACING.xl;
  const list = [
    ['First lesson', 'Complete your first lesson', 'star', 1, 1],
    ['On fire', 'Reach a 7-day streak', 'flame', 5, 7],
    ['Rising star', 'Earn 500 XP', 'sparkles', 120, 500],
    ['Script reader', 'Learn all 33 Tifinagh letters', 'trophy', 1, 33],
  ];
  list.forEach(([t, d, ic, v, max]) => {
    const done = v >= max;
    parts.push(
      g(
        `AchievementCard / ${t} / ${done ? 'unlocked' : 'locked'}`,
        card(P, y, W - P * 2, 96, { state: done ? 'correct' : 'default' }),
        circle(P + 40, y + 48, 26, {
          fill: done ? C.accent : C.background,
          stroke: done ? undefined : C.border,
        }),
        icon(ic, P + 27, y + 35, 26, done ? C.textInverse : C.textSecondary),
        text(P + 80, y + 36, t, { size: FONT_SIZE.md, weight: 600 }),
        text(P + 80, y + 56, d, {
          size: FONT_SIZE.xs + 1,
          fill: C.textSecondary,
        }),
        done
          ? badge(P + 80, y + 64, 'Unlocked', 'accent').svg
          : [
              progressBar(
                P + 80,
                y + 72,
                W - P * 2 - 80 - 64,
                v / max,
                C.primary,
                6,
              ),
              text(W - P - SPACING.lg, y + 78, `${v}/${max}`, {
                size: FONT_SIZE.xs,
                weight: 600,
                fill: C.textSecondary,
                anchor: 'end',
              }),
            ],
      ),
    );
    y += 96 + SPACING.md;
  });
  parts.push(tabBar(ctx, 'Profile'), homeIndicator(ctx));
  return parts;
});

screen(DOCS.profile, 'Statistics', ctx => {
  const { W, P } = ctx;
  const h = header(ctx, 'Statistics');
  let y = h.bottom + SPACING.sm;
  const sw = (W - P * 2 - SPACING.sm) / 2;
  const parts = [
    statusBar(ctx),
    h.svg,
    statTile(P, y, sw, 'star', '120', 'total XP', C.primaryLight),
    statTile(
      P + sw + SPACING.sm,
      y,
      sw,
      'flame',
      '5 days',
      'current streak',
      C.primary,
    ),
    statTile(P, y + 96, sw, 'trophy', '12 days', 'longest streak', C.secondary),
    statTile(
      P + sw + SPACING.sm,
      y + 96,
      sw,
      'target',
      '10 min',
      'daily goal',
      C.accent,
    ),
  ];
  y += 192 + SPACING.lg;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const xp = [20, 45, 0, 25, 30, 0, 20];
  const chartH = 120;
  const bw = (W - P * 2 - 32 - 6 * 12) / 7;
  parts.push(
    g(
      'WeeklyXPChart',
      card(P, y, W - P * 2, 216),
      text(P + SPACING.lg, y + 30, 'XP this week', {
        size: FONT_SIZE.md,
        weight: 600,
      }),
      text(W - P - SPACING.lg, y + 30, '140 XP', {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.primary,
        anchor: 'end',
      }),
      days.map((d, i) => {
        const x = P + SPACING.lg + i * (bw + 12);
        const bh = Math.max(4, (xp[i] / 45) * chartH);
        return [
          rect(x, y + 52 + chartH - bh, bw, bh, {
            r: 6,
            fill: xp[i] ? (i === 6 ? C.primary : C.primaryLight) : C.border,
          }),
          text(x + bw / 2, y + 52 + chartH + 22, d, {
            size: FONT_SIZE.xs,
            fill: C.textSecondary,
            anchor: 'middle',
          }),
        ];
      }),
    ),
  );
  y += 216 + SPACING.lg;
  parts.push(
    listRow(ctx, y, 'globe', 'Dialect', { value: 'Tachelhit', chevron: false }),
    listRow(ctx, y + 68, 'target', 'Learning goal', {
      value: 'Family',
      chevron: false,
    }),
    tabBar(ctx, 'Profile'),
    homeIndicator(ctx),
  );
  return parts;
});

screen(DOCS.profile, 'Daily goal celebration', ctx => {
  const { W, P, H, bottom } = ctx;
  const sheetH = 380;
  const y = H - sheetH;
  return [
    ...dashboard(ctx, false),
    rect(0, 0, W, H, { fill: C.textPrimary, opacity: 0.5 }),
    g(
      'BottomSheet / celebration',
      rect(0, y, W, sheetH + RADIUS.lg, { r: RADIUS.lg, fill: C.surface }),
      rect(W / 2 - 20, y + 10, 40, 4, { r: 2, fill: C.border }),
      motif(0, y + 30, W, C.primary, 8, 0.25),
      circle(W / 2, y + 102, 44, { fill: C.primaryTint }),
      icon('flame', W / 2 - 26, y + 76, 52, C.primary, { sw: 1.8 }),
      text(W / 2, y + 180, 'Daily goal reached', {
        size: FONT_SIZE.xl,
        weight: 700,
        anchor: 'middle',
      }),
      text(W / 2, y + 208, '6-day streak — keep it going tomorrow.', {
        size: FONT_SIZE.sm,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
      chip(W / 2 - 48, y + 228, '+20 XP', {
        fill: C.primary,
        fg: C.textInverse,
        icon: 'star',
      }).svg,
      button(P, H - bottom - 52 - SPACING.lg, W - P * 2, 'Keep going'),
    ),
    homeIndicator(ctx),
  ];
});

// ─── Design system board ────────────────────────────────────────────────────
function contrast(a, b) {
  const lum = hex => {
    const [r, gg, bb] = [1, 3, 5]
      .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function designSystemBoard() {
  const W = 1440;
  const P = 64;
  const parts = [];
  let y = 72;
  const h2 = (t, sub) => {
    parts.push(text(P, y, t, { size: 32, weight: 700 }));
    if (sub)
      parts.push(
        text(P, y + 30, sub, { size: FONT_SIZE.md, fill: C.textSecondary }),
      );
    y += sub ? 64 : 44;
  };
  parts.push(
    text(P, y, 'Amazigh Learning — Design System', { size: 40, weight: 700 }),
    text(
      P,
      y + 36,
      'Tokens and components from docs/UI_UX_GUIDELINES.md · mirrors src/theme',
      { size: FONT_SIZE.lg, fill: C.textSecondary },
    ),
    text(W - P, y, tif('azul'), {
      size: 40,
      font: 'tif',
      fill: C.primary,
      anchor: 'end',
    }),
    motif(P, y + 64, W - P * 2, C.primary, 10, 0.3),
  );
  y += 140;

  h2(
    'Color',
    `Amazigh flag palette. Contrast ratios are text on background ${C.background} (AA needs 4.5:1 for body text).`,
  );
  const n = (a, b) => (VARIANT_B ? b : a);
  const swatches = [
    ['primary', n('Saffron / ochre', 'Forest green'), C.primary],
    ['secondary', n('Atlas blue', 'Terracotta'), C.secondary],
    ['accent', n('Argan green', 'Success (forest green)'), C.accent],
    ['danger', 'Flag ⵣ red', C.danger],
    ['textPrimary', n('Text', 'Indigo (text)'), C.textPrimary],
    ['textSecondary', 'Text secondary', C.textSecondary],
    ['primaryLight', n('Saffron light', 'Ochre'), C.primaryLight],
    ['secondaryLight', n('Atlas light', 'Terracotta light'), C.secondaryLight],
    ['accentLight', n('Argan light', 'Forest light'), C.accentLight],
    ['dangerLight', 'Red light', C.dangerLight],
    ['background', n('Warm off-white', 'Sand'), C.background],
    ['border', 'Border', C.border],
  ];
  const sw = (W - P * 2 - 5 * 24) / 6;
  swatches.forEach(([token, name, hex], i) => {
    const x = P + (i % 6) * (sw + 24);
    const yy = y + Math.floor(i / 6) * 196;
    const ratio = contrast(hex, C.background);
    parts.push(
      g(
        `Swatch / ${token}`,
        rect(x, yy, sw, 104, { r: RADIUS.md, fill: hex, stroke: C.border }),
        text(x, yy + 128, `color.${token}`, {
          size: FONT_SIZE.sm,
          weight: 600,
        }),
        text(x, yy + 148, `${name} · ${hex}`, {
          size: FONT_SIZE.xs + 1,
          fill: C.textSecondary,
        }),
        text(
          x,
          yy + 168,
          `${ratio.toFixed(1)}:1 ${
            ratio >= 4.5
              ? 'AA text'
              : ratio >= 3
              ? 'AA large / UI'
              : 'decorative only'
          }`,
          {
            size: FONT_SIZE.xs,
            weight: 600,
            fill:
              ratio >= 4.5
                ? C.accent
                : ratio >= 3
                ? C.primaryPressed
                : C.textSecondary,
          },
        ),
      ),
    );
  });
  y += 196 * 2 + 32;

  h2(
    'Typography',
    `${
      VARIANT_B ? 'Inter' : 'Poppins'
    } for Latin script · Noto Sans Tifinagh for Tifinagh (always visible).`,
  );
  const scale = [
    ['xxl', FONT_SIZE.xxl, 700, 'Lesson complete!'],
    ['xl', FONT_SIZE.xl, 600, 'Which word means “hello”?'],
    ['lg', FONT_SIZE.lg, 600, 'Continue learning'],
    [
      'md',
      FONT_SIZE.md,
      400,
      'Short, interactive lessons with instant feedback.',
    ],
    ['sm', FONT_SIZE.sm, 500, 'Azul basics · Module 1 · 12 min'],
    ['xs', FONT_SIZE.xs, 600, 'CONTINUE LEARNING'],
  ];
  scale.forEach(([k, s, w, sample], i) => {
    const yy = y + i * 52;
    parts.push(
      text(P, yy + 20, `fontSize.${k}`, {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.textSecondary,
      }),
      text(P + 150, yy + 20, `${s}px · ${w}`, {
        size: FONT_SIZE.sm,
        fill: C.textSecondary,
      }),
      text(P + 290, yy + 20, sample, { size: s, weight: w }),
    );
  });
  const tx = 900;
  parts.push(
    g(
      'Tifinagh specimen',
      rect(tx, y - 8, W - P - tx, 300, {
        r: RADIUS.lg,
        fill: C.surface,
        stroke: C.border,
      }),
      text(tx + 32, y + 28, 'Noto Sans Tifinagh', {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.textSecondary,
      }),
      text(tx + 32, y + 110, tif('azul'), {
        size: 64,
        font: 'tif',
        fill: C.primary,
      }),
      text(tx + 32, y + 150, 'Script-first: glyph above, Latin below', {
        size: FONT_SIZE.sm,
        fill: C.textSecondary,
      }),
      text(
        tx + 32,
        y + 210,
        ALPHABET.slice(0, 17)
          .map(l => tif(l))
          .join(' '),
        { size: 26, font: 'tif' },
      ),
      text(
        tx + 32,
        y + 256,
        ALPHABET.slice(17)
          .map(l => tif(l))
          .join(' '),
        { size: 26, font: 'tif' },
      ),
    ),
  );
  y += 340;

  h2('Spacing & radius', '4-pt scale. Touch targets are at least 44×44 pt.');
  Object.entries(SPACING).forEach(([k, v], i) => {
    const x = P + i * 110;
    parts.push(
      rect(x, y + 40 - v, v, v, { fill: C.secondaryLight }),
      text(x, y + 68, `spacing.${k}`, { size: FONT_SIZE.xs + 1, weight: 600 }),
      text(x, y + 86, `${v}px`, { size: FONT_SIZE.xs, fill: C.textSecondary }),
    );
  });
  Object.entries(RADIUS).forEach(([k, v], i) => {
    const x = 800 + i * 150;
    parts.push(
      rect(x, y - 20, 96, 64, {
        r: v,
        fill: C.surface,
        stroke: C.primary,
        sw: 2,
      }),
      text(x, y + 68, `radius.${k}`, { size: FONT_SIZE.xs + 1, weight: 600 }),
      text(x, y + 86, `${v}px`, { size: FONT_SIZE.xs, fill: C.textSecondary }),
    );
  });
  parts.push(
    rect(1270, y - 20, 44, 44, {
      r: RADIUS.sm,
      stroke: C.danger,
      sw: 2,
      dash: '4 4',
    }),
    text(1270, y + 68, 'min target', { size: FONT_SIZE.xs + 1, weight: 600 }),
    text(1270, y + 86, '44×44', { size: FONT_SIZE.xs, fill: C.textSecondary }),
  );
  y += 136;

  h2('Buttons', 'Variants × states: default, pressed, disabled.');
  const bw = 220;
  const variants = [
    ['primary', {}],
    ['secondary', { variant: 'secondary' }],
    ['outline', { variant: 'outline' }],
    ['success', { variant: 'success' }],
    ['danger', { variant: 'danger' }],
  ];
  ['default', 'pressed', 'disabled'].forEach((st, si) =>
    parts.push(
      text(P + 140 + si * (bw + 32), y, st, {
        size: FONT_SIZE.sm,
        weight: 600,
        fill: C.textSecondary,
      }),
    ),
  );
  y += 16;
  variants.forEach(([name, o], vi) => {
    const yy = y + vi * 68;
    parts.push(text(P, yy + 32, name, { size: FONT_SIZE.sm, weight: 600 }));
    ['default', 'pressed', 'disabled'].forEach((st, si) => {
      const x = P + 140 + si * (bw + 32);
      const pressedVariant = st === 'pressed' && name !== 'primary';
      parts.push(
        pressedVariant
          ? g(
              `pressed`,
              button(x, yy, bw, 'Continue', { ...o }),
              rect(x, yy, bw, 52, {
                r: RADIUS.md,
                fill: C.textPrimary,
                opacity: 0.15,
              }),
            )
          : button(x, yy, bw, 'Continue', { ...o, state: st }),
      );
    });
  });
  const ix = 960;
  parts.push(
    text(ix, y - 16, 'Inputs', {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.textSecondary,
    }),
  );
  [
    ['default', { placeholder: 'tiziri@example.com' }],
    ['focused', { value: 'tiziri@exa', state: 'focused' }],
    [
      'error',
      {
        value: 'tiziri@',
        state: 'error',
        helper: 'Enter a valid email address.',
      },
    ],
  ].forEach(([st, o], i) => {
    parts.push(textInput(ix, y + i * 112, 400, `Email — ${st}`, o).svg);
  });
  y += 5 * 68 + 48;

  h2(
    'Cards & feedback',
    'Answer states: default, selected, correct (green), incorrect (red).',
  );
  const cw = 300;
  ['default', 'selected', 'correct', 'incorrect'].forEach((st, i) => {
    const x = P + i * (cw + 24);
    const fg =
      st === 'correct'
        ? C.accent
        : st === 'incorrect'
        ? C.danger
        : st === 'selected'
        ? C.secondary
        : C.textPrimary;
    parts.push(
      g(
        `Card / ${st}`,
        card(x, y, cw, 84, { state: st }),
        text(x + 20, y + 40, tif('azul'), {
          size: FONT_SIZE.xl,
          font: 'tif',
          fill: fg,
        }),
        text(x + 20, y + 66, `azul — ${st}`, {
          size: FONT_SIZE.sm,
          weight: 500,
          fill: C.textSecondary,
        }),
      ),
    );
  });
  y += 120;
  const fctx = { W: 390, H: 0, P: 24, bottom: 0 };
  parts.push(
    `<g transform="translate(${P} ${
      y + 168
    }) translate(0 -168)">${feedbackBanner({ ...fctx, H: 168 }, true, {
      xp: 20,
    })}</g>`,
    `<g transform="translate(${P + 430} ${y})">${feedbackBanner(
      { ...fctx, H: 196 },
      false,
      { answer: 'azul' },
    )}</g>`,
  );
  const cx2 = P + 880;
  parts.push(
    text(cx2, y + 10, 'Chips & badges', {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.textSecondary,
    }),
    chipRow(cx2, y + 24, ['All', 'Greetings', 'Numbers'], { selectedIndex: 0 }),
    badge(cx2, y + 80, 'A1', 'primary').svg,
    badge(cx2 + 48, y + 80, 'Tachelhit', 'neutral').svg,
    badge(cx2 + 144, y + 80, 'Unlocked', 'accent').svg,
    badge(cx2 + 238, y + 80, 'Pending review', 'primary').svg,
    chip(cx2, y + 124, '+20 XP', {
      fill: C.primary,
      fg: C.textInverse,
      icon: 'star',
    }).svg,
    chip(cx2 + 120, y + 124, '5-day streak', { icon: 'flame' }).svg,
    text(cx2, y + 196, 'Progress & switches', {
      size: FONT_SIZE.sm,
      weight: 600,
      fill: C.textSecondary,
    }),
    progressBar(cx2, y + 212, 300, 0.6),
    toggle(cx2 + 320, y + 200, true),
    toggle(cx2 + 384, y + 200, false),
  );
  y += 260;

  h2(
    'Loading, empty & navigation',
    'Skeletons instead of spinners · empty states with an illustration and a call to action.',
  );
  parts.push(
    g(
      'Skeleton / card',
      rect(P, y, 360, 140, { r: RADIUS.md, fill: C.surface, stroke: C.border }),
      skeleton(P + 20, y + 20, 200, 20),
      skeleton(P + 20, y + 52, 300, 14),
      skeleton(P + 20, y + 76, 260, 14),
      skeleton(P + 20, y + 108, 300, 8, 4),
    ),
    `<g transform="translate(${P + 400} ${y - 30})">${emptyState(
      { W: 390, P: 24 },
      0,
      'No words found',
      'Try another spelling, or search in Tifinagh.',
      'Clear search',
    )}</g>`,
    `<g transform="translate(${P + 860} ${y})">${rect(0, 0, 390, 98, {
      r: RADIUS.md,
      fill: C.surface,
      stroke: C.border,
    })}${tabBar({ W: 390, H: 82, bottom: 18 }, 'Learn')}</g>`,
  );
  y += 340;

  h2(
    'Icons & motif',
    '24-pt outline icons (2 pt stroke) · diamond band inspired by Amazigh rugs, used sparingly.',
  );
  Object.keys(ICONS).forEach((n, i) => {
    const x = P + (i % 16) * 82;
    const yy = y + Math.floor(i / 16) * 80;
    parts.push(
      icon(n, x + 20, yy, 28, C.textPrimary),
      text(x + 34, yy + 52, n, {
        size: 11,
        fill: C.textSecondary,
        anchor: 'middle',
      }),
    );
  });
  y += 180;
  parts.push(
    motif(P, y, W - P * 2, C.primary, 14, 1),
    motif(P, y + 44, W - P * 2, C.secondary, 10, 0.4),
  );
  y += 100;

  const H = y;
  return {
    W,
    H,
    svg: [
      rect(0, 0, W, H, { fill: C.background }),
      ...parts.flat(Infinity),
    ].join(''),
  };
}

// ─── Output ─────────────────────────────────────────────────────────────────
const slug = s =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function svgDoc(W, H, title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><title>${esc(
    title,
  )}</title>${body}</svg>\n`;
}

function renderScreen(s, device) {
  const d = DEVICES[device];
  const ctx = { ...d, device };
  const body = [
    rect(0, 0, d.W, d.H, { fill: C.background }),
    ...[s.fn(ctx)].flat(Infinity),
  ].join('');
  return svgDoc(d.W, d.H, `${s.name} — ${d.label}`, body);
}

function main() {
  const withOverview = process.argv.includes('--overview');
  fs.rmSync(OUT, { recursive: true, force: true });
  const manifest = [];
  const ds = designSystemBoard();
  const dsDir = path.join(OUT, slug(DOCS.ds));
  fs.mkdirSync(dsDir, { recursive: true });
  const dsSvg = svgDoc(ds.W, ds.H, 'Design System', ds.svg);
  fs.writeFileSync(path.join(dsDir, 'design-system.svg'), dsSvg);
  manifest.push({
    doc: DOCS.ds,
    name: 'Design System',
    device: 'board',
    file: `${slug(DOCS.ds)}/design-system.svg`,
    svg: dsSvg,
  });

  const counters = {};
  for (const s of SCREENS) {
    counters[s.doc] = (counters[s.doc] ?? 0) + 1;
    const n = String(counters[s.doc]).padStart(2, '0');
    for (const device of Object.keys(DEVICES)) {
      const dir = path.join(OUT, slug(s.doc), device);
      fs.mkdirSync(dir, { recursive: true });
      const file = `${n}-${slug(s.name)}.svg`;
      const svg = renderScreen(s, device);
      fs.writeFileSync(path.join(dir, file), svg);
      manifest.push({
        doc: s.doc,
        name: s.name,
        device,
        file: `${slug(s.doc)}/${device}/${file}`,
        svg,
      });
    }
  }

  if (!VARIANT_B)
    fs.writeFileSync(
      path.join(ROOT, 'tokens.json'),
      `${JSON.stringify(
        {
          color: C,
          fontSize: FONT_SIZE,
          spacing: SPACING,
          radius: RADIUS,
          fontFamily: { latin: 'Poppins', tifinagh: 'Noto Sans Tifinagh' },
          artboards: DEVICES,
        },
        null,
        2,
      )}\n`,
    );

  if (withOverview) writeOverview(manifest);
  const screens = SCREENS.length;
  console.log(
    `Wrote ${manifest.length} SVG artboards (${screens} screens × ${
      Object.keys(DEVICES).length
    } sizes + design system) to ${path.relative(process.cwd(), OUT)}/`,
  );
}

/** Self-contained review page with embedded fonts (not committed). */
function writeOverview(manifest) {
  const fontDir = path.join(ROOT, '..', 'src', 'assets', 'fonts');
  const fontFace = [
    ['Poppins', 400, 'Poppins-Regular'],
    ['Poppins', 500, 'Poppins-Medium'],
    ['Poppins', 600, 'Poppins-SemiBold'],
    ['Poppins', 700, 'Poppins-Bold'],
    ['Noto Sans Tifinagh', 400, 'NotoSansTifinagh-Regular'],
  ]
    .map(([fam, w, file]) => {
      const woff2 = path.join(fontDir, `${file}.woff2`);
      const ttf = path.join(fontDir, `${file}.ttf`);
      const [p, fmt, mime] = fs.existsSync(woff2)
        ? [woff2, 'woff2', 'font/woff2']
        : [ttf, 'truetype', 'font/ttf'];
      const b64 = fs.readFileSync(p).toString('base64');
      return `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:${mime};base64,${b64}) format('${fmt}');}`;
    })
    .join('\n');
  const strip = svg => svg.replace(/^<\?xml[^>]*>\n/, '');
  const docs = [...new Set(manifest.map(m => m.doc))];
  const sections = docs
    .map(doc => {
      const items = manifest.filter(
        m => m.doc === doc && (m.device === 'ios' || m.device === 'board'),
      );
      const cards = items
        .map(m => {
          const android = manifest.find(
            a => a.doc === doc && a.name === m.name && a.device === 'android',
          );
          return `<figure class="${
            m.device === 'board' ? 'board' : 'ab'
          }"><div class="frames"><div class="frame">${strip(m.svg)}</div>${
            android
              ? `<div class="frame android">${strip(android.svg)}</div>`
              : ''
          }</div><figcaption>${esc(m.name)}${
            android ? ' <span>iPhone 14 · Android medium</span>' : ''
          }</figcaption></figure>`;
        })
        .join('');
      return `<section id="${slug(doc)}"><h2>${esc(
        doc.replace(/^\d /, ''),
      )}</h2><div class="grid">${cards}</div></section>`;
    })
    .join('');
  const nav = docs
    .map(d => `<a href="#${slug(d)}">${esc(d.replace(/^\d /, ''))}</a>`)
    .join('');
  const count = manifest.filter(m => m.device === 'ios').length;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Amazigh Learning — UX/UI design boards</title><style>
${fontFace}
*{box-sizing:border-box}body{margin:0;font-family:Poppins,sans-serif;background:#F5F1EA;color:${
    C.textPrimary
  }}
header{position:sticky;top:0;z-index:2;background:${
    C.surface
  };border-bottom:1px solid ${
    C.border
  };padding:16px 32px;display:flex;gap:24px;align-items:center;flex-wrap:wrap}
header h1{font-size:18px;margin:0;font-weight:600}header h1 b{font-family:'Noto Sans Tifinagh';color:${
    C.primary
  };font-weight:400;margin-right:8px}
nav{display:flex;gap:8px;flex-wrap:wrap}nav a{font-size:13px;font-weight:500;color:${
    C.primaryPressed
  };background:${
    C.primaryTint
  };padding:6px 12px;border-radius:999px;text-decoration:none}
label{font-size:13px;margin-left:auto;display:flex;gap:6px;align-items:center}
main{padding:24px 32px 64px}section{margin-bottom:56px}h2{font-size:24px;margin:16px 0 4px}
p.lead{max-width:880px;color:${C.textSecondary};font-size:14px;line-height:1.6}
.grid{display:flex;flex-wrap:wrap;gap:32px}figure{margin:0}figcaption{font-size:13px;font-weight:600;margin-top:8px}figcaption span{font-weight:400;color:${
    C.textSecondary
  };margin-left:6px}
.frames{display:flex;gap:12px;align-items:flex-start}.frame{border-radius:28px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06),0 8px 24px rgba(28,25,23,.08);line-height:0;background:${
    C.background
  }}
.ab .frame svg{width:260px;height:auto}.ab .frame.android svg{width:240px}.ab .frame.android{border-radius:16px;display:none}body.both .ab .frame.android{display:block}
.board .frame{border-radius:12px}.board svg{width:min(1200px,calc(100vw - 64px));height:auto}
</style></head><body><header><h1><b>${tif(
    'azul',
  )}</b>Amazigh Learning — UX/UI design boards</h1><nav>${nav}</nav><label><input type="checkbox" onchange="document.body.classList.toggle('both',this.checked)"> Show Android artboards</label></header><main>
<p class="lead">${count} screens from the docs/UI_UX_GUIDELINES.md inventory, each as an iPhone 14 (390×844) and Android medium (360×800) artboard. All artboards are SVGs in <code>design/xd/</code>: import them into Adobe XD with File → Import, one XD document per folder. Sample words are from the repository's unvalidated starter vocabulary (#85). Profile names and stats are fictional.</p>
${sections}</main></body></html>`;
  fs.writeFileSync(path.join(ROOT, 'overview.html'), html);
  console.log(
    `Wrote design/overview.html (${Math.round(html.length / 1024)} KB)`,
  );
}

main();
