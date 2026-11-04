/* Data Science with GenAI — scroll story scenes + interactive labs. */
import { initChapters, T } from '../shared/chapters.js';
import { initProgramPage } from '../shared/program.js';

const { gsap, ScrollTrigger, $, $$, reduced, onReady } = window.NV;
function onTime(tl, fn) { (tl.__fns || (tl.__fns = [])).push(fn); tl.eventCallback('onUpdate', () => tl.__fns.forEach((f) => f(tl.time()))); }
const pad10 = (tl, d = 10) => tl.to({}, { duration: 0.001 }, d - 0.001);
const smooth = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

/* ------------------------------------------------------------------ 3D (lazy) */
let journeyMorph = null;
function threeScenes() {
  if (reduced) return;
  window.NV.load3D().then((NV3D) => {
    if (!NV3D.webglAvailable()) return;
    const { SHAPES, PAL } = NV3D;
    const heroBox = $('[data-ds-hero-canvas]');
    if (heroBox) {
      const hero = new NV3D.ParticleMorph(heroBox, { shapes: [(n) => SHAPES.cloud(n, PAL.ds), (n) => SHAPES.clusters(n, PAL.ds), (n) => SHAPES.network(n, PAL.ds)], count: window.innerWidth < 760 ? 3500 : 8000, size: 30 });
      heroBox.parentElement.classList.add('has-gl');
      hero.setOpacity(1);
      const states = ['raw data', 'clusters', 'neural network'];
      const lab = $('[data-ds-hero-state]');
      let k = 0;
      setInterval(() => { k = (k + 1) % 4; const target = [0, 1, 2, 1][k]; hero.setProgress(target); if (lab) lab.textContent = `state: ${states[target]}`; }, 3600);
    }
    const box = $('[data-ds-morph-canvas]');
    if (box) {
      journeyMorph = new NV3D.ParticleMorph(box, {
        shapes: [(n) => SHAPES.table(n, PAL.ds), (n) => SHAPES.bell(n, PAL.ds), (n) => SHAPES.clusters(n, PAL.ds), (n) => SHAPES.network(n, ['#4aa8ff', '#8b7cff']), (n) => SHAPES.text(n, ['#5fe1e8', '#8b7cff'], 'GenAI'), (n) => SHAPES.bars(n, ['#f2c811', '#4aa8ff', '#ffe58a'])],
        count: window.innerWidth < 760 ? 4000 : 9000, size: 30,
        layouts: [{ x: 0, y: -0.1, s: 1 }, { x: 0, y: 0.1, s: 1 }, { x: 0, y: 0, s: 0.95 }, { x: 0, y: 0, s: 0.95 }, { x: 0, y: 0, s: 0.85 }, { x: 0, y: -0.1, s: 0.95 }],
      });
      box.parentElement.classList.add('has-gl');
      journeyMorph.setOpacity(1);
    }
  }).catch(() => {});
}

function journey(stage) {
  const caps = JSON.parse($('[data-ds-caps]', stage).textContent);
  const cap = $('[data-ds-cap]', stage), month = $('[data-ds-month]', stage), dots = $$('[data-ds-dot]', stage);
  const tl = gsap.timeline({ paused: true });
  pad10(tl);
  let last = -1;
  onTime(tl, (t) => {
    const s = Math.min((t / 10) * 6, 5.999), i = Math.floor(s), f = s - i;
    const shape = i >= 5 ? 5 : i + smooth((f - 0.62) / 0.38);
    if (journeyMorph) journeyMorph.setProgress(shape);
    const k = Math.min(5, Math.round(shape));
    if (k !== last) {
      last = k;
      cap.textContent = caps[k]; month.textContent = `Month ${String(k + 1).padStart(2, '0')}`;
      dots.forEach((d, j) => d.classList.toggle('is-on', j === k));
      gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
    }
  });
  return { tl, steps: [0, 1, 2, 3, 4, 5].map((i) => i / 6 + (i ? 0.1 / 6 : 0)), mobileSpeed: 0.7 };
}

