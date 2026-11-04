/* Data Analyst with GenAI — scroll story scenes + interactive demos. */
import { initChapters, T } from '../shared/chapters.js';
import { initProgramPage } from '../shared/program.js';

const { gsap, ScrollTrigger, $, $$, reduced, finePointer, onReady } = window.NV;

/** Run fn(time) whenever the timeline updates (scrub or play). */
function onTime(tl, fn) {
  (tl.__fns || (tl.__fns = [])).push(fn);
  tl.eventCallback('onUpdate', () => tl.__fns.forEach((f) => f(tl.time())));
}
const pad10 = (tl, d = 10) => tl.to({}, { duration: 0.001 }, d - 0.001);

/* ------------------------------------------------------------------ hero */
function hero() {
  const root = $('[data-da-hero]');
  if (!root) return;
  if (finePointer && !reduced) {
    const chips = $$('[data-par]', root);
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      chips.forEach((c) => gsap.to(c, { x: x * 40 * +c.dataset.par, y: y * 30 * +c.dataset.par, duration: 1.2, ease: 'power3.out' }));
    }, { passive: true });
  }
  const typed = $('[data-hero-type]', root);
  const total = $('[data-hero-total]', root);
  const F = [['=SUMIFS(F2:F7, B2:B7, "West")', '33,950'], ['=COUNTIFS(B2:B7, "West", E2:E7, ">10")', '2'], ['=AVERAGEIFS(F2:F7, D2:D7, "Laptop")', '16,250'], ['=MAX(FILTER(F2:F7, B2:B7="West"))', '18,200']];
  if (typed && !reduced) {
    let k = 0;
    const cycle = () => {
      const [f, v] = F[k % F.length]; k++;
      const o = { n: 0 };
      gsap.timeline({ onComplete: () => setTimeout(cycle, 2200) })
        .to(o, { n: f.length, duration: f.length * 0.045, ease: 'none', onUpdate: () => { typed.textContent = f.slice(0, Math.round(o.n)); } })
        .call(() => { total.textContent = v; gsap.fromTo(total, { backgroundColor: 'rgba(62,224,143,0.45)' }, { backgroundColor: 'rgba(62,224,143,0.12)', duration: 0.8 }); });
    };
    setTimeout(cycle, 1600);
  }
  if (!reduced) {
    gsap.to('.da-hero__sheet', { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '[data-phero]', start: 'top top', end: 'bottom top', scrub: true } });
  }
}

