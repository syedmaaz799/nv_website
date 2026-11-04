/**
 * Automated QA for dist/:
 *  - every internal link / asset / brochure resolves
 *  - no console errors or page errors
 *  - no horizontal overflow at mobile / tablet / desktop widths
 *  - images have alt text, one <h1> per page, heading levels don't skip
 *  - buttons/links have accessible names; form controls have labels
 *  - reduced-motion render shows content
 * Usage: node tools/qa.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(fs.readFileSync(path.join(DIST, '404.html'))); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;

const pages = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(path.relative(DIST, p)); } })(DIST);

const problems = [];
const warn = (pg, msg) => problems.push(`${pg}: ${msg}`);

// 1) Static link check
const checked = new Set();
for (const pg of pages) {
  const html = fs.readFileSync(path.join(DIST, pg), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    let u = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u)) continue;
    u = u.split('#')[0].split('?')[0];
    if (!u) continue;
    const target = u.startsWith('/') ? path.join(DIST, u) : path.join(DIST, path.dirname(pg), u);
    const key = target;
    if (checked.has(key)) continue; checked.add(key);
    if (!fs.existsSync(target)) warn(pg, `broken link → ${m[1]}`);
  }
}

// 2) Browser checks
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const widths = [[375, 812, 'mobile'], [820, 1180, 'tablet'], [1440, 900, 'desktop']];
for (const [w, h, label] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 760 });
  for (const pg of pages) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU|swiftshader|ANGLE/i.test(m.text())) errs.push(m.text()); });
    page.on('requestfailed', (r) => errs.push(`request failed ${r.url()}`));
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    // scroll through the page to trigger lazy logic
    await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(300);
    const res = await page.evaluate((vw) => {
      const out = { overflow: [], h1: document.querySelectorAll('h1').length, skips: [], noAlt: [], noName: [], noLabel: [] };
      const de = document.documentElement;
      // body uses overflow-x: clip, so look for anything visibly crossing the viewport edge (clipped content).
      const scrollers = '.marquee, [aria-hidden="true"], .rail__viewport, .journey__pin, .curr__tabs, .compare__wrap, .cmap__bar, .code, .glow, .bg-grid, .hero-canvas, .mnav, .mega, .toast, .cursor, .wa-float, .chapter__sticky canvas, .programs-hero__art, .da-hero, .ds-hero, .ml-hero, .ftr__word, svg';
      const bad = [...document.querySelectorAll('main *, footer *')].filter((el) => {
        if (el.closest(scrollers)) return false;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
        const cs = getComputedStyle(el); if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return false;
        return r.right > vw + 1 || r.left < -1;
      });
      out.overflow = bad.slice(0, 6).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} [${Math.round(el.getBoundingClientRect().left)}→${Math.round(el.getBoundingClientRect().right)}]`);
      out.docWidth = de.scrollWidth;
      let prev = 0;
      document.querySelectorAll('main h1, main h2, main h3, main h4').forEach((hh) => { const l = +hh.tagName[1]; if (prev && l > prev + 1) out.skips.push(`${hh.tagName} after H${prev}: ${hh.textContent.trim().slice(0, 40)}`); prev = l; });
      document.querySelectorAll('img').forEach((i) => { if (!i.hasAttribute('alt')) out.noAlt.push(i.src); });
      document.querySelectorAll('a, button').forEach((el) => { if (el.closest('[aria-hidden="true"]')) return; const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim(); if (!name) out.noName.push(el.outerHTML.slice(0, 90)); });
      document.querySelectorAll('input, select, textarea').forEach((el) => { if (el.type === 'hidden' || el.getAttribute('aria-hidden') === 'true' || el.tabIndex === -1) return; const ok = el.labels && el.labels.length || el.getAttribute('aria-label') || el.closest('label'); if (!ok) out.noLabel.push(el.outerHTML.slice(0, 90)); });
      return out;
    }, w);
    if (res.overflow.length) warn(`${pg} [${label}]`, `horizontal overflow (doc ${res.docWidth}px): ${res.overflow.join(' | ')}`);
    if (label === 'desktop') {
      if (res.h1 !== 1) warn(pg, `${res.h1} <h1> elements`);
      res.skips.forEach((s) => warn(pg, `heading skip: ${s}`));
      res.noAlt.forEach((s) => warn(pg, `img without alt: ${s}`));
      res.noName.forEach((s) => warn(pg, `control without accessible name: ${s}`));
      res.noLabel.forEach((s) => warn(pg, `form control without label: ${s}`));
    }
    errs.forEach((e) => warn(`${pg} [${label}]`, `console: ${e.slice(0, 200)}`));
    await page.close();
  }
  await ctx.close();
}

// 3) Reduced motion sanity: content visible without animations
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const pg of ['index.html', 'programs/data-analyst-with-genai.html']) {
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], [data-split], [data-hero-in]')].filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.5).length);
    if (hidden) warn(pg, `${hidden} elements stay hidden with reduced motion`);
  }
  await ctx.close();
}

// 4) Brochure downloads
{
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/programs/index.html`, { waitUntil: 'networkidle' });
  const links = await page.$$eval('#all a[data-brochure]', (as) => as.map((a) => a.getAttribute('href')));
  for (const href of links) {
    const r = await page.request.get(new URL(href, `${BASE}/programs/index.html`).href);
    const ok = r.ok() && (r.headers()['content-type'] || '').includes('pdf');
    if (!ok) warn('programs/index.html', `brochure not downloadable: ${href}`);
  }
  console.log(`✓ ${links.length} brochure links checked`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(`✓ Checked ${pages.length} pages × ${widths.length} viewports, ${checked.size} unique links`);
if (problems.length) { console.log(`\n${problems.length} issue(s):\n- ${problems.join('\n- ')}`); process.exitCode = 1; } else console.log('✓ No issues found');
