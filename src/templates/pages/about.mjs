import { site } from '../../config/site.mjs';
import { PROGRAMS, STATS } from '../../data/programs.mjs';
import { esc, each, icon } from '../lib.mjs';
import { page, btn, waBtn } from '../layout.mjs';
import { ctaBand } from '../partials.mjs';

const PRINCIPLES = [
  { i: 'blocks', t: 'Build to learn', d: 'Every concept earns its place by being used — in a lab, a deliverable or a capstone. You learn AI by building with it.' },
  { i: 'sparkles', t: 'AI-native curricula', d: 'Generative AI is woven into every program, from AI-assisted analysis to Transformers, RAG and autonomous agents.' },
  { i: 'list-checks', t: 'Radical transparency', d: 'Every session of every program is published, searchable and downloadable — so you know exactly what you’ll learn before you apply.' },
  { i: 'shield-check', t: 'Responsible by default', d: 'Bias, hallucinations, guardrails, security and human oversight are taught alongside the technology, not as an afterthought.' },
  { i: 'rocket', t: 'Production, not just notebooks', d: 'Git, APIs, deployments, Docker and MLOps — so the work you build actually runs in the real world.' },
  { i: 'route', t: 'A path for every starting point', d: 'From spreadsheets to engineering-grade AI, and from six-week sprints to six-month deep dives.' },
];

export function render() {
  const b = './';
  const body = `
<section class="page-hero about-hero">
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:1000px;right:-360px;top:-420px;--g:141,230,196"></div>
  <div class="container about-hero__grid">
    <div>
      <p class="eyebrow">About NeuralVarsity</p>
      <h1 class="display-l" data-split data-split-now>An AI education platform built around <span class="brand-grad-text">doing the work.</span></h1>
    </div>
    <p class="lede about-hero__lede" data-reveal>NeuralVarsity designs industry-focused programs in data analytics, data science, applied machine learning and AI agents. Each one is sequenced day by day — concept, lab, project, proof — so learners leave with skills they can demonstrate, not just certificates they can frame.</p>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="stats">
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.programs}">${STATS.programs}</span></div><p class="stat__label">Programs</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.sessions}">${STATS.sessions}</span></div><p class="stat__label">Published sessions</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.projects}">${STATS.projects}</span></div><p class="stat__label">Projects &amp; capstones</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.tools}">${STATS.tools}</span></div><p class="stat__label">Tools &amp; frameworks</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="pr-title">
  <div class="container">
    <div class="section-head"><p class="eyebrow">What we believe</p><h2 class="h2" id="pr-title" data-split>Six principles behind every program.</h2></div>
    <div class="principles">${each(PRINCIPLES, (p, i) => `<article class="principle spot" data-reveal><span class="principle__n mono">0${i + 1}</span><span class="principle__ic">${icon(p.i)}</span><h3 class="h4">${p.t}</h3><p>${p.d}</p></article>`)}</div>
  </div>
</section>

<section class="section ladder" aria-labelledby="ladder-title" data-ladder>
  <div class="container">
    <div class="section-head"><p class="eyebrow">The NeuralVarsity ladder</p><h2 class="h2" id="ladder-title" data-split>Four programs. One connected path.</h2>
      <p class="lede" data-reveal>Start where you are. Each program stands on its own — and together they map the full journey from data to autonomous AI.</p></div>
    <ol class="ladder__list">
      ${each(PROGRAMS, (p) => `<li class="ladder__item" style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}" data-reveal>
        <span class="ladder__dot"></span>
        <a class="ladder__card spot" href="${p.url}">
          <span class="mono ladder__meta">${p.number} · ${esc(p.duration)} · ${p.sessions} sessions</span>
          <b class="ladder__name">${esc(p.name)}</b>
          <span class="ladder__focus">${esc(p.focus)}</span>
          <span class="ladder__go">${icon('arrow-right')}</span>
        </a>
      </li>`)}
    </ol>
  </div>
</section>

${ctaBand(b, { title: 'Come build with us.', text: 'Explore the programs, download a brochure, or ask an advisor anything.' })}
`;
  return page({
    title: 'About', pageKey: 'about', active: 'about', path: 'about.html', depth: 0, css: ['about'], js: [], body,
    description: 'About NeuralVarsity: an AI education platform with day-by-day, project-led programs in data analytics, data science, applied AI & ML and AI agents.',
    ogImage: 'assets/img/og/og-home.png',
  });
}