/* ------------------------------------------------------------------ Excel */
function cellsInCol(grid, col) { return $$('[data-xl-row]', grid).map((r) => r.children[col]); }
function placeOver(el, cells, host) {
  const h = host.getBoundingClientRect();
  const rs = cells.map((c) => c.getBoundingClientRect());
  const l = Math.min(...rs.map((r) => r.left)), t = Math.min(...rs.map((r) => r.top)), R = Math.max(...rs.map((r) => r.right)), B = Math.max(...rs.map((r) => r.bottom));
  Object.assign(el.style, { left: `${l - h.left}px`, top: `${t - h.top}px`, width: `${R - l}px`, height: `${B - t}px` });
}
function excel(stage) {
  const sheet = $('.xl-sheet', stage), grid = $('[data-xl]', stage);
  const fs = $$('.xl-f', stage), ref = $('[data-xl-ref]', stage);
  const raws = $$('.xl-raw', stage), cleans = $$('.xl-clean', stage);
  const antsB = $('.xl-ants--b', stage), antsF = $('.xl-ants--f', stage), spill = $('.xl-spillbox', stage);
  const result = $('[data-xl-result]', stage), chart = $('[data-xl-chart]', stage);
  const spills = $$('.xl-spill', stage).slice(0, 4), bars = $$('.xl-chart__col i', stage);
  const layout = () => { placeOver(antsB, cellsInCol(grid, 2), sheet); placeOver(antsF, cellsInCol(grid, 6), sheet); placeOver(spill, cellsInCol(grid, 8).slice(0, 4), sheet); };
  layout();
  ScrollTrigger.addEventListener('refresh', layout);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  const showF = (i, at) => { tl.to(fs.filter((_, j) => j !== i), { opacity: 0, duration: 0.25 }, at).to(fs[i], { opacity: 1, duration: 0.35 }, at); };
  tl.from($$('[data-xl-row]', stage), { opacity: 0, y: 10, stagger: 0.07, duration: 0.5 }, 0);
  showF(0, 0.6);
  tl.to(raws, { opacity: 0, duration: 0.4, stagger: 0.12 }, 1.2).to(cleans, { opacity: 1, duration: 0.4, stagger: 0.12 }, 1.35);
  showF(1, 2.7);
  tl.to([antsB, antsF], { opacity: 1, duration: 0.4, stagger: 0.25 }, 2.9);
  const num = { v: 0 };
  tl.to(num, { v: 33950, duration: 1, onUpdate: () => { result.textContent = Math.round(num.v).toLocaleString('en-US'); } }, 3.3);
  showF(2, 4.7);
  tl.to([antsB, antsF], { opacity: 0, duration: 0.3 }, 4.7).to(grid, { '--heatOn': 1, duration: 1.1 }, 4.9);
  showF(3, 6.5);
  tl.to(spill, { opacity: 1, duration: 0.4 }, 6.6).to(spills, { opacity: 1, duration: 0.3, stagger: 0.15 }, 6.8);
  showF(4, 8.2);
  tl.to(grid, { '--sparkOn': 1, duration: 0.6 }, 8.3).to(chart, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 8.5).to(bars, { scaleY: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)' }, 8.9);
  pad10(tl);
  const refs = [[0, 'C2'], [2.7, 'F9'], [4.7, 'F2:F8'], [6.5, 'I2'], [8.2, 'G2']];
  onTime(tl, (t) => {
    let r = refs[0][1]; refs.forEach(([at, v]) => { if (t >= at) r = v; });
    ref.textContent = r;
    result.classList.toggle('is-on', t >= 2.9);
  });
  return { tl, steps: [0, 0.27, 0.47, 0.65, 0.82] };
}

/* ------------------------------------------------------------------ Power Query */
function pq(stage) {
  const table = $('[data-pq]', stage), stepsLi = $$('[data-pq-step]', stage);
  const rows = $$('.pq__row:not(.pq__row--h)', stage);
  const col = (i) => rows.map((r) => r.children[i]);
  const swap = (cells, at) => {
    tl.to(cells.map((c) => $('.pq__raw', c)), { opacity: 0, duration: 0.35, stagger: 0.08 }, at);
    tl.to(cells.map((c) => $('.pq__ok', c)), { opacity: 1, duration: 0.35, stagger: 0.08 }, at + 0.15);
  };
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from(rows, { opacity: 0, x: -14, stagger: 0.08, duration: 0.4 }, 0.1);
  swap([...col(2), ...col(3)], 2.7);
  swap(col(1), 4.1);
  tl.fromTo($$('.pq__null', stage), { backgroundColor: 'rgba(245,181,68,0)' }, { backgroundColor: 'rgba(245,181,68,0.25)', duration: 0.4, yoyo: true, repeat: 1 }, 5.5);
  tl.to(table, { '--segW': '0.8fr', duration: 0.8 }, 6.9);
  tl.from($$('.pq__seg', stage), { opacity: 0, x: 16, stagger: 0.05, duration: 0.4 }, 7.2);
  tl.to($('[data-pq-append]', stage), { opacity: 1, y: 0, duration: 0.6 }, 8.3);
  pad10(tl);
  const at = [0, 1.2, 2.6, 4.0, 5.4, 6.8, 8.2];
  const tyEls = $$('.pq__row--h .pq__ty', stage);
  onTime(tl, (t) => {
    let k = 0; at.forEach((a, i) => { if (t >= a) k = i; });
    stepsLi.forEach((li, i) => { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    table.classList.toggle('is-headers', t >= 1.2);
    table.classList.toggle('has-seg', t >= 6.85);
    const typed = t >= 2.6;
    table.classList.toggle('is-typed', typed);
    const labels = typed ? ['ABC', 'ABC', '📅', '1.2', 'ABC'] : ['ABC', 'ABC', 'ABC', 'ABC', 'ABC'];
    tyEls.forEach((el, i) => { if (el.textContent !== labels[i]) el.textContent = labels[i]; });
  });
  return { tl, steps: [0, 0.4, 0.54, 0.68] };
}

/* ------------------------------------------------------------------ SQL + joins */
const CUST = [[1, 'Aisha', 'Austin'], [2, 'Rahul', 'Berlin'], [3, 'Sofia', 'Lisbon'], [4, 'Omar', 'Nairobi']];
const ORD = [[101, 1, 1200], [102, 2, 800], [103, 1, 450], [104, 3, 975], [105, 9, 300]];
function joinRows(type) {
  const byC = new Map(CUST.map((c) => [c[0], { name: c[1], city: c[2], rev: 0, has: false }]));
  const orphans = [];
  ORD.forEach(([, cid, amt]) => { const c = byC.get(cid); if (c) { c.rev += amt; c.has = true; } else orphans.push(amt); });
  let rows = [];
  byC.forEach((c) => { if (c.has || type === 'LEFT' || type === 'FULL') rows.push([c.name, c.city, c.has ? c.rev : null]); });
  if (type === 'RIGHT' || type === 'FULL') orphans.forEach((a) => rows.push([null, null, a]));
  if (type === 'RIGHT') rows = rows.filter((r) => r[2] !== null);
  return rows.sort((a, b) => (b[2] || 0) - (a[2] || 0));
}
let sqlManual = false;
function setJoin(stage, type, user = false) {
  if (user) sqlManual = true;
  const venn = $('[data-venn]', stage), body = $('[data-sql-res] tbody', stage);
  if (!venn || venn.dataset.j === type) return;
  venn.dataset.j = type;
  venn.setAttribute('class', `venn j-${type.toLowerCase()}`);
  $$('[data-j]', stage).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.j === type)));
  const kw = $$('.t-kw', $('[data-sql-code]', stage)).find((s) => /^(INNER|LEFT|RIGHT|FULL)$/.test(s.textContent));
  if (kw) kw.textContent = type;
  const rows = joinRows(type);
  const cell = (v, n) => (v === null ? '<td class="is-null">NULL</td>' : `<td>${n ? v.toLocaleString('en-US') : v}</td>`);
  body.innerHTML = rows.map((r, i) => `<tr style="animation-delay:${i * 60}ms">${cell(r[0])}${cell(r[1])}${cell(r[2], true)}</tr>`).join('');
  const rc = $('[data-sql-rows]', stage); if (rc) rc.textContent = `${rows.length} rows`;
}
function sql(stage) {
  const code = $('[data-sql-code]', stage), venn = $('[data-venn]', stage), res = $('[data-sql-res]', stage);
  setJoin(stage, 'INNER');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  T.typeLines(tl, code, 0.1, 0.55);
  tl.from($$('.venn__o', venn), { strokeDashoffset: 400, duration: 1.2, stagger: 0.2 }, 2.6);
  tl.from(res, { opacity: 0, y: 14, duration: 0.6 }, 4.4);
  pad10(tl);
  onTime(tl, (t) => {
    if (sqlManual) return;
    setJoin(stage, t >= 9 ? 'FULL' : t >= 8 ? 'RIGHT' : t >= 7 ? 'LEFT' : 'INNER');
  });
  return { tl, steps: [0, 0.27, 0.45, 0.7] };
}

