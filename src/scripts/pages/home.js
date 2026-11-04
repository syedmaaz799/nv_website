/* Home page: 3D particle morph hero → four programs, horizontal journey. */
const { gsap, ScrollTrigger, $, $$, reduced, onReady } = window.NV;

onReady(() => {
  /* ---- Hero intro ---- */
  const heroIn = $$('[data-hero-in]');
  if (reduced) gsap.set(heroIn, { opacity: 1, y: 0 });
  else gsap.to(heroIn, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.55 });

  /* ---- Particle morph (WebGL bundle is lazy-loaded) ---- */
  const holder = $('[data-hero-canvas]');
  let morph = null;
  let heroP = 0, pathsP = -1, pastPaths = false;
  const desktop = () => window.innerWidth >= 1024;
  const layouts = () => (desktop()
    ? [{ x: 2.35, y: 0.05, s: 1.08 }, { x: 2.55, y: -0.05, s: 0.98 }, { x: 2.55, y: 0, s: 1 }, { x: 2.6, y: 0, s: 1.05 }, { x: 2.55, y: 0, s: 1 }]
    : [{ x: 0, y: 1.55, s: 0.78 }, { x: 0, y: 1.2, s: 0.7 }, { x: 0, y: 1.2, s: 0.7 }, { x: 0, y: 1.2, s: 0.7 }, { x: 0, y: 1.2, s: 0.7 }]);
  // Map paths progress (0..1) to shape offset (0..3): hold each shape, morph in the last 30% of its segment.
  const held = (p) => { const s = Math.min(p * 4, 3.999), i = Math.floor(s), f = s - i; if (i >= 3) return 3; const t = Math.max(0, Math.min(1, (f - 0.7) / 0.3)); return i + t * t * (3 - 2 * t); };
  const sync = () => {
    if (!morph) return;
    if (pastPaths) { morph.setOpacity(0); return; }
    if (desktop()) { morph.setOpacity(1); morph.setProgress(pathsP >= 0 ? 1 + held(pathsP) : heroP); }
    else morph.setOpacity(0.55 * (1 - heroP));
  };
  if (holder && !reduced) {
    window.NV.load3D().then((NV3D) => {
      if (!NV3D.webglAvailable()) return;
      const { SHAPES, PAL } = NV3D;
      morph = new NV3D.ParticleMorph(holder, {
        shapes: [(n) => SHAPES.sphere(n, PAL.brand), (n) => SHAPES.bars(n, PAL.da), (n) => SHAPES.clusters(n, PAL.ds), (n) => SHAPES.network(n, PAL.aiml), (n) => SHAPES.orbits(n, PAL.aaa)],
        layouts: layouts(),
      });
      holder.classList.add('has-gl');
      window.addEventListener('resize', () => { morph.layouts = layouts(); sync(); });
      sync();
    }).catch(() => {});
  }
  ScrollTrigger.create({
    trigger: '[data-hero]', start: 'top top', end: 'bottom top',
    onUpdate: (st) => { heroP = st.progress; sync(); },
  });

  /* ---- Program panels (sticky, desktop) ---- */
  const paths = $$('.path');
  const ticks = $$('.paths__progress li');
  let active = 0;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    paths.forEach((p, j) => p.classList.toggle('is-active', j === i));
    ticks.forEach((t, j) => t.classList.toggle('is-active', j === i));
  };
  ScrollTrigger.create({
    trigger: '[data-paths]', start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => {
      pathsP = st.progress;
      if (desktop()) setActive(Math.min(paths.length - 1, Math.floor(st.progress * paths.length + 0.15)));
      sync();
    },
    onLeaveBack: () => { pathsP = -1; sync(); },
  });
  // Fade the canvas out once past the programs section
  const whyST = ScrollTrigger.create({ trigger: '.why', start: 'top 85%' });
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (st) => { const p = st.scroll() >= whyST.start; if (p !== pastPaths) { pastPaths = p; sync(); } },
  });
  ScrollTrigger.addEventListener('refresh', () => { pastPaths = (window.NV.lenis ? window.NV.lenis.scroll : window.scrollY) >= whyST.start; sync(); });
  // Clicking a tick jumps to that program
  ticks.forEach((t, i) => t.addEventListener('click', () => {
    const sc = $('[data-paths]');
    const y = sc.offsetTop + (sc.offsetHeight - innerHeight) * ((i + 0.5) / paths.length);
    window.NV.scrollToTarget(y);
  }));

  /* ---- Journey: horizontal scroll on desktop ---- */
  const journey = $('[data-journey]');
  const track = $('[data-journey-track]');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const setH = () => { journey.style.height = `${dist() + window.innerHeight}px`; };
    setH();
    ScrollTrigger.addEventListener('refreshInit', setH);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: journey, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    });
    const path = $('.journey__line path');
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: `${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: journey, start: 'top top', end: 'bottom bottom', scrub: true } });
    return () => { ScrollTrigger.removeEventListener('refreshInit', setH); journey.style.height = ''; tween.kill(); };
  });
  ScrollTrigger.refresh();
});
