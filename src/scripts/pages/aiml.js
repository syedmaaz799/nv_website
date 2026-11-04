/* Applied AI & Machine Learning — scroll story scenes + interactive labs. */
import { initChapters, T } from '../shared/chapters.js';
import { initProgramPage } from '../shared/program.js';

const { gsap, ScrollTrigger, $, $$, reduced, onReady } = window.NV;
function onTime(tl, fn) { (tl.__fns || (tl.__fns = [])).push(fn); tl.eventCallback('onUpdate', () => tl.__fns.forEach((f) => f(tl.time()))); }
const pad10 = (tl, d = 10) => tl.to({}, { duration: 0.001 }, d - 0.001);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const setRange = (el, v) => { el.value = v; const p = ((v - el.min) / (el.max - el.min)) * 100; el.style.setProperty('--p', `${p}%`); };

/* ------------------------------------------------------------------ 3D */
let land = null;
function threeScenes() {
  if (reduced) return;
  window.NV.load3D().then((NV3D) => {
    if (!NV3D.webglAvailable()) return;
    const netBox = $('[data-ml-net]');
    if (netBox) {
      const net = new NV3D.NeuralNet3D(netBox, { colors: ['#a685ff', '#f472d0'], pulses: window.innerWidth < 760 ? 70 : 150 });
      netBox.parentElement.classList.add('has-gl');
      ScrollTrigger.create({ trigger: '[data-phero]', start: 'top top', end: 'bottom top', onUpdate: (st) => net.setProgress(st.progress) });
    }
    const lsBox = $('[data-ls-canvas]');
    if (lsBox) {
      land = new NV3D.LossLandscape(lsBox, { colors: { low: '#7c8cff', high: '#f472d0', line: '#c4b0ff' } });
      lsBox.parentElement.classList.add('has-gl');
      const stepEl = $('[data-ls-step]');
      let last = -1;
      land.onStep = (i) => {
        if (i === last) return; last = i;
        stepEl.textContent = i;
        land.stepInfo().forEach(({ kind, loss }) => { const el = $(`[data-ls-loss="${kind}"]`); if (el) el.textContent = loss.toFixed(3); });
      };
      land.setProgress(lsTarget);
    }
  }).catch(() => {});
}
let lsTarget = 0;

/* ------------------------------------------------------------------ Python + concurrency */
function python(stage) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  T.typeLines(tl, $('[data-py3-code]', stage), 0, 0.3);
  const thr = $$('.cc__lane--thr .cc__b', stage), mp = $$('.cc__lane--mp .cc__b', stage), aio = $$('.cc__lane--aio .cc__b', stage);
  gsap.set([...thr, ...mp, ...aio], { scaleX: 0 });
  thr.forEach((b, i) => tl.to(b, { scaleX: 1, duration: 0.55 }, 2.6 + i * 0.6));
  tl.to(mp, { scaleX: 1, duration: 1.8 }, 5.0);
  aio.forEach((b, i) => tl.to(b, { scaleX: 1, duration: 0.22 }, 6.0 + i * 0.16));
  const dots = $$('.cc__dots i', stage), n = $('[data-tests]', stage);
  pad10(tl);
  onTime(tl, (t) => {
    const k = t < 7.6 ? 0 : Math.min(24, Math.round((t - 7.6) / 2 * 24));
    n.textContent = k;
    dots.forEach((d, i) => d.classList.toggle('is-ok', i < k));
  });
  return { tl, steps: [0, 0.18, 0.26, 0.76] };
}