/* ------------------------------------------------------------------ scrape */
function scrape(stage) {
  const lines = $$('[data-scr-html] .code__line', stage);
  const rows = $$('[data-scr-row]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from(lines, { opacity: 0, x: -8, stagger: 0.12, duration: 0.3 }, 0);
  T.typeLines(tl, $('[data-scr-py]', stage), 2.2, 0.55);
  tl.from(rows, { opacity: 0, x: 12, stagger: 0.25, duration: 0.35 }, 5.6);
  tl.from($$('.scr__df .num', stage), { color: '#ff9aa5', stagger: 0.05, duration: 0.4 }, 7.4);
  pad10(tl);
  onTime(tl, (t) => {
    const hit = t < 5.4 ? -1 : Math.min(4, Math.floor((t - 5.4) / 0.5) + 1);
    lines.forEach((l, i) => l.classList.toggle('is-hit', i === hit));
  });
  return { tl, steps: [0, 0.24, 0.56, 0.74] };
}

/* ------------------------------------------------------------------ Central Limit Theorem */
const POP = {
  uniform: (r) => r(),
  skewed: (r) => { let v; do { v = -Math.log(1 - r() * 0.999) / 4.2; } while (v > 1); return v; },
  bimodal: (r) => { const g = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }; return Math.max(0, Math.min(1, r() < 0.5 ? 0.25 + g() * 0.08 : 0.74 + g() * 0.08)); },
};
function setupCLT() {
  const root = $('[data-clt]');
  if (!root) return null;
  const pop = $('[data-clt-pop]', root), means = $('[data-clt-means]', root), count = $('[data-clt-count]', root);
  const nIn = $('[data-clt-n]', root), nVal = $('[data-clt-nval]', root);
  const st = { shape: 'skewed', n: 30, list: [], manual: false, auto: 0 };
  const accent = '#4aa8ff';
  function sampleMean(r) { let s = 0; for (let i = 0; i < st.n; i++) s += POP[st.shape](r); return s / st.n; }
  function gen(m) { const r = rng(1234 + st.n * 7 + st.shape.length * 101); const out = []; for (let i = 0; i < m; i++) out.push(sampleMean(r)); return out; }
  let pre = gen(400);
  function drawPop() {
    const g = pop.getContext('2d'), W = pop.width, H = pop.height;
    g.clearRect(0, 0, W, H);
    const bins = 40, h = new Array(bins).fill(0), r = rng(99);
    for (let i = 0; i < 6000; i++) h[Math.min(bins - 1, Math.floor(POP[st.shape](r) * bins))]++;
    const mx = Math.max(...h);
    h.forEach((v, i) => { const bh = (v / mx) * (H - 20); g.fillStyle = 'rgba(139,124,255,0.55)'; g.fillRect(10 + i * ((W - 20) / bins) + 1, H - 10 - bh, (W - 20) / bins - 2, bh); });
  }
  function drawMeans(list) {
    const g = means.getContext('2d'), W = means.width, H = means.height;
    g.clearRect(0, 0, W, H);
    const bins = 46, lo = 0, hi = 1, h = new Array(bins).fill(0);
    list.forEach((m) => { h[Math.max(0, Math.min(bins - 1, Math.floor(((m - lo) / (hi - lo)) * bins)))]++; });
    const mx = Math.max(4, ...h);
    h.forEach((v, i) => { const bh = (v / mx) * (H - 28); g.fillStyle = accent; g.globalAlpha = 0.75; g.fillRect(10 + i * ((W - 20) / bins) + 1, H - 14 - bh, (W - 20) / bins - 2, bh); });
    g.globalAlpha = 1;
    if (list.length > 8) {
      const mean = list.reduce((a, b) => a + b, 0) / list.length;
      const sd = Math.sqrt(list.reduce((a, b) => a + (b - mean) ** 2, 0) / list.length) || 0.01;
      g.strokeStyle = '#f5b544'; g.lineWidth = 2.5 * (W / 460); g.beginPath();
      const N = list.length, bw = 1 / bins;
      for (let i = 0; i <= 250; i++) {
        const x = i / 250;
        const pdf = Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
        const yy = ((N * pdf * bw) / mx) * (H - 28);
        g[i ? 'lineTo' : 'moveTo'](10 + x * (W - 20), Math.max(4, H - 14 - yy));
      }
      g.stroke();
      g.fillStyle = '#aab4c5'; g.font = `${11 * (W / 460)}px JetBrains Mono, monospace`; g.textAlign = 'right';
      g.fillText(`mean ${mean.toFixed(3)} · SE ${sd.toFixed(3)}`, W - 12, 18 * (W / 460)); g.textAlign = 'left';
    }
    count.textContent = `${list.length} samples`;
  }
  function render() { drawMeans(st.manual ? st.list : pre.slice(0, st.auto)); }
  const resize = () => { [pop, means].forEach((cv) => { const r = cv.getBoundingClientRect(); if (!r.width) return; const ratio = cv === pop ? 150 / 460 : 190 / 460; cv.width = Math.round(r.width * dpr()); cv.height = Math.round(r.width * ratio * dpr()); }); drawPop(); render(); };
  window.addEventListener('resize', resize);
  $$('[data-shape]', root).forEach((b) => b.addEventListener('click', () => {
    st.shape = b.dataset.shape; $$('[data-shape]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    pre = gen(400); st.list = st.manual ? [] : st.list; drawPop(); render();
  }));
  nIn.addEventListener('input', () => { st.n = +nIn.value; nVal.textContent = st.n; nIn.style.setProperty('--p', `${((st.n - 2) / 58) * 100}%`); pre = gen(400); if (st.manual) st.list = []; render(); });
  nIn.style.setProperty('--p', `${((30 - 2) / 58) * 100}%`);
  $('[data-clt-draw]', root).addEventListener('click', () => {
    if (!st.manual) { st.manual = true; st.list = pre.slice(0, st.auto); }
    const r = rng(Date.now() & 0xffff); for (let i = 0; i < 50; i++) st.list.push(sampleMean(r)); render();
  });
  $('[data-clt-reset]', root).addEventListener('click', () => { st.manual = true; st.list = []; render(); });
  requestAnimationFrame(resize);
  return { setAuto: (k) => { if (st.manual) return; const v = Math.round(k); if (v !== st.auto) { st.auto = v; render(); } }, resize };
}
let cltApi = null;
function clt(stage) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($('.clt__plots > div:first-child', stage), { opacity: 0, y: 16, duration: 0.6 }, 0.2);
  tl.from($('.clt__plots > div:last-child', stage), { opacity: 0, y: 16, duration: 0.6 }, 1.6);
  pad10(tl);
  onTime(tl, (t) => { if (cltApi) cltApi.setAuto(t < 2.4 ? 0 : Math.pow((t - 2.4) / 7.6, 1.6) * 400); });
  return { tl, steps: [0, 0.2, 0.4, 0.7] };
}

