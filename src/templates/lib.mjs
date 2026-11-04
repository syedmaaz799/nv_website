import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as SI from 'simple-icons';
import { TOOLS } from '../data/tools.mjs';

const require = createRequire(import.meta.url);
const lucideDir = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons');

/** Escape plain text for HTML. (Curriculum strings are already HTML and must NOT be passed through this.) */
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Strip tags + decode the few entities we emit, for attributes/plain contexts. */
export const plain = (s = '') =>
  String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

/** Join helper so templates can map arrays without commas. */
export const each = (arr, fn) => (arr || []).map(fn).join('');

const iconCache = new Map();
/** Inline Lucide icon (ISC licence). */
export function icon(name, cls = '') {
  if (!iconCache.has(name)) {
    const raw = fs.readFileSync(path.join(lucideDir, `${name}.svg`), 'utf8');
    iconCache.set(name, raw.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim());
  }
  return iconCache.get(name)
    .replace('<svg', `<svg aria-hidden="true" focusable="false" class="icon${cls ? ' ' + cls : ''}"`)
    .replace(/ width="24"/, '').replace(/ height="24"/, '').replace(/ class="lucide[^"]*"/, '');
}

/** Simple Icons brand glyph (CC0), emitted once per page via an SVG sprite. */
const spriteUsed = new Map();
export function resetSprite() { spriteUsed.clear(); }
export function spriteHtml() {
  if (!spriteUsed.size) return '';
  return `<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${[...spriteUsed].map(([s, d]) => `<symbol id="si-${s}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`).join('')}</defs></svg>`;
}
export function brand(slug, cls = '', { inline = false } = {}) {
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  const ic = SI[key];
  if (!ic) return '';
  if (inline) return `<svg aria-hidden="true" focusable="false" class="brand${cls ? ' ' + cls : ''}" viewBox="0 0 24 24"><path d="${ic.path}"/></svg>`;
  spriteUsed.set(slug, ic.path);
  return `<svg aria-hidden="true" focusable="false" class="brand${cls ? ' ' + cls : ''}" viewBox="0 0 24 24"><use href="#si-${slug}"/></svg>`;
}
export const brandHex = (slug) => {
  const ic = SI['si' + slug.charAt(0).toUpperCase() + slug.slice(1)];
  return ic ? '#' + ic.hex : '#94A3B8';
};

/** Tool chip: brand glyph if available, otherwise a monogram tile. */
export function toolGlyph(name) {
  const t = TOOLS[name] || { mono: name.slice(0, 2) };
  if (t.si) {
    const hex = brandHex(t.si);
    return `<span class="tool__glyph" style="--tc:${lightenIfDark(hex)}">${brand(t.si)}</span>`;
  }
  if (t.lucide) return `<span class="tool__glyph" style="--tc:${t.hex || '#94A3B8'}">${icon(t.lucide)}</span>`;
  return `<span class="tool__glyph tool__glyph--mono" style="--tc:${t.hex || '#94A3B8'}">${esc(t.mono)}</span>`;
}
export const toolChip = (name, cls = '') => `<li class="tool ${cls}">${toolGlyph(name)}<span class="tool__name">${esc(name)}</span></li>`;

/** Near-black brand colours (e.g. GitHub, Cursor) are lifted so they stay visible on dark UI. */
function lightenIfDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 60 ? '#E7ECF5' : hex;
}

