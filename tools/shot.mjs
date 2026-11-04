/**
 * Screenshot helper for visual QA.
 *   node tools/shot.mjs <page> <outPrefix> [width] [height] [scrollStops...]
 * Starts a static server on dist/, captures the page at each scroll position (px or "Npct").
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const [pagePath = 'index.html', out = '/tmp/shot', w = '1440', h = '900', ...stops] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, p);
  if (!fs.existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(`http://localhost:${port}/${pagePath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const list = stops.length ? stops : ['0'];
let i = 0;
for (const s of list) {
  let y;
  if (s.startsWith('#')) {
    const [sel, frac = '0'] = s.split('@');
    y = await page.evaluate(([sel, frac, vh]) => { const el = document.querySelector(sel); if (!el) return 0; const top = el.getBoundingClientRect().top + window.scrollY; return Math.round(top + Math.max(0, el.offsetHeight - vh) * parseFloat(frac)); }, [sel, frac, +h]);
  } else y = s.endsWith('pct') ? Math.round((parseFloat(s) / 100) * (total - +h)) : parseInt(s, 10);
  await page.evaluate((y) => { if (window.NV && window.NV.lenis) window.NV.lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, y);
  await page.waitForTimeout(1400);
  const file = `${out}-${String(i++).padStart(2, '0')}.png`;
  await page.screenshot({ path: file, animations: process.env.ANIM ? 'allow' : 'disabled', timeout: 60000 });
  console.log('saved', file, 'y=', y);
}
console.log('scrollHeight', total);
if (logs.length) console.log('CONSOLE:\n' + [...new Set(logs)].slice(0, 30).join('\n'));
await browser.close();
server.close();