/* ------------------------------------------------------------------ K-means */
const KCOL = ['#4aa8ff', '#8b7cff', '#5fe1e8', '#f472d0', '#f5b544', '#3ee08f'];
function setupKMeans() {
  const root = $('[data-km]');
  if (!root) return null;
  const cv = $('[data-km-canvas]', root), g = cv.getContext('2d');
  const kIn = $('[data-km-k]', root), kVal = $('[data-km-kval]', root), iterEl = $('[data-km-iter]', root), inEl = $('[data-km-inertia]', root);
  const st = { k: 4, pts: [], cents: [], assign: [], iter: 0, manual: false, seed: 7, running: null, phase: 'none' };
  function makeData(seed) {
    const r = rng(seed); const pts = [];
    const centers = [[0.24, 0.3], [0.72, 0.26], [0.32, 0.74], [0.76, 0.7], [0.52, 0.5]];
    centers.forEach(([cx, cy], ci) => { const n = ci === 4 ? 26 : 46; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.13; pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 1.15]); } });
    return pts;
  }
  function init() { const r = rng(st.seed * 31 + st.k); st.cents = Array.from({ length: st.k }, () => [0.1 + r() * 0.8, 0.1 + r() * 0.8]); st.assign = []; st.iter = 0; st.phase = 'init'; }
  function assign() { st.assign = st.pts.map(([x, y]) => { let b = 0, bd = 1e9; st.cents.forEach(([cx, cy], i) => { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; b = i; } }); return b; }); st.phase = 'assign'; }
  function update() { st.cents = st.cents.map((c, i) => { const m = st.pts.filter((_, j) => st.assign[j] === i); if (!m.length) return c; return [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length]; }); st.iter++; st.phase = 'update'; }
  function inertia() { if (!st.assign.length) return null; return st.pts.reduce((s, [x, y], j) => { const c = st.cents[st.assign[j]]; return s + (x - c[0]) ** 2 + (y - c[1]) ** 2; }, 0); }
  function draw() {
    const W = cv.width, H = cv.height, s = W / 760;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,0.04)'; g.lineWidth = 1;
    for (let x = 0; x <= 1; x += 0.1) { g.beginPath(); g.moveTo(x * W, 0); g.lineTo(x * W, H); g.stroke(); g.beginPath(); g.moveTo(0, x * H); g.lineTo(W, x * H); g.stroke(); }
    if (st.assign.length) st.pts.forEach(([x, y], j) => { const c = st.cents[st.assign[j]]; g.strokeStyle = KCOL[st.assign[j]] + '30'; g.beginPath(); g.moveTo(x * W, y * H); g.lineTo(c[0] * W, c[1] * H); g.stroke(); });
    st.pts.forEach(([x, y], j) => { g.fillStyle = st.assign.length ? KCOL[st.assign[j]] : 'rgba(220,230,245,0.75)'; g.beginPath(); g.arc(x * W, y * H, 4.2 * s, 0, Math.PI * 2); g.fill(); });
    if (st.phase !== 'none') st.cents.forEach(([x, y], i) => { g.fillStyle = '#05070d'; g.strokeStyle = KCOL[i]; g.lineWidth = 3 * s; g.beginPath(); g.arc(x * W, y * H, 11 * s, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = KCOL[i]; g.beginPath(); g.arc(x * W, y * H, 4 * s, 0, Math.PI * 2); g.fill(); });
    iterEl.textContent = st.iter; const it = inertia(); inEl.textContent = it == null ? '—' : it.toFixed(2);
  }
  // Deterministic sequence for scroll scrubbing: [none, init, (assign, update) × 8]
  function stateAt(idx) {
    st.pts = makeData(st.seed); st.phase = 'none'; st.assign = []; st.iter = 0;
    if (idx >= 1) init();
    for (let s = 2; s <= idx; s++) (s % 2 === 0 ? assign : update)();
    draw();
  }
  const resize = () => { const r = cv.getBoundingClientRect(); if (!r.width) return; cv.width = Math.round(r.width * dpr()); cv.height = Math.round(r.width * (420 / 760) * dpr()); draw(); };
  window.addEventListener('resize', resize);
  const goManual = () => { st.manual = true; };
  cv.addEventListener('click', (e) => { goManual(); const r = cv.getBoundingClientRect(); st.pts.push([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]); if (st.assign.length) assign(); draw(); });
  kIn.addEventListener('input', () => { goManual(); st.k = +kIn.value; kVal.textContent = st.k; kIn.style.setProperty('--p', `${((st.k - 2) / 4) * 100}%`); init(); draw(); });
  kIn.style.setProperty('--p', '50%');
  const step = () => { if (st.phase === 'none') init(); else if (st.phase === 'assign') update(); else assign(); draw(); };
  $('[data-km-step]', root).addEventListener('click', () => { goManual(); step(); });
  $('[data-km-run]', root).addEventListener('click', () => { goManual(); clearInterval(st.running); let n = 0; st.running = setInterval(() => { step(); if (++n > 16) clearInterval(st.running); }, 380); });
  $('[data-km-new]', root).addEventListener('click', () => { goManual(); st.seed = (st.seed * 13 + 5) % 997; st.pts = makeData(st.seed); st.phase = 'none'; st.assign = []; st.iter = 0; draw(); });
  st.pts = makeData(st.seed);
  requestAnimationFrame(resize);
  let lastIdx = -1;
  return { scrub: (idx) => { if (st.manual) return; const i = Math.round(idx); if (i !== lastIdx) { lastIdx = i; stateAt(i); } } };
}
let kmApi = null;
function kmeans(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($('[data-km-canvas]', stage), { opacity: 0, scale: 0.97, duration: 0.6 }, 0);
  pad10(tl);
  onTime(tl, (t) => { if (kmApi) kmApi.scrub(t < 1.2 ? 0 : Math.min(17, 1 + (t - 1.2) / 0.5)); });
  return { tl, steps: [0, 0.14, 0.2, 0.55] };
}

