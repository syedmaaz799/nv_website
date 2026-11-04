import { site } from '../../config/site.mjs';
import { PROGRAMS, STATS } from '../../data/programs.mjs';
import { esc, each, icon, plain } from '../lib.mjs';
import { page, btn, waBtn, programActions } from '../layout.mjs';
import { faqList, faqJsonLd, ctaBand } from '../partials.mjs';
import { programViz } from '../viz.mjs';

const FAQS = [
  { q: 'Can I switch programs after I apply?', a: 'Talk to an admissions advisor before you enrol — they will walk you through each curriculum and help you choose the best fit for your goals and timeline.' },
  { q: 'Which program is the most beginner-friendly?', a: 'Data Analyst with GenAI starts from Excel fundamentals and teaches Python from scratch. AI Agents & Automation is the fastest route to practical AI results with little or no code.' },
  { q: 'What is the difference between Data Science and Applied AI & ML?', a: 'Data Science with GenAI covers the full data-science lifecycle — statistics, ML, deep learning, NLP, GenAI, SQL and Power BI. Applied AI & Machine Learning is engineering-heavy: production Python, Transformers from scratch, advanced RAG, fine-tuning, agentic systems, DSA and MLOps.' },
  { q: 'Where can I see every topic?', a: 'Each program page has a searchable, day-by-day curriculum, and every brochure contains the full syllabus.' },
];

const QUIZ = [
  { q: 'Where are you starting from?', name: 'start', options: [
    { v: 'new', t: 'New to data and coding', s: { da: 2, aaa: 2, ds: 1 } },
    { v: 'sheets', t: 'I work with spreadsheets and reports', s: { da: 3, ds: 1 } },
    { v: 'tech', t: 'I can code or have a technical degree', s: { aiml: 3, ds: 2 } },
    { v: 'fast', t: 'I want results fast, with minimal code', s: { aaa: 3 } },
  ] },
  { q: 'What do you want to build?', name: 'goal', options: [
    { v: 'insight', t: 'Dashboards, reporting and business insight', s: { da: 4 } },
    { v: 'models', t: 'Predictive models and end-to-end data science', s: { ds: 4, aiml: 1 } },
    { v: 'systems', t: 'AI systems — deep learning, LLMs and MLOps', s: { aiml: 4, ds: 1 } },
    { v: 'agents', t: 'AI agents, automations and AI-powered apps', s: { aaa: 4 } },
  ] },
  { q: 'How much time can you commit?', name: 'time', options: [
    { v: 'w6', t: 'About 6 weeks', s: { aaa: 3 } },
    { v: 'm3', t: 'Around 3 months', s: { da: 3 } },
    { v: 'm6', t: 'Six months — I want depth', s: { ds: 2, aiml: 2 } },
  ] },
];

function programCard(p, b) {
  const tools = p.tools.length, units = p.curriculum.units.length;
  return `<article class="pcard spot" id="${p.slug}" data-tilt="4" style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb};--spot-rgb:${p.accentRgb}" data-reveal>
    <div class="pcard__viz">${programViz(p.key)}</div>
    <div class="pcard__body">
      <div class="pcard__top"><span class="mono pcard__num">PROGRAM ${p.number}</span><span class="pcard__badge">${esc(p.duration)}</span></div>
      <h2 class="pcard__name"><a href="${b}${p.url}">${esc(p.name)}</a></h2>
      <p class="pcard__tag">${esc(p.tagline)}</p>
      <p class="pcard__sum">${esc(p.summary)}</p>
      <dl class="pcard__stats">
        <div><dt>Sessions</dt><dd>${p.sessions}</dd></div>
        <div><dt>${esc(p.curriculum.unitLabel)}s</dt><dd>${units}</dd></div>
        <div><dt>Projects</dt><dd>${p.projects.length}</dd></div>
        <div><dt>Tools</dt><dd>${tools}</dd></div>
      </dl>
      <ul class="chip-row">${each(p.chips, (c) => `<li class="chip">${esc(c)}</li>`)}</ul>
      <p class="pcard__level">${icon('graduation-cap')}${esc(p.level)} · ${esc(p.startsFrom)}</p>
      ${programActions(p, b, { size: 'sm' })}
    </div>
  </article>`;
}

