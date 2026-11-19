/*
 * Amazigh Learning UI — Adobe XD plugin.
 * Rebuilds the SVG artboards in design/xd (variant A: app tokens + Poppins)
 * and the master-prompt palette (variant B: forest green/terracotta/ochre/
 * sand/indigo + Inter) as native, editable XD layers. Node data comes from
 * data.json, produced by design/xd-plugin/convert.mjs.
 */
const sg = require('scenegraph');
const { Artboard, Rectangle, Ellipse, Path, Text, Color, GraphicNode } = sg;
const commands = require('commands');
const { localFileSystem } = require('uxp').storage;

const VARIANTS = {
  A: 'Variant A — current app palette · Poppins',
  B: 'Variant B — master prompt palette · Inter',
};
const COL_GAP = 120;
const ROW_GAP = 400;
const ROW_B = 3500;
const OURS = /^[AB] \/ /;
const fontIssues = new Set();
const errors = [];

function col(hex) {
  return new Color(hex);
}

function applyStyle(n, o) {
  if (o.fill) {
    n.fillEnabled = true;
    n.fill = col(o.fill);
  } else n.fillEnabled = false;
  if (o.stroke) {
    n.strokeEnabled = true;
    n.stroke = col(o.stroke);
    n.strokeWidth = o.sw;
    try {
      n.strokePosition = GraphicNode.CENTER_STROKE;
    } catch (e) {}
    if (o.cap)
      try {
        n.strokeEndCaps =
          o.cap === 'round'
            ? GraphicNode.STROKE_CAP_ROUND
            : o.cap === 'square'
            ? GraphicNode.STROKE_CAP_SQUARE
            : GraphicNode.STROKE_CAP_NONE;
      } catch (e) {}
    if (o.join)
      try {
        n.strokeJoins =
          o.join === 'round'
            ? GraphicNode.STROKE_JOIN_ROUND
            : o.join === 'bevel'
            ? GraphicNode.STROKE_JOIN_BEVEL
            : GraphicNode.STROKE_JOIN_MITER;
      } catch (e) {}
    if (o.dash)
      try {
        n.strokeDashArray = o.dash;
      } catch (e) {}
  } else n.strokeEnabled = false;
  if (o.op !== undefined) n.opacity = o.op;
}

const STYLE_ALIASES = {
  Regular: ['Regular'],
  Medium: ['Medium', 'Regular'],
  SemiBold: ['SemiBold', 'Semi Bold', 'Semibold', 'Bold'],
  Bold: ['Bold', 'SemiBold'],
};
function setFont(t, fam, wt) {
  for (const st of (STYLE_ALIASES[wt] || [wt]).concat(['Regular'])) {
    try {
      t.fontFamily = fam;
      t.fontStyle = st;
      return;
    } catch (e) {}
  }
  fontIssues.add(fam + ' ' + wt);
}

function makeNode(o, ab) {
  let n;
  if (o.t === 'rect') {
    n = new Rectangle();
    n.width = Math.max(0.5, o.w);
    n.height = Math.max(0.5, o.h);
    if (o.r) n.setAllCornerRadii(Math.min(o.r, o.w / 2, o.h / 2));
    applyStyle(n, o);
    ab.addChild(n);
    n.moveInParentCoordinates(o.x, o.y);
    n.name =
      o.fill && o.w === ab.width && o.h === ab.height && o.x === 0 && o.y === 0
        ? 'Background'
        : 'Rectangle';
  } else if (o.t === 'ellipse') {
    n = new Ellipse();
    n.radiusX = o.r;
    n.radiusY = o.r;
    applyStyle(n, o);
    ab.addChild(n);
    n.moveInParentCoordinates(o.cx - o.r, o.cy - o.r);
    n.name = 'Ellipse';
  } else if (o.t === 'path') {
    n = new Path();
    n.pathData = o.d;
    applyStyle(n, o);
    ab.addChild(n);
    n.name = 'Path';
  } else if (o.t === 'text') {
    if (!o.str || !o.str.trim()) return null;
    n = new Text();
    n.text = o.str;
    setFont(n, o.fam, o.wt);
    n.fontSize = o.s;
    n.fill = col(o.fill || '#000000');
    n.textAlign =
      o.anchor === 'middle'
        ? Text.ALIGN_CENTER
        : o.anchor === 'end'
        ? Text.ALIGN_RIGHT
        : Text.ALIGN_LEFT;
    if (o.op !== undefined) n.opacity = o.op;
    ab.addChild(n);
    n.moveInParentCoordinates(o.x, o.y);
    n.name = o.str.slice(0, 40);
  } else if (o.t === 'g') {
    const kids = [];
    for (const c of o.ch) {
      const k = makeNode(c, ab);
      if (k) kids.push(k);
    }
    if (!kids.length) return null;
    sg.selection.items = kids;
    commands.group();
    n = sg.selection.items[0];
    n.name = o.name;
    if (o.op !== undefined) n.opacity = o.op;
  }
  return n;
}

