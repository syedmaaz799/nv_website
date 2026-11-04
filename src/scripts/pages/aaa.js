/* AI Agents & Automation — scroll story scenes + interactive demos. */
import { initChapters, T } from '../shared/chapters.js';
import { initProgramPage } from '../shared/program.js';

const { gsap, ScrollTrigger, $, $$, reduced, onReady } = window.NV;
function onTime(tl, fn) { (tl.__fns || (tl.__fns = [])).push(fn); tl.eventCallback('onUpdate', () => tl.__fns.forEach((f) => f(tl.time()))); }
const pad10 = (tl, d = 10) => tl.to({}, { duration: 0.001 }, d - 0.001);
const setRange = (el, v) => { el.value = v; el.style.setProperty('--p', `${((v - el.min) / (el.max - el.min)) * 100}%`); };
const typeText = (el, full, k) => { const s = full.slice(0, Math.round(full.length * Math.max(0, Math.min(1, k)))); if (el.textContent !== s) el.textContent = s; };

/* ------------------------------------------------------------------ hero workflow */
function workflow() {
  const root = $('[data-wf]');
  if (!root) return;
  const canvas = $('[data-wf-canvas]', root), svg = $('[data-wf-links]', root);
  const nodes = Object.fromEntries($$('[data-wf-node]', root).map((n) => [n.dataset.wfNode, n]));
  const main = [['trigger', 'agent'], ['agent', 'reply'], ['agent', 'sheets']];
  const sub = [['agent', 'model'], ['agent', 'memory'], ['agent', 'rag']];
  const ns = 'http://www.w3.org/2000/svg';
  const paths = [...main, ...sub].map(([a, b], i) => { const p = document.createElementNS(ns, 'path'); if (i >= main.length) p.classList.add('is-sub'); svg.appendChild(p); return { a, b, p, sub: i >= main.length }; });
  const packets = main.flatMap((m, i) => [0, 0.5].map((off) => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('r', 4); svg.appendChild(c); return { link: i, off }; }));
  const circles = $$('circle', svg);
  const mq = window.matchMedia('(max-width: 560px)');
  let moved = false;
  const place = () => { if (moved) return; Object.values(nodes).forEach((n) => { const [x, y] = (mq.matches ? n.dataset.mpos : n.dataset.pos).split(',').map(Number); n.style.left = `${x}%`; n.style.top = `${y}%`; }); };
  place();
  mq.addEventListener('change', () => { moved = false; place(); layout(); });
  function layout() {
    const cb = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${cb.width} ${cb.height}`);
    paths.forEach((l) => {
      const hidden = !nodes[l.a].offsetParent || !nodes[l.b].offsetParent;
      l.p.style.display = hidden ? 'none' : '';
      if (hidden) return;
      const A = nodes[l.a].getBoundingClientRect(), B = nodes[l.b].getBoundingClientRect();
      let x1, y1, x2, y2, d;
      if (l.sub) { x1 = A.left + A.width / 2 - cb.left; y1 = A.bottom - cb.top; x2 = B.left + B.width / 2 - cb.left; y2 = B.top - cb.top; const my = (y1 + y2) / 2; d = `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`; }
      else { x1 = A.right - cb.left; y1 = A.top + A.height / 2 - cb.top; x2 = B.left - cb.left; y2 = B.top + B.height / 2 - cb.top; const dx = Math.max(40, Math.abs(x2 - x1) * 0.5); d = `M${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`; }
      l.p.setAttribute('d', d);
    });
  }
  // dragging
  Object.values(nodes).forEach((n) => {
    let sx, sy, ox, oy, drag = false;
    n.addEventListener('pointerdown', (e) => { drag = true; moved = true; n.setPointerCapture(e.pointerId); n.classList.add('is-drag'); sx = e.clientX; sy = e.clientY; ox = parseFloat(n.style.left); oy = parseFloat(n.style.top); });
    n.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cb = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(100 - (n.offsetWidth / cb.width) * 100, ox + ((e.clientX - sx) / cb.width) * 100));
      const y = Math.max(0, Math.min(100 - (n.offsetHeight / cb.height) * 100, oy + ((e.clientY - sy) / cb.height) * 100));
      n.style.left = `${x}%`; n.style.top = `${y}%`; layout();
    });
    const end = () => { drag = false; n.classList.remove('is-drag'); };
    n.addEventListener('pointerup', end); n.addEventListener('pointercancel', end);
    n.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
      if (!k) return; e.preventDefault();
      n.style.left = `${Math.max(0, Math.min(85, parseFloat(n.style.left) + k[0]))}%`; n.style.top = `${Math.max(0, Math.min(88, parseFloat(n.style.top) + k[1]))}%`; layout();
    });
  });
  layout();
  window.addEventListener('resize', layout);
  if (reduced) { circles.forEach((c) => c.setAttribute('r', 0)); return; }
  let visible = true, t0 = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(tick); }).observe(root);
  function tick(now) {
    if (!visible) return;
    const t = (now - t0) / 1000;
    packets.forEach((pk, i) => {
      const path = paths[pk.link].p;
      if (path.style.display === 'none') { circles[i].setAttribute('r', 0); return; }
      circles[i].setAttribute('r', 4);
      const len = path.getTotalLength();
      const u = ((t * 0.45 + pk.off + pk.link * 0.18) % 1);
      const pt = path.getPointAtLength(u * len);
      circles[i].setAttribute('cx', pt.x); circles[i].setAttribute('cy', pt.y);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ prompt studio */
function prompt(stage) {
  const blocks = $$('[data-ps-b]', stage), longs = $$('.ps__long', stage), shorts = $$('.ps__short', stage);
  const tok = $('[data-ps-tokens]', stage), fill = $('[data-ps-fill]', stage), save = $('[data-ps-save]', stage), models = $$('[data-ps-model]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  blocks.forEach((b, i) => tl.from(b, { opacity: 0, x: -24, duration: 0.45 }, 0.2 + i * 0.7));
  tl.to(longs, { opacity: 0, duration: 0.4, stagger: 0.15 }, 5.6).to(shorts, { opacity: 1, duration: 0.4, stagger: 0.15 }, 5.75);
  tl.to(save, { opacity: 1, duration: 0.4 }, 7.2);
  pad10(tl);
  onTime(tl, (t) => {
    const built = Math.min(1, Math.max(0, (t - 0.2) / 4.4));
    const opt = Math.min(1, Math.max(0, (t - 5.6) / 1.4));
    const v = Math.round(412 * built - (412 - 168) * opt);
    tok.textContent = v;
    fill.style.strokeDasharray = `${(v / 500) * 100} 100`;
    fill.style.stroke = opt > 0.5 ? '#3ee08f' : '#f5b544';
    models.forEach((m, i) => m.classList.toggle('is-ok', t >= 7.8 + i * 0.4));
  });
  return { tl, steps: [0, 0.4, 0.56, 0.78] };
}

/* ------------------------------------------------------------------ MCP */
function mcp(stage) {
  const req = $('[data-mcp-req]', stage), res = $('[data-mcp-res]', stage), json = $('[data-mcp-json]', stage), srv = $$('[data-mcp-srv]', stage);
  const steps = $$('[data-loop-s]', stage), arc = $('[data-loop-arc]', stage), au = $$('[data-au]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($('[data-mcp-host]', stage), { opacity: 0, x: -20, duration: 0.5 }, 0);
  tl.from(srv, { opacity: 0, x: 20, stagger: 0.15, duration: 0.4 }, 0.4);
  tl.fromTo(req, { left: '0%' }, { left: '96%', duration: 1.2, ease: 'power1.inOut' }, 1.6);
  tl.to(req, { opacity: 0, duration: 0.2 }, 2.8).to(res, { opacity: 1, duration: 0.2 }, 3.0).fromTo(res, { right: '0%' }, { right: '96%', duration: 1.2, ease: 'power1.inOut' }, 3.0);
  pad10(tl);
  onTime(tl, (t) => {
    srv.forEach((s, i) => s.classList.toggle('is-on', i === 1 && t >= 2.6 && t < 4.4));
    const txt = t < 3 ? '{"method":"tools/call","params":{"name":"search_code"}}' : '{"result":{"content":[{"type":"text","text":"3 matches"}]}}';
    if (json.textContent !== txt) json.textContent = txt;
    const k = t < 4.6 ? -1 : Math.floor((t - 4.6) / 0.6) % 5;
    steps.forEach((s, i) => s.classList.toggle('is-on', i === k));
    arc.style.strokeDashoffset = k < 0 ? 0 : `${-k * 20}`;
    const a = t < 7.4 ? -1 : Math.min(2, Math.floor((t - 7.4) / 0.8));
    au.forEach((x, i) => x.classList.toggle('is-on', i === a));
  });
  return { tl, steps: [0, 0.16, 0.46, 0.74] };
}

/* ------------------------------------------------------------------ RAG chunking lab + platforms */
const CH_COL = [['rgba(245,181,68,0.18)', 'rgba(245,181,68,0.5)'], ['rgba(124,199,255,0.16)', 'rgba(124,199,255,0.5)'], ['rgba(255,122,89,0.16)', 'rgba(255,122,89,0.5)'], ['rgba(166,133,255,0.18)', 'rgba(166,133,255,0.5)']];
function setupRAG() {
  const root = $('[data-rgl]');
  if (!root) return null;
  const textEl = $('[data-rgl-text]', root), full = textEl.textContent;
  const size = $('[data-rgl-size]', root), ov = $('[data-rgl-overlap]', root), nEl = $('[data-rgl-n]', root);
  const descs = JSON.parse($('[data-plat-json]', root).textContent), desc = $('[data-plat-desc]', root);
  const st = { size: 140, ov: 30, manual: false, top: false, plat: 'dify', platManual: false };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function render() {
    const S = st.size, O = Math.min(st.ov, S - 10), step = S - O;
    const chunks = []; for (let s = 0; s < full.length; s += step) { chunks.push([s, Math.min(full.length, s + S)]); if (s + S >= full.length) break; }
    const own = new Array(full.length).fill(-1), dbl = new Array(full.length).fill(false);
    chunks.forEach(([a, b], i) => { for (let k = a; k < b; k++) { if (own[k] === -1) own[k] = i; else dbl[k] = true; } });
    const tops = new Set(); if (st.top) chunks.forEach(([a, b], i) => { const t = full.slice(a, b); if (/add-ons|billing page/.test(t)) tops.add(i); });
    let html = '', k = 0;
    while (k < full.length) { let j = k; while (j < full.length && own[j] === own[k] && dbl[j] === dbl[k]) j++; const c = CH_COL[own[k] % 4]; html += `<mark class="${dbl[k] ? 'is-ov' : ''}${tops.has(own[k]) ? ' is-top' : ''}" style="--cb:${c[0]};--cbb:${c[1]}">${esc(full.slice(k, j))}</mark>`; k = j; }
    textEl.innerHTML = html;
    nEl.textContent = chunks.length;
    setRange(size, S); setRange(ov, st.ov);
    $('[data-rgl-sv]', root).textContent = `${S} chars`; $('[data-rgl-ov]', root).textContent = `${st.ov} chars`;
  }
  size.addEventListener('input', () => { st.manual = true; st.size = +size.value; render(); });
  ov.addEventListener('input', () => { st.manual = true; st.ov = +ov.value; render(); });
  const setPlat = (k, user) => { if (user) st.platManual = true; st.plat = k; $$('[data-p]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === k))); desc.textContent = descs[k]; };
  $$('[data-p]', root).forEach((b) => b.addEventListener('click', () => setPlat(b.dataset.p, true)));
  render();
  return {
    scrub: (S, O, top, platIdx) => {
      if (!st.platManual) { const k = Object.keys(descs)[platIdx]; if (k !== st.plat) setPlat(k); }
      if (!st.manual && (S !== st.size || O !== st.ov || top !== st.top)) { st.size = S; st.ov = O; st.top = top; render(); }
      else if (st.manual && top !== st.top) { st.top = top; render(); }
    },
  };
}
let ragApi = null;
function rag(stage) {
  const tl = gsap.timeline({ paused: true });
  tl.from($('.rgl__qa', stage), { opacity: 0, y: 16, duration: 0.5 }, 7.6);
  pad10(tl);
  onTime(tl, (t) => {
    if (!ragApi) return;
    const k = Math.max(0, Math.min(1, (t - 2.4) / 3.6));
    const S = Math.round((320 - k * 180) / 10) * 10, O = Math.round((k * 30) / 5) * 5;
    ragApi.scrub(S, O, t >= 7.0, Math.min(3, Math.floor(t / 0.6)));
  });
  return { tl, steps: [0, 0.24, 0.62, 0.76] };
}

/* ------------------------------------------------------------------ UGC content factory */
function setupUGC() {
  const root = $('[data-ugc]');
  if (!root) return null;
  const data = JSON.parse($('[data-fw-json]', root).textContent), list = $('[data-fw-lines]', root);
  let cur = 'PAS', manual = false;
  const set = (k, user) => { if (user) manual = true; if (k === cur) return; cur = k; $$('[data-fw-k]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fwK === k))); list.innerHTML = data[k].map((l) => `<li>${l.replace(/</g, '&lt;')}</li>`).join(''); gsap.from(list.children, { opacity: 0, x: -8, stagger: 0.08, duration: 0.3 }); };
  $$('[data-fw-k]', root).forEach((b) => b.addEventListener('click', () => set(b.dataset.fwK, true)));
  return { scrub: (k) => { if (!manual) set(k); } };
}
let ugcApi = null;
function ugc(stage) {
  const nodes = $$('[data-ugc-n]', stage), phones = $$('[data-ugc-ph]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($('[data-ugc-in]', stage), { opacity: 0, x: -20, duration: 0.5 }, 0);
  tl.from($$('.ugc__lines li', stage), { opacity: 0, x: -8, stagger: 0.12, duration: 0.3 }, 1.6);
  phones.forEach((ph, i) => {
    tl.from(ph, { opacity: 0, y: 24, duration: 0.45 }, 6 + i * 0.35);
    tl.from($('.ugc__img', ph), { scaleY: 0, duration: 0.5 }, 6.3 + i * 0.35);
    tl.from($$('.ugc__ln, .ugc__ai', ph), { opacity: 0, stagger: 0.1, duration: 0.25 }, 6.6 + i * 0.35);
  });
  pad10(tl);
  onTime(tl, (t) => {
    const k = t < 0.8 ? -1 : Math.floor((t - 0.8) / 0.8);
    nodes.forEach((n, i) => n.classList.toggle('is-on', i <= k));
    if (ugcApi) ugcApi.scrub(t < 3 ? 'PAS' : t < 4.4 ? 'AIDA' : 'BAB');
  });
  return { tl, steps: [0, 0.1, 0.32, 0.6] };
}

/* ------------------------------------------------------------------ prompt-to-app */
function app(stage) {
  const pr = $('[data-app-prompt]', stage), full = pr.textContent;
  const ui = $$('.app__nav, .app__hero, .app__card', stage), arrows = $$('[data-app-arr]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  tl.from($('[data-app-ai]', stage), { opacity: 0, y: 12, duration: 0.4 }, 2.2);
  tl.from(ui, { opacity: 0, y: 14, stagger: 0.5, duration: 0.5 }, 2.6);
  tl.to($('[data-app-dep]', stage), { opacity: 1, duration: 0.3 }, 4.4);
  const end = T.typeLines(tl, $('[data-app-req]', stage), 5.4, 0.35);
  T.typeLines(tl, $('[data-app-res]', stage), end + 1.0, 0.35);
  pad10(tl);
  onTime(tl, (t) => {
    typeText(pr, full, t / 2);
    arrows.forEach((a, i) => a.style.setProperty('--s', Math.max(0, Math.min(1, (t - 5.4 - i * 0.6) / 0.6)).toFixed(2)));
  });
  return { tl, steps: [0, 0.24, 0.52, 0.72] };
}

/* ------------------------------------------------------------------ OpenClaw */
function setupClaw() {
  const root = $('[data-claw]');
  if (!root) return null;
  const files = JSON.parse($('[data-files-json]', root).textContent), prev = $('[data-file-prev]', root);
  let cur = 0, manual = false;
  const set = (i, user) => { if (user) manual = true; if (i === cur) return; cur = i; $$('[data-file]', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.file === i))); prev.textContent = files[i][1]; };
  $$('[data-file]', root).forEach((b) => b.addEventListener('click', () => set(+b.dataset.file, true)));
  return { scrub: (i) => { if (!manual) set(i); } };
}
let clawApi = null;
function claw(stage) {
  const msgs = $$('[data-cm]', stage), jobs = $$('[data-job] i', stage);
  const a = $('[data-type-a]', stage), b = $('[data-type-b]', stage), A = a.textContent, B = b.textContent;
  const cursor = $('[data-cursor-ptr]', stage), submit = $('[data-submit]', stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  msgs.forEach((m, i) => tl.from(m, { opacity: 0, y: 12, duration: 0.4 }, 2.4 + i * 0.8));
  tl.fromTo(cursor, { left: '78%', top: '6%' }, { left: '52%', top: '14%', duration: 0.6 }, 6.4)
    .to(cursor, { left: '52%', top: '40%', duration: 0.5 }, 7.6)
    .to(cursor, { left: '14%', top: '72%', duration: 0.5 }, 8.8);
  pad10(tl);
  onTime(tl, (t) => {
    if (clawApi) clawApi.scrub(Math.min(6, Math.floor(t / 0.34)));
    jobs.forEach((j, i) => j.style.setProperty('--p', Math.max(0, Math.min(1, (t - 4.6 - i * 0.35) / 1.4)).toFixed(2)));
    typeText(a, A, (t - 7.0) / 0.6);
    typeText(b, B, (t - 8.1) / 0.6);
    submit.classList.toggle('is-press', t >= 9.3 && t < 9.6);
  });
  return { tl, steps: [0, 0.24, 0.46, 0.64] };
}

onReady(() => {
  initProgramPage();
  workflow();
  ragApi = setupRAG();
  ugcApi = setupUGC();
  clawApi = setupClaw();
  initChapters({ 'aaa-prompt': prompt, 'aaa-mcp': mcp, 'aaa-rag': rag, 'aaa-ugc': ugc, 'aaa-app': app, 'aaa-claw': claw });
});
