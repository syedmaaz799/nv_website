/**
 * Scroll-driven story chapters.
 * Each <section data-chapter="name"> has a sticky stage. A builder registered for
 * that name returns { tl, steps } — a paused GSAP timeline and the progress marks
 * (0..1) where each narrative step in [data-step] becomes active.
 *   Desktop  → section is tall, stage is sticky, timeline is scrubbed by scroll.
 *   Mobile   → stage flows normally, timeline plays once when it enters view.
 *   Reduced  → final state shown immediately.
 */
export function initChapters(builders) {
  const { gsap, ScrollTrigger, $$ } = window.NV;
  const mm = gsap.matchMedia();
  $$('[data-chapter]').forEach((ch) => {
    const build = builders[ch.dataset.chapter];
    if (!build) return;
    const stage = ch.querySelector('.chapter__stage');
    const steps = $$('[data-step]', ch);
    mm.add({
      desk: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
      red: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { desk, red } = ctx.conditions;
      let res = {};
      try { res = build(stage, ch, ctx.conditions) || {}; } catch (err) { console.error('[NV] chapter', ch.dataset.chapter, err); return; }
      const tl = res.tl;
      const marks = res.steps || steps.map((_, i) => i / Math.max(1, steps.length));
      const setStep = (p) => {
        let k = 0;
        marks.forEach((m, i) => { if (p >= m - 0.0001) k = i; });
        steps.forEach((s, i) => { s.classList.toggle('is-on', i === k); s.classList.toggle('is-done', i < k); });
        if (res.onStep) res.onStep(k, p);
      };
      if (red || !tl) {
        if (tl) tl.progress(1);
        steps.forEach((s) => s.classList.add('is-on'));
        if (res.onStep) res.onStep(steps.length - 1, 1);
        return;
      }
      if (desk) {
        ch.classList.add('is-pinned');
        ScrollTrigger.create({
          trigger: ch, start: 'top top', end: 'bottom bottom', scrub: 0.7, animation: tl,
          onUpdate: (st) => setStep(st.progress),
        });
        setStep(0);
        return () => ch.classList.remove('is-pinned');
      }
      steps.forEach((s) => s.classList.add('is-on'));
      ScrollTrigger.create({ trigger: stage, start: 'top 78%', once: true, onEnter: () => tl.timeScale(res.mobileSpeed || 1.6).play() });
      return undefined;
    });
  });
}

/** Helpers for builders */
export const T = {
  /** Reveal lines of a .code block by clip-path, step-typed. */
  typeLines(tl, block, at = 0, perLine = 0.5) {
    const lines = block.querySelectorAll('.code__line');
    lines.forEach((ln, i) => {
      const len = parseInt(ln.style.getPropertyValue('--len'), 10) || 10;
      tl.fromTo(ln, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: perLine, ease: `steps(${Math.max(4, Math.min(len, 60))})` }, at + i * perLine * 0.9);
    });
    return at + lines.length * perLine * 0.9;
  },
  /** Count a number element from 0 to its data-to value. */
  count(tl, el, at, dur = 1, fmt = (v) => Math.round(v).toLocaleString()) {
    const o = { v: 0 };
    const to = parseFloat(el.dataset.to);
    tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { el.textContent = (el.dataset.pre || '') + fmt(o.v) + (el.dataset.suf || ''); } }, at);
  },
};
