// Converts the generated SVG artboards into a JSON node tree the XD plugin can rebuild natively.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import svgpath from 'svgpath';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  preserveOrder: true,
  trimValues: false,
});
const num = v => (v === undefined ? undefined : parseFloat(v));

function parseTransform(t) {
  let M = { s: 1, tx: 0, ty: 0 };
  if (!t) return M;
  const re = /(translate|scale)\(([^)]*)\)/g;
  let m,
    used = 0;
  while ((m = re.exec(t))) {
    used += m[0].length;
    const v = m[2].trim().split(/[ ,]+/).map(Number);
    if (m[1] === 'translate') M = compose(M, { s: 1, tx: v[0], ty: v[1] || 0 });
    else {
      if (v.length > 1 && v[1] !== v[0])
        throw new Error('Non-uniform scale ' + t);
      M = compose(M, { s: v[0], tx: 0, ty: 0 });
    }
  }
  if (
    t.replace(/\s+/g, '').length !==
    t.replace(/(translate|scale)\([^)]*\)/g, '').replace(/\s+/g, '').length +
      t
        .match(/(translate|scale)\([^)]*\)/g)
        .join('')
        .replace(/\s+/g, '').length
  )
    throw new Error('Unsupported transform ' + t);
  return M;
}
function compose(p, c) {
  return { s: p.s * c.s, tx: p.tx + p.s * c.tx, ty: p.ty + p.s * c.ty };
}

function style(a, M) {
  const o = {};
  if (a.fill && a.fill !== 'none') o.fill = a.fill;
  if (a.stroke && a.stroke !== 'none') {
    o.stroke = a.stroke;
    o.sw = (num(a['stroke-width']) ?? 1) * M.s;
    if (a['stroke-linecap']) o.cap = a['stroke-linecap'];
    if (a['stroke-linejoin']) o.join = a['stroke-linejoin'];
    if (a['stroke-dasharray'])
      o.dash = a['stroke-dasharray'].split(/[ ,]+/).map(Number);
  }
  if (a.opacity !== undefined) o.op = +a.opacity;
  return o;
}

const WEIGHT = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

const INHERIT = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'fill-rule',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
];
function walk(items, M, out, inh = {}) {
  for (const it of items) {
    const tag = Object.keys(it).find(k => k !== ':@');
    const own = it[':@'] || {};
    const a = { ...inh, ...own };
    if (inh.opacity !== undefined && own.opacity === undefined)
      delete a.opacity;
    if (tag === 'g') {
      const g = { t: 'g', name: a.id || 'Group', ch: [] };
      if (a.opacity !== undefined) g.op = +a.opacity;
      walk(
        it.g,
        compose(M, parseTransform(own.transform)),
        g.ch,
        Object.fromEntries(
          INHERIT.filter(k => a[k] !== undefined).map(k => [k, a[k]]),
        ),
      );
      if (g.ch.length) out.push(g);
    } else if (tag === 'rect') {
      out.push({
        t: 'rect',
        x: M.tx + M.s * num(a.x),
        y: M.ty + M.s * num(a.y),
        w: M.s * num(a.width),
        h: M.s * num(a.height),
        r: M.s * (num(a.rx) || 0),
        ...style(a, M),
      });
    } else if (tag === 'circle') {
      out.push({
        t: 'ellipse',
        cx: M.tx + M.s * num(a.cx),
        cy: M.ty + M.s * num(a.cy),
        r: M.s * num(a.r),
        ...style(a, M),
      });
    } else if (tag === 'path') {
      const dd = svgpath(a.d)
        .matrix([M.s, 0, 0, M.s, M.tx, M.ty])
        .abs()
        .round(2)
        .toString();
      out.push({
        t: 'path',
        d: dd,
        ...style(a, M),
        ...(a['fill-rule'] ? { rule: a['fill-rule'] } : {}),
      });
    } else if (tag === 'text') {
      const str = (it.text || []).map(n => n['#text'] ?? '').join('');
      const fam = a['font-family'].split(',')[0].replace(/'/g, '').trim();
      out.push({
        t: 'text',
        x: M.tx + M.s * num(a.x),
        y: M.ty + M.s * num(a.y),
        s: M.s * num(a['font-size']),
        fam,
        wt: WEIGHT[a['font-weight']] || 'Regular',
        fill: a.fill,
        anchor: a['text-anchor'] || 'start',
        str: decode(String(str)),
        ...(a.opacity !== undefined ? { op: +a.opacity } : {}),
      });
    } else if (tag === 'title' || tag === '#text' || tag === '?xml') {
    } else throw new Error('Unsupported tag ' + tag);
  }
}
const decode = s =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

function convert(file) {
  const doc = parser.parse(fs.readFileSync(file, 'utf8'));
  const svg = doc.find(n => n.svg);
  const a = svg[':@'];
  const title = (svg.svg.find(n => n.title)?.title || [])
    .map(n => n['#text'])
    .join('');
  const ch = [];
  walk(svg.svg, { s: 1, tx: 0, ty: 0 }, ch);
  return { title: decode(title), w: +a.width, h: +a.height, ch };
}

const DESIGN = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = {};
for (const v of ['A', 'B']) {
  const root = path.join(DESIGN, v === 'A' ? 'xd' : 'xd-variant-b');
  const boards = [];
  for (const doc of fs.readdirSync(root).sort()) {
    const dir = doc.startsWith('1-')
      ? path.join(root, doc)
      : path.join(root, doc, 'ios');
    for (const f of fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.svg'))
      .sort()) {
      boards.push({
        doc,
        file: f.replace('.svg', ''),
        ...convert(path.join(dir, f)),
      });
    }
  }
  out[v] = boards;
}
fs.writeFileSync(
  path.join(DESIGN, 'xd-plugin', 'plugin', 'data.js'),
  `module.exports = ${JSON.stringify(out)};\n`,
);
const count = n => n.reduce((s, x) => s + 1 + (x.ch ? count(x.ch) : 0), 0);
for (const v of ['A', 'B'])
  console.log(
    v,
    out[v].length,
    'boards',
    out[v].reduce((s, b) => s + count(b.ch), 0),
    'nodes',
  );