/* ------------------------------------------------------------------ CNN + detection */
function cnn(stage) {
  const img = $$('[data-px]', stage).map((p) => (p.classList.contains('on') ? 1 : 0));
  const fm = $$('[data-fm]', stage), win = $('[data-cnn-win]', stage), eq = $('[data-cnn-eq]', stage), arch = $$('[data-cnn-arch] li', stage);
  const K = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
  const vals = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += img[(r + i) * 10 + (c + j)] * K[i * 3 + j]; vals.push(s); }
  const mx = Math.max(...vals.map(Math.abs)) || 1;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($$('[data-px]', stage), { opacity: 0, stagger: { each: 0.006, from: 'start' }, duration: 0.2 }, 0);
  tl.from($$('[data-box]', stage), { opacity: 0, scale: 0.7, transformOrigin: 'center', stagger: 0.35, duration: 0.4 }, 8.2);
  tl.from($('[data-det]', stage), { opacity: 0.35, duration: 0.6 }, 7.6);
  pad10(tl);
  onTime(tl, (t) => {
    const pos = Math.max(0, Math.min(63, Math.floor((t - 1) / 5.2 * 64)));
    const done = t < 1 ? -1 : pos;
    const r = Math.floor(pos / 8), c = pos % 8;
    win.style.transform = `translate(${c * 100 / 3}%, ${r * 100 / 3}%)`;
    win.style.opacity = t < 1 || t > 6.4 ? 0 : 1;
    fm.forEach((cell, i) => { const on = i <= done; cell.classList.toggle('is-v', on); if (on) cell.style.setProperty('--v', (0.15 + Math.max(0, vals[i]) / mx * 0.85).toFixed(2)); });
    eq.textContent = t < 1 ? 'Σ (patch ⊙ kernel)' : `Σ (patch ⊙ kernel) = ${vals[pos]}`;
    const a = t < 6.2 ? -1 : Math.min(arch.length - 1, Math.floor((t - 6.2) / 0.28));
    arch.forEach((li, i) => li.classList.toggle('is-on', i <= a));
  });
  return { tl, steps: [0, 0.12, 0.62, 0.8] };
}

