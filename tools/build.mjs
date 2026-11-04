/**
 * NeuralVarsity static site build.
 *   node tools/build.mjs            → builds dist/ (pages, CSS, JS, fonts, images, brochures)
 *   node tools/build.mjs --watch    → rebuild on change
 */
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const r = (...p) => path.join(ROOT, ...p);

const CSS_ENTRIES = {
  site: 'src/styles/site.css',
  home: 'src/styles/pages/home.css',
  programs: 'src/styles/pages/programs.css',
  program: 'src/styles/pages/program.css',
  da: 'src/styles/pages/da.css',
  ds: 'src/styles/pages/ds.css',
  aiml: 'src/styles/pages/aiml.css',
  aaa: 'src/styles/pages/aaa.css',
  forms: 'src/styles/pages/forms.css',
  about: 'src/styles/pages/about.css',
};
const JS_ENTRIES = {
  core: 'src/scripts/core/index.js',
  scene3d: 'src/scripts/three/index.js',
  home: 'src/scripts/pages/home.js',
  programs: 'src/scripts/pages/programs.js',
  da: 'src/scripts/pages/da.js',
  ds: 'src/scripts/pages/ds.js',
  aiml: 'src/scripts/pages/aiml.js',
  aaa: 'src/scripts/pages/aaa.js',
  apply: 'src/scripts/pages/apply.js',
  contact: 'src/scripts/pages/contact.js',
  about: 'src/scripts/pages/about.js',
};

const exists = (p) => fss.existsSync(r(p));
const pick = (entries) => Object.fromEntries(Object.entries(entries).filter(([, p]) => exists(p)).map(([k, p]) => [k, r(p)]));

async function copyDir(from, to) {
  if (!fss.existsSync(from)) return;
  await fs.mkdir(to, { recursive: true });
  for (const e of await fs.readdir(from, { withFileTypes: true })) {
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) await copyDir(s, d); else await fs.copyFile(s, d);
  }
}

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);

export async function buildSite({ quiet = false } = {}) {
  const t0 = Date.now();
  // Keep generated brochures/og if present, rebuild everything else.
  for (const d of ['assets', 'programs']) await fs.rm(path.join(DIST, d), { recursive: true, force: true });
  for (const f of fss.existsSync(DIST) ? await fs.readdir(DIST) : []) if (f.endsWith('.html') || f.endsWith('.xml') || f === 'robots.txt') await fs.rm(path.join(DIST, f));
  await fs.mkdir(path.join(DIST, 'assets/fonts'), { recursive: true });

  // Fonts (variable, latin subset) from @fontsource
  const fontMap = {
    'sora.woff2': '@fontsource-variable/sora/files/sora-latin-wght-normal.woff2',
    'manrope.woff2': '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
    'jetbrains-mono.woff2': '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  };
  for (const [out, src] of Object.entries(fontMap)) await fs.copyFile(r('node_modules', src), path.join(DIST, 'assets/fonts', out));

  await copyDir(r('src/assets/img'), path.join(DIST, 'assets/img'));
  await copyDir(r('generated/og'), path.join(DIST, 'assets/img/og'));
  await copyDir(r('generated/brochures'), path.join(DIST, 'brochures'));
  await copyDir(r('src/static'), DIST);

  // CSS
  await build({
    entryPoints: pick(CSS_ENTRIES), bundle: true, minify: true, outdir: path.join(DIST, 'assets/css'),
    external: ['*.woff2', '*.png', '*.svg', '*.jpg', '*.webp'], logLevel: 'warning', target: ['chrome100', 'safari15', 'firefox100'],
  });
  // JS
  await build({
    entryPoints: pick(JS_ENTRIES), bundle: true, minify: true, format: 'iife', target: ['es2020'],
    outdir: path.join(DIST, 'assets/js'), logLevel: 'warning', legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' },
  });

  // Asset versions for cache busting
  const versions = {};
  for (const dir of ['css', 'js']) {
    for (const f of await fs.readdir(path.join(DIST, 'assets', dir))) versions[f] = hash(await fs.readFile(path.join(DIST, 'assets', dir, f)));
  }

  // Pages (fresh import each build so --watch picks up template edits)
  const stamp = `?t=${Date.now()}`;
  const { PAGES } = await import(pathToFileURL(r('src/templates/pages/index.mjs')).href + stamp);
  const lib = await import(pathToFileURL(r('src/templates/lib.mjs')).href);
  for (const pg of PAGES) {
    lib.resetSprite();
    let html = pg.render();
    html = html.replace('<!--SPRITE-->', lib.spriteHtml());
    html = html.replace(/__V_([\w.-]+)__/g, (_, f) => versions[f] || '0');
    const out = path.join(DIST, pg.out);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, html);
  }

  // Sitemap & robots
  const { site } = await import(pathToFileURL(r('src/config/site.mjs')).href + stamp);
  const base = site.url.replace(/\/$/, '');
  const urls = PAGES.filter((p) => !p.noindex).map((p) => `  <url><loc>${base}/${p.out.replace(/index\.html$/, '')}</loc><changefreq>monthly</changefreq><priority>${p.priority || 0.7}</priority></url>`);
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

  if (!quiet) {
    console.log(`✓ Built ${PAGES.length} pages in ${Date.now() - t0} ms → dist/`);
    const { isPlaceholder } = await import(pathToFileURL(r('src/config/site.mjs')).href + stamp);
    const todo = [];
    for (const [k, v] of Object.entries(site.contact)) if (isPlaceholder(v)) todo.push(`contact.${k}`);
    site.locations.forEach((l, i) => Object.entries(l).forEach(([k, v]) => k !== 'mapUrl' && isPlaceholder(v) && todo.push(`locations[${i}].${k}`)));
    if (!Object.values(site.social).some(Boolean)) todo.push('social.* (no social links set)');
    if (todo.length) console.log(`\n⚠  Placeholders still to fill in src/config/site.mjs:\n   - ${todo.join('\n   - ')}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
  if (process.argv.includes('--watch')) {
    let timer;
    console.log('Watching src/ …');
    fss.watch(SRC, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => buildSite({ quiet: true }).then(() => console.log('↻ rebuilt', new Date().toLocaleTimeString())).catch((e) => console.error(e.message)), 150);
    });
  }
}