/* ------------------------------------------------------------------ Bias–variance */
function solve(A, b) { const n = b.length; const M = A.map((r, i) => [...r, b[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; const d = M[c][c] || 1e-12; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / (r[i] || 1e-12)); }
function polyfit(xs, ys, deg) { const X = xs.map((x) => Array.from({ length: deg + 1 }, (_, j) => (2 * x - 1) ** j)); const n = deg + 1; const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => X.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? 1e-7 : 0))); const b = Array.from({ length: n }, (_, i) => X.reduce((s, r, k) => s + r[i] * ys[k], 0)); return solve(A, b); }
const pval = (w, x) => w.reduce((s, c, j) => s + c * (2 * x - 1) ** j, 0);
let bvApi = null;
function setupBV() {
  const root = $('[data-bv]');
  if (!root) return null;
  const r = rng(42), g = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const f = (x) => Math.sin(2 * Math.PI * x) * 0.9;
  const mk = (n) => Array.from({ length: n }, () => { const x = 0.03 + r() * 0.94; return [x, f(x) + g() * 0.2]; }).sort((a, b) => a[0] - b[0]);
  const train = mk(16), test = mk(16);
  const X = (x) => 30 + x * 475, Y = (y) => 230 - ((Math.max(-1.7, Math.min(1.7, y)) + 1.7) / 3.4) * 215;
  const ns = 'http://www.w3.org/2000/svg';
  const dot = (p, parent) => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', X(p[0])); c.setAttribute('cy', Y(p[1])); c.setAttribute('r', 5); parent.appendChild(c); };
  train.forEach((p) => dot(p, $('[data-bv-train-pts]', root)));
  test.forEach((p) => dot(p, $('[data-bv-test-pts]', root)));
  $('[data-bv-true]', root).setAttribute('d', Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${X(i / 100).toFixed(1)} ${Y(f(i / 100)).toFixed(1)}`).join(' '));
  const input = $('[data-bv-d]', root), dval = $('[data-bv-dval]', root), fit = $('[data-bv-fit]', root);
  const mse = (w, pts) => pts.reduce((s, [x, y]) => s + (pval(w, x) - y) ** 2, 0) / pts.length;
  let cur = 0, manual = false;
  function set(d) {
    d = Math.round(d); if (d === cur) return; cur = d;
    const w = polyfit(train.map((p) => p[0]), train.map((p) => p[1]), d);
    $('[data-bv-curve]', root).setAttribute('d', Array.from({ length: 241 }, (_, i) => { const x = 0.02 + (i / 240) * 0.96; return `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(pval(w, x)).toFixed(1)}`; }).join(' '));
    const tr = mse(w, train), te = mse(w, test);
    $('[data-bv-train]', root).textContent = tr.toFixed(3);
    $('[data-bv-test]', root).textContent = te > 9.99 ? '> 9.99' : te.toFixed(3);
    dval.textContent = d; setRange(input, d);
    const kind = d <= 2 ? 'under' : d <= 6 ? 'good' : 'over';
    fit.textContent = { under: 'Underfit · high bias', good: 'Good fit · generalises', over: 'Overfit · high variance' }[kind];
    fit.className = `bv__fit is-${kind}`;
  }
  input.addEventListener('input', () => { manual = true; set(+input.value); });
  set(1);
  return { scrub: (d) => { if (!manual) set(d); } };
}
function bv(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($$('[data-bv-train-pts] circle, [data-bv-test-pts] circle', stage), { attr: { r: 0 }, stagger: 0.03, duration: 0.3 }, 0.2);
  pad10(tl);
  onTime(tl, (t) => { if (bvApi) bvApi.scrub(t < 2.2 ? 1 : t < 4.8 ? 1 + (t - 2.2) / 2.6 * 3 : t < 7.6 ? 4 + (t - 4.8) / 2.8 * 10 : 4); });
  return { tl, steps: [0, 0.3, 0.55, 0.78] };
}

/* ------------------------------------------------------------------ Loss landscape */
function landscape(stage) {
  const note = $('[data-ls-note]', stage);
  const tl = gsap.timeline({ paused: true });
  tl.from($('.ls__legend', stage), { opacity: 0, x: 20, duration: 0.5 }, 0.3);
  pad10(tl);
  onTime(tl, (t) => {
    lsTarget = Math.max(0, Math.min(1, (t - 0.8) / 8.4));
    if (land) land.setProgress(lsTarget);
    const txt = t < 1 ? 'Same start. Different optimisers.' : t < 9 ? 'Each step follows the local gradient of the loss…' : 'SGD and Adam settle in the nearest valley; momentum’s inertia carries it over the ridge into a deeper minimum.';
    if (note.textContent !== txt) note.textContent = txt;
  });
  return { tl, steps: [0, 0.1, 0.45, 0.9] };
}

/* ------------------------------------------------------------------ Conv calculator */
function setupConv() {
  const root = $('[data-cv]');
  if (!root) return;
  const grid = $('[data-cv-grid]', root), out = $('[data-cv-out]', root), res = $('[data-cv-res]', root);
  const v = { W: 12, K: 3, P: 1, S: 1 };
  let cells = [], side = 0, outN = 0, pos = 0, timer = null;
  function build() {
    side = v.W + 2 * v.P;
    outN = Math.floor((v.W - v.K + 2 * v.P) / v.S) + 1;
    grid.style.gridTemplateColumns = `repeat(${side}, 1fr)`;
    grid.innerHTML = Array.from({ length: side * side }, (_, i) => { const r = Math.floor(i / side), c = i % side; const pad = r < v.P || c < v.P || r >= side - v.P || c >= side - v.P; return `<i class="${pad ? 'is-pad' : ''}"></i>`; }).join('');
    cells = Array.from(grid.children);
    res.textContent = outN > 0 ? outN : 0;
    out.textContent = outN > 0 ? `output: ${outN} × ${outN} · ${outN * outN} positions` : 'kernel larger than input';
    pos = 0; paint();
  }
  function paint() {
    cells.forEach((c) => c.classList.remove('is-k'));
    if (outN <= 0) return;
    const r0 = Math.floor(pos / outN) * v.S, c0 = (pos % outN) * v.S;
    for (let i = 0; i < v.K; i++) for (let j = 0; j < v.K; j++) { const cell = cells[(r0 + i) * side + (c0 + j)]; if (cell) cell.classList.add('is-k'); }
  }
  $$('[data-cv]', root).forEach((inp) => inp.addEventListener('input', () => {
    v[inp.dataset.cv] = +inp.value; $(`[data-cv-v="${inp.dataset.cv}"]`, root).textContent = inp.value; setRange(inp, +inp.value); build();
  }));
  $$('[data-cv]', root).forEach((inp) => setRange(inp, +inp.value));
  build();
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(() => { if (outN > 0) { pos = (pos + 1) % (outN * outN); paint(); } }, 260);
    }).observe(root);
  }
}
function conv(stage) {
  const nets = $$('[data-cv-nets] li', stage);
  const tl = gsap.timeline({ paused: true });
  tl.from($('[data-cv-grid]', stage), { opacity: 0, scale: 0.94, duration: 0.6 }, 0.2);
  tl.from(nets, { opacity: 0, y: 12, stagger: 0.1, duration: 0.35 }, 1.2);
  pad10(tl);
  onTime(tl, (t) => { const k = t < 3 ? -1 : Math.min(nets.length - 1, Math.floor((t - 3) / 0.8)); nets.forEach((n, i) => n.classList.toggle('is-on', i <= k)); });
  return { tl, steps: [0, 0.3, 0.55, 0.86] };
}

/* ------------------------------------------------------------------ Attention */
function weights(head, i, n) {
  const row = new Array(n).fill(0.02);
  if (head === 'coref') {
    const special = { 7: { 5: 0.62, 1: 0.18, 7: 0.08, 9: 0.05 }, 9: { 5: 0.42, 7: 0.28, 8: 0.14 }, 2: { 1: 0.5, 5: 0.28, 2: 0.12 }, 5: { 2: 0.36, 4: 0.3, 5: 0.2 } };
    if (special[i]) Object.entries(special[i]).forEach(([j, w]) => (row[j] = w)); else { row[i] = 0.5; if (i > 0) row[i - 1] = 0.25; }
  } else if (head === 'syntax') { if (i > 0) row[i - 1] = 0.6; row[i] = 0.2; if (i < n - 1) row[i + 1] = 0.12; }
  else for (let j = 0; j < n; j++) row[j] = Math.exp(-((i - j) ** 2) / 2.2);
  const s = row.reduce((a, b) => a + b, 0); return row.map((w) => w / s);
}
function setupAttention() {
  const root = $('[data-at]');
  if (!root) return null;
  const toks = $$('[data-tok]', root), svg = $('[data-at-arcs]', root);
  let head = 'coref', focus = 7;
  function draw() {
    const box = svg.getBoundingClientRect(); if (!box.width) return;
    const tb = toks.map((t) => { const r = t.getBoundingClientRect(); return ((r.left + r.width / 2 - box.left) / box.width) * 1000; });
    const w = weights(head, focus, toks.length);
    svg.innerHTML = w.map((wt, j) => { if (j === focus || wt < 0.03) return ''; const x1 = tb[focus], x2 = tb[j], h = Math.min(150, 30 + Math.abs(x2 - x1) * 0.28); return `<path d="M${x1.toFixed(0)} 168 Q ${((x1 + x2) / 2).toFixed(0)} ${(168 - h).toFixed(0)} ${x2.toFixed(0)} 168" stroke-width="${(1 + wt * 14).toFixed(1)}" stroke-opacity="${(0.25 + wt * 0.75).toFixed(2)}"/>`; }).join('');
    toks.forEach((t, j) => { t.classList.toggle('is-q', j === focus); t.classList.toggle('is-k', j !== focus); t.style.setProperty('--w', w[j].toFixed(2)); });
  }
  toks.forEach((t, j) => { const go = () => { focus = j; draw(); }; t.addEventListener('mouseenter', go); t.addEventListener('focus', go); t.addEventListener('click', go); });
  $$('[data-head]', root).forEach((b) => b.addEventListener('click', () => { head = b.dataset.head; $$('[data-head]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); }));
  window.addEventListener('resize', draw);
  ScrollTrigger.addEventListener('refresh', draw);
  requestAnimationFrame(draw);
  return { draw };
}
function attention(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($$('[data-tok]', stage), { opacity: 0, y: 14, stagger: 0.1, duration: 0.35 }, 0.2);
  tl.from($('[data-at-arcs]', stage), { opacity: 0, duration: 0.6 }, 1.8);
  tl.from($$('.at__formula b', stage), { color: '#aab4c5', stagger: 0.25, duration: 0.3 }, 3.2);
  tl.from($$('.at__mgrid i', stage), { opacity: 0, stagger: 0.04, duration: 0.15 }, 7.0);
  pad10(tl);
  return { tl, steps: [0, 0.18, 0.4, 0.7] };
}

/* ------------------------------------------------------------------ Decoding playground */
const CANDS = [[' collaborative', 2.4], [' here', 2.1], [' open', 1.7], [' agentic', 1.5], [' uncertain', 0.9], [' human', 0.7], [' everywhere', 0.4], [' bright', 0.2]];
function setupDecoding() {
  const root = $('[data-dec]');
  if (!root) return null;
  const bars = $('[data-dec-bars]', root), gen = $('[data-dec-gen]', root), H = $('[data-dec-h]', root);
  bars.innerHTML = CANDS.map(([t]) => `<div class="dec__row"><span>"${t.trim()}"</span><i><i></i></i><b>—</b></div>`).join('');
  const rows = $$('.dec__row', bars);
  const s = { T: 0.7, K: 8, P: 1, manual: false };
  function dist() {
    const ex = CANDS.map(([, l]) => Math.exp(l / s.T)), Z = ex.reduce((a, b) => a + b, 0);
    let p = ex.map((e) => e / Z);
    const order = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    const keep = new Set(); let cum = 0;
    order.forEach(([v, i], rank) => { if (rank < s.K && (cum < s.P || keep.size === 0)) { keep.add(i); cum += v; } });
    const Zk = p.reduce((a, v, i) => a + (keep.has(i) ? v : 0), 0);
    return p.map((v, i) => (keep.has(i) ? v / Zk : 0));
  }
  function render() {
    const p = dist(), mx = Math.max(...p);
    rows.forEach((r, i) => { r.classList.toggle('is-cut', p[i] === 0); $('i > i', r).style.width = `${(p[i] / mx) * 100}%`; $('b', r).textContent = `${(p[i] * 100).toFixed(1)}%`; });
    H.textContent = (-p.reduce((a, v) => a + (v > 0 ? v * Math.log2(v) : 0), 0)).toFixed(2);
    ['T', 'K', 'P'].forEach((k) => { const inp = $(`[data-dec="${k}"]`, root); setRange(inp, s[k]); $(`[data-dec-v="${k}"]`, root).textContent = k === 'K' ? s[k] : (+s[k]).toFixed(2); });
    return p;
  }
  $$('[data-dec]', root).forEach((inp) => inp.addEventListener('input', () => { s.manual = true; s[inp.dataset.dec] = +inp.value; render(); }));
  const pick = (greedy) => {
    s.manual = true; const p = render();
    let i = 0;
    if (greedy) i = p.indexOf(Math.max(...p)); else { let r = Math.random(), c = 0; for (i = 0; i < p.length; i++) { c += p[i]; if (r <= c) break; } i = Math.min(i, p.length - 1); }
    rows.forEach((r, j) => r.classList.toggle('is-pick', j === i));
    gen.textContent = CANDS[i][0];
  };
  $('[data-dec-sample]', root).addEventListener('click', () => pick(false));
  $('[data-dec-greedy]', root).addEventListener('click', () => pick(true));
  $('[data-dec-reset]', root).addEventListener('click', () => { gen.textContent = ''; rows.forEach((r) => r.classList.remove('is-pick')); });
  render();
  return { scrub: (T, P, text) => { if (s.manual) return; s.T = T; s.P = P; render(); if (gen.textContent !== text) gen.textContent = text; } };
}
let decApi = null;
function decoding(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($$('.dec__row', stage), { opacity: 0, x: -12, stagger: 0.08, duration: 0.3 }, 0.2);
  pad10(tl);
  onTime(tl, (t) => {
    if (!decApi) return;
    const T = t < 1.5 ? 0.3 : t < 6 ? 0.3 + (t - 1.5) / 4.5 * 1.5 : 1.8 - Math.min(1, (t - 6) / 1.5) * 1.1;
    const P = t < 6.5 ? 1 : Math.max(0.6, 1 - (t - 6.5) / 1.2 * 0.4);
    decApi.scrub(+T.toFixed(2), +P.toFixed(2), t > 8.6 ? ' collaborative' : '');
  });
  return { tl, steps: [0, 0.15, 0.62, 0.84] };
}

/* ------------------------------------------------------------------ RAG + agents */
function rag(stage) {
  const seq = [...$$('[data-rg^="1-"]', stage), ...$$('[data-rg^="2-"]', stage), ...$$('[data-ag]', stage)];
  const tl = gsap.timeline({ paused: true });
  tl.from($$('.rg__n, .rg__ag', stage), { opacity: 0, y: 10, stagger: 0.05, duration: 0.3 }, 0);
  pad10(tl);
  onTime(tl, (t) => { const k = t < 1.2 ? -1 : Math.floor((t - 1.2) / (8.4 / seq.length)); seq.forEach((n, i) => n.classList.toggle('is-on', i === k || (i <= k && i >= k - 1))); });
  return { tl, steps: [0, 0.3, 0.5, 0.75] };
}

/* ------------------------------------------------------------------ LoRA */
function setupLora() {
  const root = $('[data-lo]');
  if (!root) return null;
  const inp = $('[data-lo-r]', root), d = 4096;
  const st = { r: 8, prec: 16, manual: false };
  function render() {
    const px = Math.max(4, Math.min(64, st.r * 1.6));
    $('[data-lo-b]', root).style.setProperty('--r', `${px}px`); $('[data-lo-a]', root).style.setProperty('--r', `${px}px`);
    $('[data-lo-rv]', root).textContent = st.r; setRange(inp, st.r);
    $('[data-lo-train]', root).textContent = (2 * d * st.r).toLocaleString('en-US');
    $('[data-lo-pct]', root).textContent = `${((2 * d * st.r) / (d * d) * 100).toFixed(2)}%`;
    $('[data-lo-mem]', root).textContent = `${(7 * (st.prec / 8)).toFixed(1)} GB`;
    $$('[data-prec]', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.prec === st.prec)));
  }
  inp.addEventListener('input', () => { st.manual = true; st.r = +inp.value; render(); });
  $$('[data-prec]', root).forEach((b) => b.addEventListener('click', () => { st.manual = true; st.prec = +b.dataset.prec; render(); }));
  render();
  return { scrub: (r, prec) => { if (st.manual) return; if (r !== st.r || prec !== st.prec) { st.r = r; st.prec = prec; render(); } } };
}
let loraApi = null;
function lora(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($('.lo__W', stage), { opacity: 0, scale: 0.9, duration: 0.5 }, 0.2);
  tl.from($$('.lo__plus, .lo__B, .lo__x, .lo__A', stage), { opacity: 0, stagger: 0.2, duration: 0.4 }, 2.4);
  tl.from($$('.lo__align span', stage), { opacity: 0, y: 10, stagger: 0.3, duration: 0.4 }, 8.0);
  pad10(tl);
  onTime(tl, (t) => { if (loraApi) loraApi.scrub(t < 3 ? 1 : t < 5.5 ? Math.round(1 + (t - 3) / 2.5 * 7) : t < 6.5 ? 8 : 8, t >= 6.2 ? 4 : 16); });
  return { tl, steps: [0, 0.24, 0.6, 0.8] };
}

/* ------------------------------------------------------------------ MLOps */
function ops(stage) {
  const sh = $('[data-ops-sh]', stage), steps = $$('[data-op]', stage);
  const tl = gsap.timeline({ paused: true });
  const end = T.typeLines(tl, sh, 0.2, 0.9);
  $$('.bo__c', stage).forEach((c, i) => tl.to(c, { strokeDashoffset: 0, duration: 0.8 }, end + 0.3 + i * 0.25));
  pad10(tl);
  const map = [[0.2, [0]], [1.0, [1]], [1.8, [2]], [2.6, [4]], [3.4, [4]], [4.2, [3, 5]]];
  onTime(tl, (t) => { let on = []; map.forEach(([at, idx]) => { if (t >= at) on = idx; }); steps.forEach((s, i) => s.classList.toggle('is-on', on.includes(i) || (t >= 5.2 && i <= 5))); });
  return { tl, steps: [0, 0.1, 0.26, 0.42] };
}

onReady(() => {
  initProgramPage();
  threeScenes();
  bvApi = setupBV();
  setupConv();
  setupAttention();
  decApi = setupDecoding();
  loraApi = setupLora();
  initChapters({ 'aiml-python': python, 'aiml-bv': bv, 'aiml-ls': landscape, 'aiml-cv': conv, 'aiml-at': attention, 'aiml-dec': decoding, 'aiml-rag': rag, 'aiml-lora': lora, 'aiml-ops': ops });
});
