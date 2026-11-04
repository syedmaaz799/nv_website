/* NeuralVarsity core runtime: shared on every page. Exposes window.NV for page bundles. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = mqReduce.matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const ready = [];

/* ---------------- Smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const hdrH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hdr-h')) || 76;
function scrollToTarget(target, immediate = false) {
  if (lenis) lenis.scrollTo(target, { offset: -hdrH() - 12, duration: immediate ? 0 : 1.4, immediate });
  else {
    const el = typeof target === 'number' ? null : target;
    const y = el ? el.getBoundingClientRect().top + window.scrollY - hdrH() - 12 : target;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#contact-pending' || a.hasAttribute('data-pending')) return;
  if (a.hasAttribute('data-top') || id === '#main' && a.hasAttribute('data-top')) { e.preventDefault(); scrollToTarget(0); return; }
  if (id.length < 2) return;
  const t = document.getElementById(id.slice(1));
  if (!t) return;
  e.preventDefault();
  closeMenus();
  scrollToTarget(t);
  history.replaceState(null, '', id);
  // Move keyboard focus to the target (skip link, section links) without a second jump.
  if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute('tabindex', '-1');
  t.focus({ preventScroll: true });
});

/* ---------------- Toast ---------------- */
const toastEl = $('.toast');
let toastTimer;
function toast(msg, ms = 3600) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-pending]');
  if (!a) return;
  e.preventDefault();
  const kind = { whatsapp: 'WhatsApp', phone: 'Phone', email: 'Email' }[a.dataset.pending] || 'This';
  toast(`${kind} contact is being set up — please use the application form and our team will reach out.`);
});

/* ---------------- Header ---------------- */
const hdr = $('[data-hdr]');
let lastY = 0;
function onScroll(y) {
  if (!hdr) return;
  hdr.classList.toggle('is-scrolled', y > 24);
  const menuOpen = document.body.classList.contains('menu-open') || $('.mega.is-open');
  if (!menuOpen) hdr.classList.toggle('is-hidden', y > 320 && y > lastY + 2);
  if (y < lastY - 2) hdr.classList.remove('is-hidden');
  lastY = y;
}
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
onScroll(window.scrollY);

/* ---------------- Mega menu ---------------- */
const megaItem = $('[data-mega]');
const megaBtn = megaItem && $('button', megaItem);
const mega = megaItem && $('.mega', megaItem);
let megaTimer;
function setMega(open) {
  if (!mega) return;
  clearTimeout(megaTimer);
  mega.classList.toggle('is-open', open);
  megaBtn.setAttribute('aria-expanded', String(open));
  if (open) hdr.classList.remove('is-hidden');
}
if (megaItem) {
  megaBtn.addEventListener('click', () => setMega(!mega.classList.contains('is-open')));
  if (finePointer) {
    megaItem.addEventListener('mouseenter', () => { clearTimeout(megaTimer); megaTimer = setTimeout(() => setMega(true), 60); });
    megaItem.addEventListener('mouseleave', () => { clearTimeout(megaTimer); megaTimer = setTimeout(() => setMega(false), 180); });
  }
  megaItem.addEventListener('focusout', (e) => { if (!megaItem.contains(e.relatedTarget)) setMega(false); });
  document.addEventListener('click', (e) => { if (!megaItem.contains(e.target)) setMega(false); });
}

/* ---------------- Mobile menu ---------------- */
const burger = $('.burger');
const mnav = $('#mnav');
function setMobile(open) {
  if (!mnav) return;
  mnav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);
  if (open) { lenis && lenis.stop(); hdr.classList.remove('is-hidden'); hdr.classList.add('is-scrolled'); }
  else { lenis && lenis.start(); onScroll(window.scrollY); }
}
function closeMenus() { setMega(false); if (mnav && mnav.classList.contains('is-open')) setMobile(false); }
if (burger) burger.addEventListener('click', () => setMobile(!mnav.classList.contains('is-open')));
if (mnav) mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMobile(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (mega && mega.classList.contains('is-open')) megaBtn.focus(); closeMenus(); } });
window.addEventListener('resize', () => { if (window.innerWidth > 1080 && mnav && mnav.classList.contains('is-open')) setMobile(false); });

/* ---------------- Reveals ---------------- */
function initReveals(scope = document) {
  const els = $$('[data-reveal]:not(.is-in)', scope);
  if (reduced) { els.forEach((el) => el.classList.add('is-in')); return; }
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => batch.forEach((el, i) => { el.style.setProperty('--d', `${Math.min(i * 0.08, 0.5) + (parseFloat(el.dataset.delay) || 0)}s`); el.classList.add('is-in'); }),
  });
}

