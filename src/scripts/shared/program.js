/* Shared program-page behaviour: hero intro, curriculum map, projects rail, curriculum explorer. */
import { initCurriculum } from './curriculum.js';

export function initProgramPage() {
  const { gsap, ScrollTrigger, $, $$, reduced } = window.NV;
  const heroIn = $$('[data-hero-in]');
  if (reduced) gsap.set(heroIn, { opacity: 1, y: 0 });
  else gsap.to(heroIn, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.45 });

  // Curriculum map: clicking a segment opens that unit in the explorer
  $$('[data-map-unit]').forEach((seg) => seg.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.NV.selectUnit) window.NV.selectUnit(seg.dataset.mapUnit);
  }));
  const map = $('[data-map]');
  if (map && !reduced) {
    gsap.from($$('.cmap__seg', map), { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: map, start: 'top 85%', once: true } });
  }

  // Projects rail: horizontal scroll on desktop
  const rail = $('[data-rail]');
  const track = $('[data-rail-track]');
  if (rail && track) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const setH = () => { rail.style.height = `${dist() + window.innerHeight}px`; };
      setH();
      ScrollTrigger.addEventListener('refreshInit', setH);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: rail, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
      const bar = $('[data-rail-bar]');
      if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: rail, start: 'top top', end: 'bottom bottom', scrub: true } });
      return () => { ScrollTrigger.removeEventListener('refreshInit', setH); rail.style.height = ''; tw.kill(); };
    });
  }

  initCurriculum($('[data-curr]'));
  // Deep links like #curriculum or #ch-<id>
  if (location.hash && location.hash.length > 1) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(() => window.NV.scrollToTarget(t, true), 200);
  }
}
