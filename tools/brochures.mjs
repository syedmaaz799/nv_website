/**
 * Generates a designed, multi-page A4 PDF brochure for each program (full curriculum included)
 * plus 1200×630 social share images, using the pre-installed Chromium via Playwright.
 *   node tools/brochures.mjs        → generated/brochures/*.pdf, generated/og/*.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => path.join(ROOT, ...p);
const { PROGRAMS, STATS } = await import(pathToFileURL(r('src/data/programs.mjs')).href);
const { site, isPlaceholder } = await import(pathToFileURL(r('src/config/site.mjs')).href);
const { programViz } = await import(pathToFileURL(r('src/templates/viz.mjs')).href);
const { esc, each } = await import(pathToFileURL(r('src/templates/lib.mjs')).href);

const font = (f) => `data:font/woff2;base64,${fs.readFileSync(r('node_modules/@fontsource-variable', f)).toString('base64')}`;
const FONTS = `
@font-face{font-family:Sora;src:url(${font('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Manrope;src:url(${font('manrope/files/manrope-latin-wght-normal.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:JBM;src:url(${font('jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}`;
const LOGO = `data:image/png;base64,${fs.readFileSync(r('src/assets/img/favicon.png')).toString('base64')}`;
const show = (v, fallback = '') => (isPlaceholder(v) ? fallback : esc(v));

const CSS = (p) => `${FONTS}
@page { size: A4; margin: 0; }
@page flow {
  size: A4; margin: 17mm 0 16mm;
  @top-left { content: "NeuralVarsity · ${esc(p.name).replace(/&amp;/g, '&')}"; font-family: JBM, monospace; font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; color: #8a93a6; padding-left: 16mm; vertical-align: bottom; padding-bottom: 5mm; }
  @top-right { content: "${esc(p.duration)} · ${p.sessions} sessions"; font-family: JBM, monospace; font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; color: #8a93a6; padding-right: 16mm; vertical-align: bottom; padding-bottom: 5mm; }
  @bottom-left { content: "${esc(site.domain)}"; font-family: Manrope, sans-serif; font-size: 7.5pt; color: #8a93a6; padding-left: 16mm; vertical-align: top; padding-top: 5mm; }
  @bottom-right { content: counter(page); font-family: Manrope, sans-serif; font-size: 7.5pt; color: #8a93a6; padding-right: 16mm; vertical-align: top; padding-top: 5mm; }
}
.page.flowpage { page: flow; min-height: 0; padding-top: 0; padding-bottom: 0; overflow: visible; }
.page.flowpage .rh, .page.flowpage .rf { display: none; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Manrope, sans-serif; color: #1a2130; font-size: 9.6pt; line-height: 1.5; }
:root { --a: ${p.accent}; --a2: ${p.accent2}; --ar: ${p.accentRgb}; --ink: #0b1020; }
.page { position: relative; width: 210mm; min-height: 297mm; padding: 18mm 16mm 20mm; page-break-after: always; overflow: hidden; }
.page:last-child { page-break-after: auto; }
.mono { font-family: JBM, monospace; }
h1, h2, h3 { font-family: Sora, sans-serif; letter-spacing: -0.03em; color: var(--ink); line-height: 1.08; }
/* cover */
.cover { background: radial-gradient(120% 80% at 100% 0%, rgba(var(--ar), .45), transparent 55%), radial-gradient(90% 70% at 0% 100%, rgba(var(--ar), .22), transparent 60%), #070a12; color: #e9eef6; display: flex; flex-direction: column; }
.cover .brand { display: flex; align-items: center; gap: 10px; font-family: Sora; font-weight: 700; font-size: 14pt; color: #fff; }
.cover .brand b { font-weight: 700; }
.cover .brand img { width: 30px; height: 30px; border-radius: 8px; }
.cover .brand span { background: linear-gradient(90deg, #3fd5e0, #f5b544); -webkit-background-clip: text; color: transparent; }
.cover .kicker { margin-top: 40mm; font-family: JBM; font-size: 9pt; letter-spacing: .2em; text-transform: uppercase; color: var(--a); }
.cover h1 { margin-top: 6mm; font-size: 46pt; color: #fff; max-width: 150mm; line-height: 0.98; letter-spacing: -0.045em; }
.cover h1 em { font-style: normal; background: linear-gradient(100deg, var(--a), var(--a2)); -webkit-background-clip: text; color: transparent; }
.cover .tag { margin-top: 8mm; font-size: 14pt; color: #c4cede; max-width: 140mm; font-weight: 500; }
.cover .viz { position: absolute; right: -10mm; bottom: 58mm; width: 150mm; opacity: .95; }
.cover .facts { margin-top: auto; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid rgba(255,255,255,.15); }
.cover .facts div { padding: 6mm 4mm 0 0; }
.cover .facts b { display: block; font-family: Sora; font-size: 20pt; color: #fff; letter-spacing: -0.03em; }
.cover .facts small { font-size: 8pt; color: #9aa6ba; text-transform: uppercase; letter-spacing: .12em; font-family: JBM; }
/* running header/footer */
.rh { position: absolute; top: 9mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; font-family: JBM; font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; color: #8a93a6; }
.rf { position: absolute; bottom: 9mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #8a93a6; border-top: 1px solid #e4e8ef; padding-top: 3mm; }
.eyebrow { font-family: JBM; font-size: 7.5pt; letter-spacing: .18em; text-transform: uppercase; color: var(--a); font-weight: 600; }
.accentbar { width: 26mm; height: 2.2mm; border-radius: 2mm; background: linear-gradient(90deg, var(--a), var(--a2)); margin: 4mm 0 6mm; }
.lead { font-size: 12.5pt; color: #2b3445; line-height: 1.55; max-width: 165mm; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 9mm; margin-top: 9mm; }
.box { border: 1px solid #e3e7ee; border-radius: 4mm; padding: 6mm; background: #fafbfd; }
.box h3 { font-size: 11.5pt; margin-bottom: 3mm; }
ul.tick { list-style: none; display: grid; gap: 2.2mm; }
ul.tick li { position: relative; padding-left: 5mm; }
ul.tick li::before { content: ''; position: absolute; left: 0; top: 1.6mm; width: 2.2mm; height: 2.2mm; border-radius: .6mm; background: var(--a); }
.chips { display: flex; flex-wrap: wrap; gap: 1.6mm; }
.chips span { padding: 1.2mm 2.6mm; border-radius: 2mm; background: rgba(var(--ar), .12); border: 1px solid rgba(var(--ar), .35); font-size: 8pt; font-weight: 700; color: #1d2433; }
.units { display: grid; gap: 2.4mm; margin-top: 8mm; }
.unit { display: grid; grid-template-columns: 24mm 1fr 26mm; gap: 4mm; align-items: center; padding: 3.4mm 4mm; border-radius: 3mm; border: 1px solid #e3e7ee; }
.unit .l { font-family: JBM; font-size: 7.5pt; color: var(--a); font-weight: 600; letter-spacing: .06em; }
.unit b { font-family: Sora; font-size: 10.5pt; letter-spacing: -0.015em; }
.unit .m { font-family: JBM; font-size: 7pt; color: #7b8496; text-align: right; }
.bar { height: 2.2mm; border-radius: 2mm; background: #edf0f5; overflow: hidden; margin-top: 1.4mm; }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--a), var(--a2)); }
/* curriculum */
.pb { break-before: page; }
.unit-h { margin: 7mm 0 3mm; padding-bottom: 2mm; border-bottom: 2px solid var(--a); display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; break-after: avoid; }
.unit-h:first-of-type { margin-top: 2mm; }
.unit-h h2 { font-size: 14pt; }
.unit-h span { font-family: JBM; font-size: 7.5pt; color: #7b8496; white-space: nowrap; }
.group-t { font-family: JBM; font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #5b6478; margin: 4mm 0 1.6mm; break-after: avoid; }
.group-t em { font-style: normal; font-family: Manrope; letter-spacing: 0; text-transform: none; font-weight: 600; color: #2b3445; font-size: 8.6pt; }
.day { display: grid; grid-template-columns: 16mm 1fr; gap: 3mm; padding: 2.2mm 0; border-top: 1px solid #edf0f5; break-inside: avoid; }
.day .n { font-family: JBM; font-size: 7.5pt; color: var(--a); font-weight: 700; padding-top: .4mm; }
.day h4 { font-family: Sora; font-size: 9.4pt; letter-spacing: -0.01em; color: var(--ink); margin-bottom: .8mm; }
.day p, .day li { font-size: 8.2pt; color: #3b4456; line-height: 1.45; }
.day ul { list-style: none; display: grid; gap: .6mm; }
.day li b, .day p strong { color: #1a2130; }
.day .proj { font-size: 8.2pt; color: #3b4456; line-height: 1.45; margin-top: 1.2mm; padding: 1.6mm 2.4mm; border-left: 2px solid var(--a); background: rgba(var(--ar), .07); border-radius: 0 1.6mm 1.6mm 0; }
.day .proj b { font-size: 8pt; }
.day .dl { margin-top: 1mm; font-size: 7.8pt; color: #5b6478; }
.flow { column-count: 1; }
/* projects & tools */
.projects { display: grid; grid-template-columns: 1fr 1fr; gap: 3.4mm; margin-top: 6mm; }
.pj { border: 1px solid #e3e7ee; border-radius: 3mm; padding: 4mm; break-inside: avoid; background: #fff; }
.pj .w { font-family: JBM; font-size: 7pt; color: var(--a); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.pj b { display: block; font-family: Sora; font-size: 10pt; margin: 1mm 0; letter-spacing: -0.01em; }
.pj p { font-size: 8.2pt; color: #3b4456; }
.tools { display: flex; flex-wrap: wrap; gap: 1.6mm; margin-top: 4mm; }
.tools span { padding: 1.2mm 2.4mm; border-radius: 1.6mm; border: 1px solid #dfe3ea; font-size: 7.8pt; font-weight: 600; }
/* back */
.back { background: radial-gradient(100% 70% at 0% 0%, rgba(var(--ar), .4), transparent 60%), #070a12; color: #e9eef6; display: flex; flex-direction: column; }
.back h2 { color: #fff; font-size: 30pt; max-width: 150mm; letter-spacing: -0.04em; margin-top: 30mm; }
.back .lead { color: #c4cede; margin-top: 6mm; }
.back .steps { margin-top: 12mm; display: grid; gap: 4mm; }
.back .steps div { display: grid; grid-template-columns: 14mm 1fr; gap: 4mm; padding: 4mm 0; border-top: 1px solid rgba(255,255,255,.14); }
.back .steps b { font-family: Sora; color: #fff; font-size: 12pt; }
.back .steps .mono { color: var(--a); font-size: 9pt; }
.back .contact { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; padding: 7mm; border-radius: 5mm; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); }
.back .contact small { display: block; font-family: JBM; font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; color: #9aa6ba; margin-bottom: 1mm; }
.back .contact span { font-size: 10.5pt; font-weight: 700; color: #fff; }
.back .apply { margin-top: 6mm; display: inline-block; padding: 4mm 7mm; border-radius: 10mm; background: linear-gradient(90deg, var(--a), var(--a2)); color: #061015; font-weight: 800; font-size: 11pt; text-decoration: none; align-self: flex-start; }
/* SVG emblem colours (static versions of site animations) */
.pviz { width: 100%; height: auto; }
.pviz *{ animation: none !important; }
.pviz--da .pviz__grid rect{fill:rgba(255,255,255,.04);stroke:rgba(255,255,255,.08)} .pviz--da .pviz__bars rect{fill:rgba(62,224,143,.35);stroke:#3ee08f} .pviz--da .pviz__line{fill:none;stroke:#3fd5e0;stroke-width:2.5} .pviz--da .pviz__pt{fill:#061015;stroke:#3fd5e0;stroke-width:2.5}
.pviz--ds .pviz__d--0{fill:#4aa8ff}.pviz--ds .pviz__d--1{fill:#8b7cff}.pviz--ds .pviz__d--2{fill:#5fe1e8}.pviz--ds .pviz__ring{fill:none;stroke-width:1.5;stroke-dasharray:4 5}.pviz--ds .pviz__ring--0{stroke:#4aa8ff}.pviz--ds .pviz__ring--1{stroke:#8b7cff}.pviz--ds .pviz__ring--2{stroke:#5fe1e8}.pviz--ds .pviz__c{fill:#fff}.pviz--ds .pviz__curve{fill:none;stroke:rgba(255,255,255,.2)}
.pviz--aiml .pviz__e{fill:none;stroke:rgba(166,133,255,.45);stroke-width:1.2}.pviz--aiml .pviz__n{fill:#0b0f1c;stroke:#c4b0ff;stroke-width:2}
.pviz--aaa .pviz__w{fill:none;stroke:rgba(245,181,68,.55);stroke-width:2;stroke-dasharray:5 6}.pviz--aaa .pviz__node{fill:#120f0a;stroke:rgba(245,181,68,.8);stroke-width:1.5}.pviz--aaa .pviz__pk{display:none}.pviz--aaa text{fill:#f5b544;font-size:16px}
`;

const footer = (p, n) => `<div class="rh"><span>NeuralVarsity · ${esc(p.name)}</span><span>${esc(p.duration)} · ${p.sessions} sessions</span></div><div class="rf"><span>${esc(site.domain)}</span><span>${n}</span></div>`;

function dayHtml(d) {
  let h = `<div class="day"><span class="n">${d.label}</span><div><h4>${d.titles.join(' + ')}</h4>`;
  if (d.body) h += `<p>${d.body}</p>`;
  if (d.points && d.points.length) h += `<ul>${each(d.points, (pt) => `<li>${pt.label ? `<b>${pt.label}:</b> ` : ''}${pt.text}</li>`)}</ul>`;
  if (d.project && (d.project.title || d.project.text)) h += `<div class="proj"><b>Hands-on · ${d.project.title || 'Project'}:</b> ${d.project.text}</div>`;
  if (d.deliverables && d.deliverables.length) h += `<p class="dl"><b>Deliverables:</b> ${d.deliverables.join(' · ')}</p>`;
  if (d.assessment) h += `<p class="dl"><b>Assessment:</b> ${d.assessment}</p>`;
  return h + '</div></div>';
}

function brochureHtml(p) {
  const units = p.curriculum.units;
  const maxCount = Math.max(...units.map((u) => u.count));
  const name = esc(p.name).replace(/(with GenAI|Machine Learning|&amp; Automation)$/, '<em>$1</em>');
  const c = site.contact;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.name)} — NeuralVarsity brochure</title><style>${CSS(p)}</style></head><body>
<section class="page cover">
  <div class="brand"><img src="${LOGO}" alt=""><b>NeuralVarsity<span>.ai</span></b></div>
  <p class="kicker">Program ${p.number} · ${esc(p.duration)}</p>
  <h1>${name}</h1>
  <p class="tag">${esc(p.headline)}</p>
  <div class="viz">${programViz(p.key)}</div>
  <div class="facts"><div><b>${esc(p.duration)}</b><small>${p.weeks} weeks</small></div><div><b>${p.sessions}</b><small>sessions</small></div><div><b>${p.projects.length}</b><small>projects</small></div><div><b>${p.tools.length}</b><small>tools</small></div></div>
</section>

<section class="page flowpage">
  ${footer(p, 2)}
  <p class="eyebrow">Program overview</p><div class="accentbar"></div>
  <h2 style="font-size:24pt;max-width:160mm">${esc(p.tagline)}</h2>
  <p class="lead" style="margin-top:5mm">${esc(p.summary)}</p>
  <div class="cols">
    <div class="box"><h3>Who it’s for</h3><ul class="tick">${each(p.idealFor, (x) => `<li>${esc(x)}</li>`)}</ul></div>
    <div class="box"><h3>At a glance</h3><ul class="tick"><li><b>Level:</b> ${esc(p.level)}</li><li><b>Starting point:</b> ${esc(p.startsFrom)}</li><li><b>Format:</b> ${esc(p.format)}</li><li><b>Generative AI:</b> ${esc(p.genai)}</li></ul></div>
  </div>
  <div class="box" style="margin-top:7mm"><h3>What you’ll be able to do</h3><ul class="tick">${each(p.outcomes, (x) => `<li>${esc(x)}</li>`)}</ul></div>
  <div style="margin-top:7mm"><h3 style="font-size:11.5pt;margin-bottom:3mm">Roles this program prepares you for</h3><div class="chips">${each(p.roles, (x) => `<span>${esc(x)}</span>`)}</div></div>
</section>

<section class="page flowpage">
  ${footer(p, 3)}
  <p class="eyebrow pb">Program structure</p><div class="accentbar"></div>
  <h2 style="font-size:22pt">${p.weeks} weeks · ${units.length} ${esc(p.curriculum.unitLabel.toLowerCase())}s · ${p.sessions} sessions</h2>
  <div class="units">${each(units, (u) => `<div class="unit"><span class="l">${u.label}</span><div><b>${u.title}</b><div class="bar"><i style="width:${(u.count / maxCount) * 100}%"></i></div></div><span class="m">${u.meta}<br>${u.count} sessions</span></div>`)}</div>
  <div style="margin-top:9mm"><h3 style="font-size:11.5pt;margin-bottom:2mm">Tools &amp; technologies</h3><div class="tools">${each(p.tools, (t) => `<span>${esc(t)}</span>`)}</div></div>
</section>

<section class="page flowpage flow">
  ${footer(p, '')}
  <p class="eyebrow">Full curriculum · day by day</p><div class="accentbar"></div>
  ${each(units, (u) => `<div class="unit-h"><h2>${u.label} — ${u.title}</h2><span>${u.meta}</span></div>
    ${each(u.groups, (g) => `${g.title ? `<p class="group-t">${g.title}${g.subtitle ? ` · <em>${g.subtitle}</em>` : ''}</p>` : ''}${each(g.days, dayHtml)}`)}`)}
</section>

<section class="page flowpage">
  ${footer(p, '')}
  <p class="eyebrow">Projects &amp; capstones</p><div class="accentbar"></div>
  <h2 style="font-size:22pt">${p.projects.length} things you’ll build</h2>
  <div class="projects">${each(p.projects, (x) => `<div class="pj"><span class="w">${esc(x.when)}</span><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div>`)}</div>
  <div class="box" style="margin-top:8mm"><h3>Frequently asked questions</h3>${each(p.faqs, (f) => `<p style="margin-top:2.4mm"><b>${esc(f.q)}</b><br>${esc(f.a)}</p>`)}</div>
</section>

<section class="page back">
  <div class="brand" style="display:flex;align-items:center;gap:10px;font-family:Sora;font-weight:700;font-size:14pt;color:#fff"><img src="${LOGO}" alt="" style="width:30px;height:30px;border-radius:8px">NeuralVarsity</div>
  <h2>Ready to start ${esc(p.name)}?</h2>
  <p class="lead">Apply online in under three minutes. An admissions advisor will contact you to discuss fit, schedules and next steps.</p>
  <div class="steps"><div><span class="mono">01</span><span><b>Apply online</b><br>Choose your program and share your background.</span></div><div><span class="mono">02</span><span><b>Talk to an advisor</b><br>A quick conversation about goals, fit and schedules.</span></div><div><span class="mono">03</span><span><b>Enrol &amp; start building</b><br>Get set up and begin your first session.</span></div></div>
  <div class="contact">
    <div><small>Apply online</small><span>${esc(site.url.replace(/^https?:\/\//, ''))}/${esc(p.applyUrl)}</span></div>
    <div><small>WhatsApp</small><span>${show(c.whatsappDisplay, 'Message us via the website')}</span></div>
    <div><small>Phone</small><span>${show(c.phoneDisplay, 'See website contact page')}</span></div>
    <div><small>Email</small><span>${show(c.email, 'See website contact page')}</span></div>
    ${site.locations.filter((l) => !isPlaceholder(l.address)).map((l) => `<div style="grid-column:1/-1"><small>${esc(l.name)}</small><span>${esc(l.address)}, ${esc(l.city)}</span></div>`).join('')}
  </div>
  <a class="apply" href="${esc(site.url)}/${esc(p.applyUrl)}">Apply now →</a>
</section>
</body></html>`;
}

function ogHtml({ title, sub, accent = '#3fd5e0', accent2 = '#f5b544', rgb = '63, 213, 224', viz = '', kicker = 'NeuralVarsity' }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}${CSS({ accent, accent2, accentRgb: rgb })}
  body{margin:0} .og{width:1200px;height:630px;position:relative;overflow:hidden;background:radial-gradient(80% 90% at 100% 0%,rgba(${rgb},.45),transparent 60%),radial-gradient(70% 70% at 0% 100%,rgba(${rgb},.2),transparent 60%),#070a12;color:#fff;padding:64px 72px;display:flex;flex-direction:column}
  .og .b{display:flex;align-items:center;gap:14px;font-family:Sora;font-weight:700;font-size:30px} .og .b img{width:48px;height:48px;border-radius:12px}
  .og .k{margin-top:auto;font-family:JBM;font-size:20px;letter-spacing:.18em;text-transform:uppercase;color:${accent}}
  .og h1{color:#fff;font-size:76px;line-height:1;letter-spacing:-.045em;margin-top:18px;max-width:760px}
  .og p{margin-top:22px;font-size:26px;color:#c4cede;max-width:700px}
  .og .v{position:absolute;right:40px;top:150px;width:470px}</style></head><body><div class="og">
  <div class="b"><img src="${LOGO}">NeuralVarsity</div><div class="v">${viz}</div>
  <p class="k">${esc(kicker)}</p><h1>${title}</h1><p>${esc(sub)}</p></div></body></html>`;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
fs.mkdirSync(r('generated/brochures'), { recursive: true });
fs.mkdirSync(r('generated/og'), { recursive: true });
for (const p of PROGRAMS) {
  const page = await ctx.newPage();
  await page.setContent(brochureHtml(p), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = r('generated', p.brochure);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.close();
  console.log('✓ brochure', path.relative(ROOT, out), `${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
const shots = [
  { file: 'og-home.png', title: 'Learn AI by <span style="background:linear-gradient(90deg,#3fd5e0,#f5b544);-webkit-background-clip:text;color:transparent">building it.</span>', sub: `${STATS.programs} programs · ${STATS.sessions} sessions · ${STATS.projects} projects`, viz: programViz('aiml') },
  { file: 'og-programs.png', title: 'Four paths into data &amp; AI.', sub: PROGRAMS.map((p) => p.short).join(' · '), viz: programViz('ds') },
  { file: 'og-apply.png', title: 'Apply in under three minutes.', sub: 'Choose a program — an advisor will reach out.', viz: programViz('aaa') },
  ...PROGRAMS.map((p) => ({ file: `og-${p.key}.png`, title: esc(p.name), sub: `${p.duration} · ${p.sessions} sessions · ${p.projects.length} projects`, accent: p.accent, accent2: p.accent2, rgb: p.accentRgb, viz: programViz(p.key), kicker: `Program ${p.number}` })),
];
const og = await ctx.newPage();
await og.setViewportSize({ width: 1200, height: 630 });
for (const s of shots) {
  await og.setContent(ogHtml(s), { waitUntil: 'load' });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: r('generated/og', s.file) });
}
console.log(`✓ ${shots.length} social images → generated/og/`);
await browser.close();