function clearOurs(root, variants) {
  const doomed = [];
  const re = new RegExp('^(Label )?[' + variants.join('') + '] \\/ ');
  root.children.forEach(n => {
    if (re.test(n.name)) doomed.push(n);
  });
  doomed.forEach(n => n.removeFromParent());
}

function lastArtboardIndex(root) {
  let idx = 0;
  root.children.forEach((n, i) => {
    if (n instanceof Artboard) idx = i + 1;
  });
  return idx;
}

let DATA = null;
function loadData() {
  if (!DATA) DATA = require('./data.js');
  return DATA;
}

function buildVariants(root, variants, limit) {
  const lines = [];
  try {
    const data = loadData();
    clearOurs(root, variants);
    let y = 0,
      boards = 0;
    const labels = [];
    for (const v of Object.keys(VARIANTS)) {
      if (v === 'B') y = ROW_B;
      if (variants.indexOf(v) < 0) continue;
      labels.push([v, y]);
      let x = 0,
        rowH = 0;
      for (const b of data[v].slice(0, limit || 999)) {
        try {
          const ab = new Artboard();
          ab.width = b.w;
          ab.height = b.h;
          ab.fill = col('#FFFFFF');
          ab.name = v + ' / ' + b.doc + ' / ' + b.file + ' — ' + b.title;
          root.addChild(ab, lastArtboardIndex(root));
          ab.moveInParentCoordinates(
            x - ab.globalBounds.x,
            y - ab.globalBounds.y,
          );
          for (const c of b.ch) makeNode(c, ab);
          x += b.w + COL_GAP;
          rowH = Math.max(rowH, b.h);
          boards++;
        } catch (e) {
          errors.push(v + '/' + b.file + ': ' + e.message);
        }
      }
      y += rowH + ROW_GAP;
    }
    labels.forEach(([v, ly]) => {
      try {
        const t = new Text();
        t.text = VARIANTS[v];
        setFont(t, 'Inter', 'Bold');
        t.fontSize = 64;
        t.fill = col('#1C1917');
        root.addChild(t);
        t.name = 'Label ' + v + ' / ' + VARIANTS[v];
        t.moveInParentCoordinates(
          0 - t.globalBounds.x,
          ly - 120 - t.globalBounds.y,
        );
      } catch (e) {
        errors.push('Label ' + v + ': ' + e.message);
      }
    });
    sg.selection.items = [];
    try {
      require('viewport').zoomToRect({
        x: -200,
        y: -300,
        width: 6000,
        height: y,
      });
    } catch (e) {}
    lines.push(boards + ' artboards built.');
  } catch (e) {
    lines.push('Build failed: ' + e.message, String(e.stack || ''));
  }
  if (fontIssues.size)
    lines.push(
      'Missing fonts: ' +
        Array.from(fontIssues).join(', ') +
        ' (restart XD after installing fonts).',
    );
  if (errors.length) lines.push('Errors:\n' + errors.join('\n'));
  return report(lines);
}

function buildAmazighA(selection, root) {
  return buildVariants(root || sg.root, ['A']);
}
function buildAmazighB(selection, root) {
  return buildVariants(root || sg.root, ['B']);
}
function buildAmazighTest(selection, root) {
  return buildVariants(root || sg.root, ['A'], 3);
}