/* ------------------------------------------------------------------ Power BI */
const MONTHS = 12;
const REG = {
  North: { rev: 881770, ord: 2502, yoy: 6.8, cats: [318, 236, 131, 117, 80], m: [62, 64, 66, 70, 71, 73, 76, 78, 77, 80, 82, 83], ch: [54, 31, 15] },
  South: { rev: 1190450, ord: 2990, yoy: 11.9, cats: [402, 361, 168, 152, 107], m: [80, 84, 88, 90, 96, 99, 101, 104, 108, 110, 112, 118], ch: [61, 26, 13] },
  East: { rev: 1064120, ord: 2861, yoy: 9.4, cats: [371, 309, 160, 133, 91], m: [76, 78, 81, 84, 86, 89, 90, 92, 95, 96, 98, 99], ch: [59, 27, 14] },
  West: { rev: 1482300, ord: 3593, yoy: 18.2, cats: [560, 433, 205, 170, 114], m: [96, 99, 104, 110, 116, 120, 126, 131, 133, 140, 146, 161], ch: [68, 21, 11] },
};
REG.All = {
  rev: Object.values(REG).reduce((s, r) => s + r.rev, 0), ord: Object.values(REG).reduce((s, r) => s + r.ord, 0), yoy: 12.4,
  cats: [0, 1, 2, 3, 4].map((i) => Object.values(REG).reduce((s, r) => s + r.cats[i], 0)),
  m: Array.from({ length: MONTHS }, (_, i) => Object.values(REG).reduce((s, r) => s + r.m[i], 0)),
  ch: [62, 26, 12],
};
const fmtM = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : `${(v / 1e3).toFixed(0)}K`);
let biManual = false, biRegion = null;
function biPath(vals, max, py = false) {
  return vals.map((v, i) => `${i ? 'L' : 'M'}${((i / (MONTHS - 1)) * 320).toFixed(1)} ${(125 - (v * (py ? 0.88 : 1) / max) * 105).toFixed(1)}`).join(' ');
}
function setRegion(root, r, user = false) {
  if (user) biManual = true;
  if (biRegion === r) return;
  biRegion = r;
  const d = REG[r];
  $$('[data-r]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === r)));
  const max = Math.max(...REG.All.m);
  const k = (n, v, w) => { const el = $(`[data-kpi="${n}"]`, root); if (el) el.textContent = v; const bar = $(`[data-kpibar="${n}"]`, root); if (bar) bar.style.width = `${w}%`; };
  k('rev', fmtM(d.rev), (d.rev / REG.All.rev) * 100);
  k('ord', d.ord.toLocaleString('en-US'), (d.ord / REG.All.ord) * 100);
  k('aov', Math.round(d.rev / d.ord).toLocaleString('en-US'), 70 + (d.rev / d.ord - 350) / 2);
  k('yoy', `+${d.yoy.toFixed(1)}%`, d.yoy * 4.5);
  const cmax = Math.max(...d.cats);
  ['Laptops', 'Phones', 'Tablets', 'Monitors', 'Accessories'].forEach((c, i) => {
    const bar = $(`[data-bar="${c}"]`, root), v = $(`[data-barv="${c}"]`, root);
    if (bar) bar.style.width = `${(d.cats[i] / cmax) * 100}%`;
    if (v) v.textContent = `${d.cats[i]}K`;
  });
  const lm = r === 'All' ? max : max / 3.4;
  const cy = $('[data-line-cy]', root), py = $('[data-line-py]', root);
  if (cy) cy.setAttribute('d', biPath(d.m, lm));
  if (py) py.setAttribute('d', biPath(d.m.map((v, i) => v * (1 - d.yoy / 100) * (0.96 + 0.04 * Math.sin(i))), lm, true));
  let off = 0;
  ['on', 're', 'pa'].forEach((key, i) => {
    const arc = $(`[data-arc="${key}"]`, root);
    if (arc) { arc.style.strokeDasharray = `${d.ch[i]} ${100 - d.ch[i]}`; arc.style.strokeDashoffset = `${-off}`; }
    off += d.ch[i];
  });
  const dv = $('[data-donut-v]', root); if (dv) dv.textContent = `${d.ch[0]}%`;
}
function clearBI(root) {
  biRegion = null;
  $$('[data-kpi]', root).forEach((e) => (e.textContent = '—'));
  $$('[data-kpibar], [data-bar]', root).forEach((e) => (e.style.width = '0%'));
  $$('[data-barv]', root).forEach((e) => (e.textContent = ''));
  $$('[data-arc]', root).forEach((a) => { a.style.strokeDasharray = '0 100'; });
  const flat = `M0 125 L320 125`;
  $$('[data-line-cy], [data-line-py]', root).forEach((p) => p.setAttribute('d', flat));
}
function bi(stage) {
  const root = $('[data-bi]', stage);
  const model = $('[data-bi-model]', stage), dax = $('[data-bi-dax]', stage);
  const tiles = $$('.bi__tile', stage);
  clearBI(root);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from(model, { opacity: 0, y: 30, scale: 0.94, duration: 0.6 }, 0);
  tl.from($$('.bi__ent', model), { opacity: 0, scale: 0.6, transformOrigin: 'center', stagger: 0.12, duration: 0.4 }, 0.3);
  tl.to($$('.bi__rel path', model), { strokeDashoffset: 0, duration: 0.8, stagger: 0.15 }, 0.9);
  tl.from(dax, { opacity: 0, y: 30, duration: 0.6 }, 2);
  T.typeLines(tl, $('[data-dax]', dax), 2.3, 0.6);
  tl.to(model, { opacity: 0, y: -20, scale: 0.92, duration: 0.5 }, 4.1).to(dax, { opacity: 0, y: 20, duration: 0.5 }, 4.2);
  tl.from(tiles, { opacity: 0, y: 34, rotateX: 18, transformPerspective: 800, stagger: 0.09, duration: 0.6 }, 4.4);
  tl.to($('[data-rls]', stage), { opacity: 1, duration: 0.5 }, 8.4);
  pad10(tl);
  onTime(tl, (t) => {
    if (t >= 5.2 && !biRegion) setRegion(root, 'All');
    if (t < 5.0 && biRegion && !biManual) clearBI(root);
    if (!biManual && biRegion) setRegion(root, t >= 9 ? 'West' : 'All');
  });
  return { tl, steps: [0, 0.2, 0.44, 0.84] };
}

/* ------------------------------------------------------------------ Python notebook */
function py(stage) {
  const cells = $$('[data-cell]', stage);
  const nb = $('[data-nb]', stage), scroller = $('[data-nb-scroll]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  const windows = [];
  // keep the running cell in view (desktop notebook has a fixed height)
  const shift = (i) => () => (window.innerWidth < 1024 ? 0 : -Math.max(0, cells[i].offsetTop + cells[i].offsetHeight - nb.clientHeight + 24));
  ScrollTrigger.addEventListener('refreshInit', () => tl.invalidate());
  cells.forEach((c, i) => {
    const at = 0.2 + i * 2.45;
    const end = T.typeLines(tl, $('.code', c), at, 0.42);
    tl.to($('.nb__out', c), { opacity: 1, duration: 0.4 }, end + 0.35);
    $$('.nb__l', c).forEach((l, j) => tl.to(l, { strokeDashoffset: 0, duration: 0.9 }, end + 0.4 + j * 0.12));
    windows.push([at, end + 0.35]);
    if (i >= 2) tl.to(scroller, { y: shift(i), duration: 0.8, ease: 'power2.inOut' }, end + 0.5);
  });
  pad10(tl);
  onTime(tl, (t) => {
    cells.forEach((c, i) => {
      const [a, e] = windows[i];
      const p = $('[data-p]', c);
      const label = t < a ? 'In [ ]:' : t < e ? 'In [*]:' : `In [${i + 1}]:`;
      if (p.textContent !== label) p.textContent = label;
      c.classList.toggle('is-run', t >= a && t < e + 0.6);
    });
  });
  return { tl, steps: [0, 0.25, 0.5, 0.74] };
}

/* ------------------------------------------------------------------ Statistics */
const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
function cdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
const ZC = { '0.10': 1.645, '0.05': 1.96, '0.01': 2.576 };
function setupStats() {
  const root = $('[data-st]');
  if (!root) return null;
  const svg = $('[data-st-svg]', root);
  const X = (z) => 20 + ((z + 4) / 8) * 480, Y = (d) => 220 - (d / 0.4) * 186;
  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; };
  // Binomial(24, .5) bars on the z scale
  const n = 24, sd = Math.sqrt(n * 0.25), bars = $('[data-st-bars]', root);
  let c = 1; const comb = [1]; for (let k = 1; k <= n; k++) { c = c * (n - k + 1) / k; comb.push(c); }
  for (let k = 2; k <= 22; k++) { const z = (k - 12) / sd, w = 1 / sd, dens = comb[k] / 2 ** n * sd; mk('rect', { x: X(z - w / 2) + 1, y: Y(dens), width: (w / 8) * 480 - 2, height: 220 - Y(dens), rx: 2 }, bars); }
  // Curve + area helper
  const curve = (a, b, step = 0.04) => { let d = ''; for (let z = a; z <= b + 1e-9; z += step) d += `${d ? 'L' : 'M'}${X(z).toFixed(1)} ${Y(phi(z)).toFixed(1)}`; return d; };
  const area = (a, b) => `${curve(a, b)} L${X(b).toFixed(1)} 220 L${X(a).toFixed(1)} 220 Z`;
  $('[data-st-curve]', root).setAttribute('d', curve(-4, 4));
  const bands = $('[data-st-bands]', root);
  [[3, '99.7%', 0.1], [2, '95.4%', 0.16], [1, '68.3%', 0.26]].forEach(([s, lab, op]) => {
    const p = mk('path', { d: area(-s, s), fill: `rgba(62,224,143,${op})`, 'data-band': s }, bands);
    const t = mk('text', { x: X(0), y: Y(phi(0)) + 18 + (3 - s) * 0 + (s === 1 ? 40 : s === 2 ? 70 : 96), 'text-anchor': 'middle', 'data-band-l': s }, bands); t.textContent = `±${s}σ · ${lab}`;
    p.style.opacity = 0; t.style.opacity = 0;
  });
  const ticks = $('[data-st-ticks]', root);
  for (let z = -3; z <= 3; z++) { const t = mk('text', { x: X(z), y: 238, 'text-anchor': 'middle' }, ticks); t.textContent = z === 0 ? '0' : `${z}σ`; }
  let alpha = '0.05', zv = 2.1;
  const tailL = $('[data-tail-l]', root), tailR = $('[data-tail-r]', root), zg = $('[data-st-z]', root), slider = $('[data-z]', root);
  function update() {
    const zc = ZC[alpha];
    tailL.setAttribute('d', area(-4, -zc)); tailR.setAttribute('d', area(zc, 4));
    zg.setAttribute('transform', `translate(${X(zv).toFixed(1)} 0)`);
    $('[data-z-label]', root).textContent = `z = ${zv.toFixed(2)}`;
    $('[data-z-val]', root).textContent = zv.toFixed(2);
    const p = 2 * (1 - cdf(Math.abs(zv)));
    $('[data-p-val]', root).textContent = p < 0.001 ? '< 0.001' : p.toFixed(3);
    const rej = p < parseFloat(alpha);
    const v = $('[data-verdict]', root); v.textContent = rej ? 'Reject H₀' : 'Fail to reject H₀'; v.classList.toggle('is-keep', !rej);
    slider.value = zv; slider.style.setProperty('--p', `${((zv + 3.6) / 7.2) * 100}%`);
  }
  slider.addEventListener('input', () => { zv = parseFloat(slider.value); root.__manual = true; update(); });
  $$('[data-a]', root).forEach((b) => b.addEventListener('click', () => { alpha = b.dataset.a; $$('[data-a]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update(); }));
  // Drag on the plot
  const toZ = (e) => { const r = svg.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 520; return Math.max(-3.6, Math.min(3.6, ((x - 20) / 480) * 8 - 4)); };
  let drag = false;
  svg.addEventListener('pointerdown', (e) => { drag = true; root.__manual = true; svg.setPointerCapture(e.pointerId); zv = toZ(e); update(); });
  svg.addEventListener('pointermove', (e) => { if (drag) { zv = toZ(e); update(); } });
  svg.addEventListener('pointerup', () => { drag = false; });
  update();
  return { setZ: (z) => { if (!root.__manual) { zv = z; update(); } } };
}
let statsApi = null;
function stats(stage) {
  const root = $('[data-st]', stage);
  const bars = $$('[data-st-bars] rect', root), curve = $('[data-st-curve]', root);
  const len = curve.getTotalLength();
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from(bars, { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.06, duration: 0.5 }, 0.1);
  tl.fromTo(curve, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 2.4);
  [3, 2, 1].forEach((s, i) => { tl.to([`[data-band="${s}"]`, `[data-band-l="${s}"]`].map((q) => $(q, root)), { opacity: 1, duration: 0.5 }, 4.4 + i * 0.7); });
  tl.to(bars, { opacity: 0.25, duration: 0.5 }, 4.4);
  tl.to($$('[data-band], [data-band-l]', root), { opacity: 0.35, duration: 0.5 }, 6.9);
  tl.from([$('[data-tail-l]', root), $('[data-tail-r]', root)], { opacity: 0, duration: 0.5 }, 7.0);
  tl.from($('[data-st-z]', root), { opacity: 0, duration: 0.4 }, 7.2);
  pad10(tl);
  onTime(tl, (t) => {
    if (statsApi) statsApi.setZ(t < 7.6 ? 0.4 : Math.min(2.1, 0.4 + (t - 7.6) * 0.95));
    const lab = $('[data-st-label]', root);
    const txt = t < 2.4 ? 'Binomial distribution of daily orders' : t < 4.4 ? 'Normal approximation' : t < 6.9 ? 'Spread: the empirical rule' : 'Two-tailed hypothesis test';
    if (lab.textContent !== txt) lab.textContent = txt;
  });
  return { tl, steps: [0, 0.24, 0.44, 0.69] };
}

/* ------------------------------------------------------------------ GenAI co-analyst */
function setupAI() {
  const root = $('[data-ai]');
  if (!root) return;
  const prompts = JSON.parse($('[data-prompts]', root).textContent);
  const out = $('[data-prompt]', root);
  $$('[data-k]', root).forEach((b) => b.addEventListener('click', () => {
    $$('[data-k]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    gsap.fromTo(out, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
    out.textContent = prompts[b.dataset.k];
  }));
}
function ai(stage) {
  const steps = $$('[data-ai-step]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  steps.forEach((s, i) => tl.from(s, { opacity: 0, y: 22, duration: 0.6 }, [0.2, 1.9, 4.0, 6.2, 8.4][i]));
  tl.from($$('.ai__cot li', stage), { opacity: 0, x: -10, stagger: 0.35, duration: 0.4 }, 2.3);
  T.typeLines(tl, $('.ai__code .code', stage), 4.3, 0.5);
  tl.from($$('.ai__mini i', stage), { scaleX: 0, transformOrigin: 'left', stagger: 0.12, duration: 0.5 }, 6.6);
  pad10(tl);
  return { tl, steps: [0, 0.19, 0.4, 0.62] };
}

/* ------------------------------------------------------------------ Big data + ML */
function big(stage) {
  const blocks = $$('[data-blk]', stage), nodes = $$('[data-node]', stage);
  const slots = nodes.map((n) => $$('.bd__slots i', n));
  const fit = $('[data-ml-fit]', stage), sig = $('[data-ml-sig]', stage), r2 = $('[data-r2]', stage), label = $('[data-ml-label]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($('[data-bd-file]', stage), { opacity: 0, scale: 0.9, duration: 0.4 }, 0);
  tl.from(blocks, { opacity: 0, scale: 0.3, stagger: 0.06, duration: 0.35, ease: 'back.out(2)' }, 0.4);
  tl.to(blocks, { opacity: 0.35, duration: 0.4 }, 3.4);
  tl.from($$('[data-bd-dag] > *', stage), { opacity: 0, x: -8, stagger: 0.08, duration: 0.3 }, 4.0);
  tl.from($$('[data-ml-pts] circle', stage), { attr: { r: 0 }, stagger: 0.04, duration: 0.3 }, 5.6);
  tl.fromTo(fit, { attr: { y1: 120, y2: 60 } }, { attr: { y1: 136, y2: 26 }, duration: 1.1 }, 6.2);
  tl.to($$('.ml__res line', stage), { opacity: 1, stagger: 0.03, duration: 0.2 }, 6.9);
  const rr = { v: 0 };
  tl.to(rr, { v: 0.97, duration: 1, onUpdate: () => { r2.textContent = `R² = ${rr.v.toFixed(2)}`; } }, 6.4);
  tl.to([fit, ...$$('.ml__res line', stage)], { opacity: 0, duration: 0.4 }, 8.0);
  const pts = $$('[data-ml-pts] circle', stage);
  pts.forEach((c) => { if (+c.getAttribute('cx') > 150) c.classList.add('is-1'); });
  tl.to(pts, { attr: { cy: (i, c) => (+c.getAttribute('cx') > 150 ? 18 : 142) }, duration: 0.7, stagger: 0.02 }, 8.1);
  tl.to(sig, { strokeDashoffset: 0, duration: 1.2 }, 8.4);
  pad10(tl);
  // Replication: each block lands on two nodes
  const plan = blocks.map((_, i) => [i % 4, (i + 1) % 4]);
  onTime(tl, (t) => {
    const fill = Math.max(0, Math.min(blocks.length, Math.floor((t - 1.2) / 0.26)));
    slots.forEach((s) => s.forEach((x) => x.classList.remove('is-full', 'is-rep')));
    const used = [0, 0, 0, 0];
    for (let i = 0; i < fill; i++) {
      const [a, b] = plan[i];
      if (slots[a][used[a]]) slots[a][used[a]++].classList.add('is-full');
      if (slots[b][used[b]]) slots[b][used[b]++].classList.add('is-rep');
    }
    $('[data-ml-pts]', stage).classList.toggle('is-cls', t >= 8.1);
    const txt = t >= 8.0 ? 'Logistic regression · sigmoid' : 'Linear regression · OLS';
    if (label.textContent !== txt) label.textContent = txt;
    r2.style.opacity = t >= 8.0 ? 0.35 : 1;
  });
  return { tl, steps: [0, 0.38, 0.58, 0.8] };
}

/* ------------------------------------------------------------------ boot */
onReady(() => {
  initProgramPage();
  hero();
  statsApi = setupStats();
  setupAI();
  $$('[data-j]').forEach((b) => b.addEventListener('click', () => setJoin(b.closest('.chapter__stage'), b.dataset.j, true)));
  $$('[data-r]').forEach((b) => b.addEventListener('click', () => setRegion($('[data-bi]'), b.dataset.r, true)));
  initChapters({ 'da-excel': excel, 'da-pq': pq, 'da-sql': sql, 'da-bi': bi, 'da-py': py, 'da-stats': stats, 'da-ai': ai, 'da-big': big });
});