function compareTable(b) {
  const row = (label, fn) => `<tr><th scope="row">${label}</th>${each(PROGRAMS, (p) => `<td style="--accent:${p.accent}">${fn(p)}</td>`)}</tr>`;
  return `<div class="compare__wrap" data-lenis-prevent-touch>
  <table class="compare">
    <caption class="sr-only">Comparison of NeuralVarsity programs</caption>
    <thead><tr><td></td>${each(PROGRAMS, (p) => `<th scope="col" style="--accent:${p.accent}"><span class="compare__dot"></span><a href="${b}${p.url}">${esc(p.name)}</a></th>`)}</tr></thead>
    <tbody>
      ${row('Duration', (p) => `<strong>${esc(p.duration)}</strong>`)}
      ${row('Sessions', (p) => `${p.sessions} day-by-day sessions`)}
      ${row('Structure', (p) => `${p.curriculum.units.length} ${p.curriculum.unitLabel.toLowerCase()}s`)}
      ${row('Level', (p) => esc(p.level))}
      ${row('Starting point', (p) => esc(p.startsFrom))}
      ${row('Core focus', (p) => esc(p.focus))}
      ${row('Generative AI', (p) => esc(p.genai))}
      ${row('Signature projects', (p) => `<ul>${each(p.projects.slice(-3), (x) => `<li>${esc(x.title)}</li>`)}</ul>`)}
      ${row('Tools', (p) => `${p.tools.length} tools incl. ${esc(p.tools.slice(0, 4).join(', '))}`)}
      ${row('Best for', (p) => esc(p.idealFor[0]))}
      <tr class="compare__actions"><th scope="row">Next step</th>${each(PROGRAMS, (p) => `<td style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}">
        <div class="compare__cta">${btn({ href: b + p.applyUrl, label: 'Apply Now', size: 'sm', iconName: 'arrow-up-right' })}
        <a class="link-arrow" href="${b}${p.url}">Learn more ${icon('arrow-right')}</a></div>
      </td>`)}</tr>
    </tbody>
  </table>
</div>`;
}

function finder(b) {
  return `<div class="finder" data-finder>
    <div class="finder__progress"><span data-finder-bar></span></div>
    <form class="finder__form" data-finder-form>
      ${each(QUIZ, (q, i) => `<fieldset class="finder__step${i === 0 ? ' is-active' : ''}" data-step="${i}">
        <legend class="finder__q"><span class="mono">0${i + 1} / 0${QUIZ.length}</span>${esc(q.q)}</legend>
        <div class="finder__opts">${each(q.options, (o) => `<label class="finder__opt"><input type="radio" name="${q.name}" value="${o.v}" data-score='${JSON.stringify(o.s)}'><span>${esc(o.t)}</span>${icon('arrow-right')}</label>`)}</div>
        ${i > 0 ? `<button type="button" class="finder__back" data-finder-back>${icon('arrow-right')}Back</button>` : ''}
      </fieldset>`)}
      <div class="finder__result" data-finder-result hidden aria-live="polite">
        ${each(PROGRAMS, (p) => `<div class="finder__match" data-match="${p.key}" hidden style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}">
          <p class="eyebrow">Your best match</p>
          <h3 class="h2 grad-text">${esc(p.name)}</h3>
          <p class="lede">${esc(p.summary)}</p>
          <ul class="finder__why" data-why></ul>
          ${programActions(p, b, { size: '' })}
        </div>`)}
        <button type="button" class="finder__restart" data-finder-restart>${icon('repeat')}Start over</button>
      </div>
    </form>
  </div>`;
}