function selectHome(selection, root) {
  root = root || sg.root;
  const ab = root.children.filter(
    n =>
      n instanceof Artboard &&
      /^A \/ 2-onboarding-and-auth \/ 01-splash/.test(n.name),
  )[0];
  if (!ab) return report(['Home artboard not found']);
  selection.items = [ab];
  return report(['Selected ' + ab.name]);
}

function nodeInfo(n, depth) {
  const o = { guid: n.guid, name: n.name, type: n.constructor.name };
  const b = n.boundsInParent;
  o.b = [
    Math.round(b.x * 100) / 100,
    Math.round(b.y * 100) / 100,
    Math.round(b.width * 100) / 100,
    Math.round(b.height * 100) / 100,
  ];
  if (n instanceof Text)
    o.lb = [n.localBounds.x, n.localBounds.y, n.translation.x, n.translation.y];
  if (n instanceof Path)
    o.lb = [n.localBounds.x, n.localBounds.y, n.translation.x, n.translation.y];
  if (depth > 0 && n.children && n.children.length) {
    o.ch = [];
    n.children.forEach(c => o.ch.push(nodeInfo(c, depth - 1)));
  }
  return o;
}

async function writeData(name, text) {
  const folder = await localFileSystem.getDataFolder();
  const f = await folder.createFile(name, { overwrite: true });
  await f.write(text);
  return f.nativePath;
}

function clearDocument(selection, root) {
  root = root || sg.root;
  const all = [];
  root.children.forEach(n => all.push(n));
  all.forEach(n => n.removeFromParent());
  return report([all.length + ' root nodes removed.']);
}

async function dumpAmazighInfo(selection, root) {
  root = root || sg.root;
  const lines = [];
  try {
    const info = { artboards: [], interactions: [] };
    root.children.forEach(n => {
      if (n instanceof Artboard) info.artboards.push(nodeInfo(n, 6));
    });
    try {
      const inter = require('interactions');
      info.homeArtboard = inter.homeArtboard ? inter.homeArtboard.name : null;
      inter.allInteractions.forEach(i =>
        info.interactions.push({
          node: i.triggerNode.name,
          guid: i.triggerNode.guid,
          interactions: i.interactions,
        }),
      );
    } catch (e) {
      info.interactionsError = e.message;
    }
    const p = await writeData('info.json', JSON.stringify(info));
    lines.push(
      info.artboards.length +
        ' artboards, ' +
        info.interactions.length +
        ' interactive nodes.',
      p,
    );
  } catch (e) {
    lines.push('Dump failed: ' + e.message);
  }
  return report(lines);
}

async function exportAmazighPreviews(selection, root) {
  root = root || sg.root;
  const app = require('application');
  const folder = await localFileSystem.getDataFolder();
  const renditions = [];
  const boards = [];
  root.children.forEach(n => {
    if (n instanceof Artboard && OURS.test(n.name)) boards.push(n);
  });
  for (const ab of boards) {
    const file = await folder.createFile(
      ab.name.split(' — ')[0].replace(/[^A-Za-z0-9]+/g, '_') + '.png',
      { overwrite: true },
    );
    renditions.push({
      node: ab,
      outputFile: file,
      type: app.RenditionType.PNG,
      scale: 1,
    });
  }
  try {
    await app.createRenditions(renditions);
    return report([
      boards.length + ' previews exported to:',
      folder.nativePath,
    ]);
  } catch (e) {
    return report(['Export failed: ' + e.message]);
  }
}

function report(lines) {
  const msg = lines.join('\n');
  console.log(msg);
  try {
    require('clipboard').copyText(msg);
  } catch (e) {}
  try {
    const d = document.createElement('dialog');
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    d.innerHTML =
      '<form method="dialog" style="width:460px"><h1>Amazigh Learning UI</h1><hr>' +
      '<p style="white-space:pre-wrap;max-height:360px;overflow:auto">' +
      esc(msg) +
      '</p>' +
      '<footer><button type="submit" uxp-variant="cta">OK</button></footer></form>';
    document.body.appendChild(d);
    return d.showModal().then(
      () => d.remove(),
      () => d.remove(),
    );
  } catch (e) {}
}

module.exports = {
  commands: {
    selectHome,
    buildAmazighA,
    buildAmazighB,
    buildAmazighTest,
    clearDocument,
    dumpAmazighInfo,
    exportAmazighPreviews,
  },
};