/* ------------------------------------------------------------------ NLP + GenAI */
function nlp(stage) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($$('[data-tok]', stage), { opacity: 0, y: 10, scale: 0.8, stagger: 0.14, duration: 0.35 }, 0.2);
  tl.from($$('[data-emb]', stage), { opacity: 0, scale: 0, transformOrigin: 'center', stagger: 0.12, duration: 0.35 }, 2.0);
  tl.to($$('[data-vec]', stage), { strokeDashoffset: 0, stagger: 0.3, duration: 0.6 }, 3.4);
  tl.from($('[data-nlp-att]', stage), { opacity: 0.2, duration: 0.4 }, 4.6);
  tl.from($$('[data-att]', stage), { opacity: 0, stagger: { each: 0.012, from: 'start' }, duration: 0.2 }, 4.8);
  tl.from($('[data-nlp-chat]', stage), { opacity: 0, y: 20, duration: 0.5 }, 7.0);
  const a = $('[data-nlp-a]', stage), full = a.innerHTML;
  const plainLen = a.textContent.length;
  pad10(tl);
  onTime(tl, (t) => {
    const k = t < 7.4 ? 0 : Math.min(1, (t - 7.4) / 2.2);
    if (k >= 1) { if (a.innerHTML !== full) a.innerHTML = full; return; }
    const n = Math.round(plainLen * k);
    a.textContent = full.replace(/<[^>]+>/g, '').slice(0, n);
  });
  return { tl, steps: [0, 0.2, 0.46, 0.7] };
}

/* ------------------------------------------------------------------ capstone */
function cap(stage) {
  const nodes = $$('[data-cap-node]', stage), links = $$('[data-cap-link] span', stage);
  const text = $('[data-cap-text]', stage), full = text.textContent;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  nodes.forEach((n, i) => { tl.from(n, { opacity: 0.25, y: 10, duration: 0.4 }, i * 1.2); if (links[i]) tl.to(links[i], { scaleX: 1, duration: 0.8, ease: 'none' }, i * 1.2 + 0.4); });
  tl.from($('[data-cap-dash]', stage), { opacity: 0, y: 20, duration: 0.5 }, 5.8);
  tl.from($$('.cap__bars i', stage), { scaleY: 0, stagger: 0.08, duration: 0.4 }, 6.1);
  tl.from($('[data-cap-sum]', stage), { opacity: 0, y: 20, duration: 0.5 }, 7.0);
  pad10(tl);
  onTime(tl, (t) => {
    nodes.forEach((n, i) => n.classList.toggle('is-on', t >= i * 1.2 + 0.2 && t < (i + 1) * 1.2 + 0.4 || (i === nodes.length - 1 && t >= i * 1.2)));
    const k = t < 7.3 ? 0 : Math.min(1, (t - 7.3) / 2.4);
    const s = full.slice(0, Math.round(full.length * k));
    if (text.textContent !== s) text.textContent = s;
  });
  return { tl, steps: [0, 0.12, 0.24, 0.58] };
}

onReady(() => {
  initProgramPage();
  threeScenes();
  cltApi = setupCLT();
  kmApi = setupKMeans();
  initChapters({ 'ds-journey': journey, 'ds-scrape': scrape, 'ds-clt': clt, 'ds-kmeans': kmeans, 'ds-cnn': cnn, 'ds-nlp': nlp, 'ds-cap': cap });
  ScrollTrigger.addEventListener('refresh', () => { if (cltApi) cltApi.resize(); });
});