export function render() {
  const b = '../';
  const body = `
<section class="page-hero programs-hero">
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:900px;left:-300px;top:-380px;--g:63,213,224"></div>
  <div class="programs-hero__art" aria-hidden="true">
    ${each(PROGRAMS, (p, i) => `<div class="phx phx--${i}" style="--accent:${p.accent};--accent-rgb:${p.accentRgb}"><span class="mono">${p.number} · ${esc(p.durationShort)}</span>${programViz(p.key)}<b>${esc(p.short)}</b></div>`)}
  </div>
  <div class="container">
    <p class="eyebrow">Programs</p>
    <h1 class="display-l" data-split data-split-now>Choose your path into <span class="brand-grad-text">data &amp; AI.</span></h1>
    <p class="lede" data-reveal>Four programs, ${STATS.sessions} sessions, ${STATS.projects} projects. Each one is mapped day by day — explore, compare, download the brochure, or apply in minutes.</p>
    <nav class="subnav" aria-label="On this page" data-reveal>
      <a href="#all">${icon('layers')}All programs</a><a href="#compare">${icon('scale')}Compare</a><a href="#finder">${icon('compass')}Find your fit</a><a href="#brochures">${icon('download')}Brochures</a>
    </nav>
  </div>
</section>

<section class="section--tight" id="all" aria-label="All programs">
  <div class="container pgrid">
    ${each(PROGRAMS, (p) => programCard(p, b))}
  </div>
</section>

<section class="section" id="compare" aria-labelledby="compare-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div class="stack" style="--stack:18px"><p class="eyebrow">Compare</p><h2 class="h2" id="compare-title" data-split>Side by side.</h2></div>
      <p class="lede" data-reveal>Duration, depth, starting point and signature projects — everything you need to decide, in one view.</p>
    </div>
    ${compareTable(b)}
  </div>
</section>

<section class="section" id="finder" aria-labelledby="finder-title">
  <div class="container finder-sec">
    <div class="finder-sec__head">
      <p class="eyebrow">Program finder</p>
      <h2 class="h2" id="finder-title" data-split>Three questions. One clear recommendation.</h2>
      <p class="lede" data-reveal>No sign-up needed — your answers stay in your browser.</p>
    </div>
    ${finder(b)}
  </div>
</section>

<section class="section" id="brochures" aria-labelledby="brochures-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Brochures</p>
      <h2 class="h2" id="brochures-title" data-split>Every session, in print.</h2>
      <p class="lede" data-reveal>Each brochure contains the complete day-by-day curriculum, projects, tools and outcomes for its program.</p>
    </div>
    <div class="brochures">
      ${each(PROGRAMS, (p) => `<a class="brochure spot" href="${b}${p.brochure}" download data-brochure="${p.key}" style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb};--spot-rgb:${p.accentRgb}" data-reveal>
        <span class="brochure__doc" aria-hidden="true"><span class="brochure__band"></span><span class="mono">PDF</span><b>${esc(p.short)}</b><i></i><i></i><i></i></span>
        <span class="brochure__txt"><b>${esc(p.name)}</b><small>${esc(p.duration)} · ${p.sessions} sessions · full curriculum</small></span>
        <span class="brochure__dl">${icon('download')}</span>
      </a>`)}
    </div>
  </div>
</section>

<section class="section faq-sec" aria-labelledby="faq-title">
  <div class="container faq-sec__grid">
    <div class="faq-sec__head">
      <p class="eyebrow">FAQ</p>
      <h2 class="h2" id="faq-title" data-split>Choosing a program.</h2>
      <p class="lede" data-reveal>Still deciding? An advisor can help you compare in a five-minute chat.</p>
      ${waBtn(b, 'Hi NeuralVarsity! Can you help me choose the right program?', 'Ask an advisor')}
    </div>
    ${faqList(FAQS)}
  </div>
</section>

${ctaBand(b)}
`;
  return page({
    title: 'Programs', pageKey: 'programs', active: 'programs', path: 'programs/index.html', depth: 1, css: ['programs'], js: ['programs'], body,
    description: 'Compare NeuralVarsity programs: Data Analyst with GenAI (3 months), Data Science with GenAI (6 months), Applied AI & Machine Learning (6 months) and AI Agents & Automation (6 weeks). Download brochures and apply.',
    ogImage: 'assets/img/og/og-programs.png',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: PROGRAMS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site.url}/${p.url}`, name: p.name })) }, faqJsonLd(FAQS)],
  });
}