/* ------------------------------------------------------------------ */
/* Build-time syntax highlighter (tiny, dependency-free)               */
/* ------------------------------------------------------------------ */
const LANGS = {
  python: {
    comment: /#[^\n]*/y,
    string: /(?:f|r|rb|b)?("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y,
    keywords: 'import from as def return class if elif else for while in not and or is None True False with try except finally raise lambda yield async await pass break continue self',
    builtins: 'print len range type int float str list dict set tuple open super isinstance enumerate zip map filter sorted',
    decorator: /@[\w.]+/y,
  },
  sql: {
    comment: /--[^\n]*/y,
    string: /'(?:''|[^'])*'/y,
    keywords: 'SELECT FROM WHERE GROUP BY ORDER HAVING JOIN INNER LEFT RIGHT FULL OUTER CROSS ON AS AND OR NOT IN IS NULL LIMIT DISTINCT WITH OVER PARTITION CASE WHEN THEN ELSE END DESC ASC UNION ALL INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE PRIMARY KEY FOREIGN REFERENCES RECURSIVE EXISTS BETWEEN LIKE',
    ci: true,
  },
  dax: {
    comment: /\/\/[^\n]*/y,
    string: /"(?:""|[^"])*"/y,
    keywords: 'VAR RETURN',
    column: /'[^'\n]+'\[[^\]\n]+\]|\[[^\]\n]+\]/y,
  },
  m: {
    comment: /\/\/[^\n]*/y,
    string: /"(?:""|[^"])*"/y,
    keywords: 'let in each if then else type',
  },
  excel: { string: /"(?:""|[^"])*"/y, keywords: '', ref: /\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?|[A-Z]:[A-Z]/y },
  json: { string: /"(?:\\.|[^"\\])*"(?=\s*:)?/y, keywords: 'true false null', key: /"(?:\\.|[^"\\])*"(?=\s*:)/y },
  bash: {
    comment: /#[^\n]*/y,
    string: /"(?:\\.|[^"\\])*"|'[^']*'/y,
    keywords: 'git dvc mlflow docker curl pip python uvicorn run build push commit -m -t -p -X -d ui',
    prompt: /\$(?= )/y,
  },
  md: { heading: /#{1,6} [^\n]*/y, keywords: '' },
  plain: { keywords: '' },
};

export function highlight(code, lang = 'plain') {
  const L = LANGS[lang] || LANGS.plain;
  const kw = new Set((L.keywords || '').split(/\s+/).filter(Boolean).map((k) => (L.ci ? k.toUpperCase() : k)));
  const bi = new Set((L.builtins || '').split(/\s+/).filter(Boolean));
  let i = 0, out = '';
  const at = (re) => { re.lastIndex = i; const m = re.exec(code); return m && m.index === i ? m[0] : null; };
  const push = (cls, s) => { out += cls ? `<span class="t-${cls}">${esc(s)}</span>` : esc(s); i += s.length; };
  while (i < code.length) {
    let m;
    if (L.heading && (i === 0 || code[i - 1] === '\n') && (m = at(L.heading))) { push('kw', m); continue; }
    if (L.prompt && (m = at(L.prompt))) { push('prompt', m); continue; }
    if (L.comment && (m = at(L.comment))) { push('com', m); continue; }
    if (L.key && (m = at(L.key))) { push('key', m); continue; }
    if (L.column && (m = at(L.column))) { push('col', m); continue; }
    if (L.ref && (m = at(L.ref))) { push('ref', m); continue; }
    if (L.string && (m = at(L.string))) { push('str', m); continue; }
    if (L.decorator && (m = at(L.decorator))) { push('dec', m); continue; }
    if ((m = at(/\d+(?:\.\d+)?%?/y)) && !/[\w]/.test(code[i - 1] || '')) { push('num', m); continue; }
    if ((m = at(/[A-Za-z_][\w.]*/y))) {
      const word = m, key = L.ci ? word.toUpperCase() : word;
      const next = code.slice(i + word.length).match(/^\s*\(/);
      if (kw.has(key)) push('kw', word);
      else if (bi.has(word)) push('fn', word);
      else if (next) push('fn', word);
      else push('', word);
      continue;
    }
    if (lang === 'bash' && (m = at(/-{1,2}[\w-]+/y))) { push('kw', m); continue; }
    if ((m = at(/[=+\-*/<>!&|%^:,;.()[\]{}]+/y))) { push('op', m); continue; }
    push('', code[i]);
  }
  return out;
}

/** Highlighted code block split into lines (for line-by-line typing reveals). */
export function codeLines(code, lang) {
  const hl = highlight(code.replace(/^\n+|\s+$/g, ''), lang);
  // Re-balance spans across newlines so each line is self-contained.
  const lines = [];
  let open = null, cur = '';
  const re = /(<span class="[^"]+">)|(<\/span>)|(\n)|([^<\n]+)/g;
  let m;
  while ((m = re.exec(hl))) {
    if (m[1]) { open = m[1]; cur += m[1]; }
    else if (m[2]) { open = null; cur += m[2]; }
    else if (m[3]) { if (open) cur += '</span>'; lines.push(cur); cur = open || ''; }
    else cur += m[4];
  }
  lines.push(cur);
  return lines.map((l, n) => `<span class="code__line" style="--n:${n};--len:${plain(l).length}">${l || ' '}</span>`).join('');
}
