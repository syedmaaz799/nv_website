/** Capture high-resolution showcase screenshots into release/screenshots/ (node tools/showcase.mjs). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist'), OUT = path.join(ROOT, 'release/screenshots');
const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.pdf': 'application/pdf' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'; const f = path.join(DIST, p); if (!fs.existsSync(f)) { r.writeHead(404).end(); return; } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const U = `http://localhost:${srv.address().port}`;
const SHOTS = [
  ['01-home-hero', 'index.html', null, 1440],
  ['02-home-programs-3d', 'index.html', '[data-paths]@0.12', 1440],
  ['03-programs-listing', 'programs/index.html', '#all@0', 1440],
  ['04-data-analyst-sql-joins', 'programs/data-analyst-with-genai.html', '#ch-sql@0.8', 1440],
  ['05-data-analyst-power-bi', 'programs/data-analyst-with-genai.html', '#ch-power-bi@0.97', 1440],
  ['06-data-science-3d-journey', 'programs/data-science-with-genai.html', '#ch-journey@0.72', 1440],
  ['07-applied-ai-loss-landscape', 'programs/applied-ai-and-machine-learning.html', '#ch-optimisers@0.98', 1440],
  ['08-ai-agents-workflow', 'programs/ai-agents-and-automation.html', null, 1440],
  ['09-curriculum-explorer', 'programs/applied-ai-and-machine-learning.html', '#curriculum@0', 1440],
  ['10-mobile-home', 'index.html', null, 390],
];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const only = process.argv[2];
for (const [name, pg, target, w] of SHOTS.filter(([n]) => !only || n.startsWith(only))) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  await page.goto(`${U}/${pg}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  if (target) {
    const [sel, frac] = target.split('@');
    const y = await page.evaluate(([s, f]) => { const el = document.querySelector(s); const top = el.getBoundingClientRect().top + scrollY; return Math.round(top + Math.max(0, el.offsetHeight - innerHeight) * +f); }, [sel, frac]);
    await page.evaluate((y) => (window.NV && window.NV.lenis ? window.NV.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), y);
    await page.waitForTimeout(2800);
  }
  if (name === '09-curriculum-explorer') { await page.click('[data-tab="month-5"]'); await page.click('#panel-month-5 [data-day] summary'); await page.waitForTimeout(600); }
  await page.addStyleTag({ content: '.cursor{display:none!important}' });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), animations: 'disabled', timeout: 60000 });
  console.log('✓', name);
  await ctx.close();
}
await browser.close(); srv.close();