/* ---------------- Split headings ---------------- */
function initSplits(scope = document) {
  $$('[data-split]:not(.is-split)', scope).forEach((el) => {
    el.classList.add('is-split');
    if (reduced) return;
    const split = SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'split-line', wordsClass: 'split-word' });
    const immediate = el.hasAttribute('data-split-now');
    gsap.from(split.words, {
      yPercent: 110, opacity: 0, rotate: 4, duration: 1.15, ease: 'expo.out', stagger: 0.045, delay: parseFloat(el.dataset.delay) || 0,
      scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---------------- Count-ups ---------------- */
function initCounts(scope = document) {
  $$('[data-count]', scope).forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suffix; return; }
    const obj = { v: 0 };
    el.textContent = '0' + suffix;
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
    });
  });
}

/* ---------------- Pointer effects ---------------- */
function initMagnetic(scope = document) {
  if (!finePointer || reduced) return;
  $$('[data-magnetic]', scope).forEach((el) => {
    if (el.__mag) return; el.__mag = true;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.22);
      yTo((e.clientY - r.top - r.height / 2) * 0.32);
    });
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' }); });
  });
}
function initSpot(scope = document) {
  if (!finePointer) return;
  $$('.spot', scope).forEach((el) => {
    if (el.__spot) return; el.__spot = true;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
function initTilt(scope = document) {
  if (!finePointer || reduced) return;
  $$('[data-tilt]', scope).forEach((el) => {
    if (el.__tilt) return; el.__tilt = true;
    const max = parseFloat(el.dataset.tilt) || 7;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform 0.15s linear';
      el.style.transform = `perspective(1100px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = ''; el.style.transform = ''; });
  });
}

/* ---------------- Cursor ---------------- */
function initCursor() {
  const cur = $('.cursor');
  if (!cur || !finePointer || reduced) return;
  root.classList.add('has-cursor');
  const dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur), label = $('.cursor__label', cur);
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12 }), dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cur.classList.remove('is-hidden'); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    const hov = e.target.closest('a, button, [role="button"], input, select, textarea, label, summary, [data-hover]');
    if (lab) { label.textContent = lab.dataset.cursor; cur.classList.add('is-label'); cur.classList.remove('is-hover'); }
    else { cur.classList.remove('is-label'); cur.classList.toggle('is-hover', !!hov); }
  });
}

/* ---------------- Misc ---------------- */
function initBrochures() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-brochure]');
    if (a) toast('Your brochure download is starting…', 2600);
  });
}
function initYear() { $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear())); }

/** Refresh ScrollTrigger once layout settles (fonts/images). */
function settle() { ScrollTrigger.refresh(); }

/* ---------------- Lazy WebGL bundle ---------------- */
let p3d = null;
function load3D() {
  if (p3d) return p3d;
  const src = (window.NV_CONFIG || {}).scene3d;
  p3d = new Promise((resolve, reject) => {
    if (window.NV3D) return resolve(window.NV3D);
    if (!src) return reject(new Error('no 3d bundle'));
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => (window.NV3D ? resolve(window.NV3D) : reject(new Error('3d init failed')));
    s.onerror = () => reject(new Error('3d load failed'));
    document.head.appendChild(s);
  });
  return p3d;
}

let isReady = false;
function runReady(fn) { try { fn(); } catch (err) { console.error('[NV] init error', err); } }
function boot() {
  initReveals(); initCounts(); initMagnetic(); initSpot(); initTilt(); initCursor(); initBrochures(); initYear();
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(() => {
    initSplits();
    isReady = true;
    ready.splice(0).forEach(runReady);
    requestAnimationFrame(settle);
  });
  window.addEventListener('load', () => setTimeout(settle, 120));
}

window.NV = {
  gsap, ScrollTrigger, SplitText, lenis, reduced, finePointer, $, $$, toast, scrollToTarget,
  load3D,
  onReady: (fn) => (isReady ? requestAnimationFrame(() => runReady(fn)) : ready.push(fn)),
  refresh: (scope) => { initReveals(scope); initCounts(scope); initMagnetic(scope); initSpot(scope); initTilt(scope); initSplits(scope); },
  config: window.NV_CONFIG || {},
};

// Deferred page bundles run before DOMContentLoaded, so they can register NV.onReady() first.
if (document.readyState === 'complete') boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });
