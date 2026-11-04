import { site } from '../../config/site.mjs';
import { PROGRAMS, STATS } from '../../data/programs.mjs';
import { esc, each, icon } from '../lib.mjs';
import { page, btn, waBtn, programActions } from '../layout.mjs';
import { faqList, faqJsonLd, toolsMarquee, ctaBand, allToolNames } from '../partials.mjs';

const SKILLS = ['Advanced Excel', 'Power Query', 'SQL', 'Power BI & DAX', 'Python', 'Pandas', 'Statistics', 'Machine Learning', 'XGBoost', 'Deep Learning', 'Computer Vision', 'YOLO', 'NLP', 'Transformers', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'LangGraph', 'MCP', 'AI Agents', 'n8n', 'Dify', 'CrewAI', 'Fine-tuning', 'MLOps', 'FastAPI', 'Docker'];

const FAQS = [
  { q: 'Which program should I choose?', a: 'Choose Data Analyst with GenAI (3 months) for dashboards, reporting and business insight; Data Science with GenAI (6 months) for the complete lifecycle from statistics to deep learning and GenAI; Applied AI & Machine Learning (6 months) for engineering-grade AI, LLMs and MLOps; or AI Agents & Automation (6 weeks) to build agents, automations and AI apps with little or no code. The program finder on our Programs page can help.' },
  { q: 'Do I need a technical background?', a: 'Not for most tracks. Data Analyst starts from Excel fundamentals and teaches Python from scratch; Data Science and Applied AI & ML both begin with Python foundations before moving into advanced material; AI Agents & Automation is largely no-code and low-code.' },
  { q: 'How is Generative AI part of every program?', a: 'Each curriculum includes dedicated GenAI content: LLMs and prompt engineering for analytics, OpenAI/Gemini/LLaMA apps and LangChain RAG for data science, Transformers from scratch, advanced RAG, fine-tuning and agents for applied AI, and an entire program built around agents and automation.' },
  { q: 'Will I build real projects?', a: `Yes — ${STATS.projects} projects and capstones across the four programs, from executive Power BI reports and YOLO object detection to RAG assistants, multi-agent systems and production AI agents.` },
  { q: 'Can I see the full curriculum before I apply?', a: 'Absolutely. Every program page includes a searchable, day-by-day curriculum, and each one has a downloadable PDF brochure.' },
  { q: 'How do I apply?', a: 'Use the Apply page to choose your program and share a few details. An admissions advisor will then contact you to discuss fit, schedules and next steps.' },
];

const SHAPE_FOR = { da: 'Bars → dashboards', ds: 'Clusters → models', aiml: 'Layers → networks', aaa: 'Orbits → agents' };

export function render() {
  const b = './';
  const tools = allToolNames();
  const half = Math.ceil(tools.length / 2);
  const body = `
<div class="hero-canvas" data-hero-canvas aria-hidden="true"><div class="hero-canvas__fallback"></div></div>

<section class="hero" data-hero>
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:1100px;left:-420px;top:-420px;--g:63,213,224"></div>
  <div class="glow" aria-hidden="true" style="--s:900px;right:-360px;bottom:-460px;--g:245,181,68"></div>
  <div class="container hero__inner">
    <div class="hero__copy">
      <span class="pill-live hero__pill" data-hero-in><i></i>AI-native education · ${STATS.programs} programs</span>
      <h1 class="display-xl hero__title" data-split data-split-now data-delay="0.15">Learn AI by <span class="brand-grad-text">building it.</span></h1>
      <p class="lede hero__lede" data-hero-in>Industry-focused programs in data analytics, data science, applied machine learning and AI agents — with Generative AI woven into every curriculum and real projects in every module.</p>
      <div class="btn-row hero__ctas" data-hero-in>
        ${btn({ href: '#programs', label: 'Explore programs', size: 'lg', iconName: 'arrow-down' })}
        ${waBtn(b, site.whatsappGreeting, 'Talk to an advisor', 'lg')}
      </div>
    </div>
    <ul class="hero__programs" data-hero-in>
      ${each(PROGRAMS, (p) => `<li><a href="${p.url}" style="--c:${p.accent}" data-cursor="View"><span class="hero__pdot"></span><span class="hero__pname">${esc(p.short)}</span><span class="hero__pdur">${esc(p.durationShort)}</span></a></li>`)}
    </ul>
  </div>
  <div class="container hero__foot">
    <span class="scroll-cue"><i></i>Scroll to explore</span>
    <p class="hero__facts mono"><span>${STATS.sessions} guided sessions</span><span>${STATS.projects} portfolio projects</span><span>${STATS.tools} tools &amp; frameworks</span></p>
  </div>
</section>

<section class="ticker" aria-label="Skills you will learn">
  <div class="marquee" style="--dur:55s;--gap:0px">
    <ul class="marquee__track ticker__track">${each(SKILLS, (s) => `<li>${esc(s)}<span aria-hidden="true">✦</span></li>`)}${each(SKILLS, (s) => `<li aria-hidden="true">${esc(s)}<span>✦</span></li>`)}</ul>
  </div>
</section>

<section class="paths" id="programs" aria-labelledby="paths-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Programs</p>
      <h2 class="h2" id="paths-title" data-split>Four paths. One AI-native foundation.</h2>
      <p class="lede" data-reveal>Pick the outcome you want — insight, models, AI systems or autonomous agents. Every path is mapped session by session, and every one ends with work you can show.</p>
    </div>
  </div>
  <div class="paths__scroller" data-paths>
    <div class="paths__sticky">
      <div class="container paths__grid">
        <div class="paths__panels">
          ${each(PROGRAMS, (p, i) => `<article class="path${i === 0 ? ' is-active' : ''}" data-path="${i}" style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}">
            <div class="path__top"><span class="path__num mono">${p.number} <i>/ 0${PROGRAMS.length}</i></span><span class="path__shape mono">${SHAPE_FOR[p.key]}</span></div>
            <h3 class="path__name"><a href="${p.url}">${esc(p.name)}</a></h3>
            <p class="path__meta">${esc(p.duration)} · ${p.sessions} sessions · ${p.projects.length} projects · ${esc(p.level)}</p>
            <p class="path__blurb">${esc(p.summary)}</p>
            <ul class="chip-row path__units">${each(p.chips, (c) => `<li class="chip">${esc(c)}</li>`)}</ul>
            ${programActions(p, b)}
          </article>`)}
        </div>
        <ol class="paths__progress" aria-hidden="true">${each(PROGRAMS, (p, i) => `<li style="--c:${p.accent}" class="${i === 0 ? 'is-active' : ''}"><span>${p.number}</span></li>`)}</ol>
      </div>
    </div>
  </div>
</section>

<section class="section why" aria-labelledby="why-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Why NeuralVarsity</p>
      <h2 class="h2" id="why-title" data-split>Built for the way AI work actually happens.</h2>
      <p class="lede" data-reveal>Not a lecture series. A sequence of concepts, labs, projects and deliverables — designed to make you genuinely useful with data and AI.</p>
    </div>
    <div class="bento">
      <article class="bento__card spot bento--genai" data-reveal>
        <div class="bento__viz viz-chat" aria-hidden="true">
          <div class="viz-chat__msg viz-chat__msg--me">Summarise Q3 revenue drivers</div>
          <div class="viz-chat__msg viz-chat__msg--ai"><span class="viz-chat__typing"><i></i><i></i><i></i></span><span class="viz-chat__text">West grew 18% on premium SKUs; churn fell after the June pricing change.</span></div>
          <ul class="viz-chat__tags"><li>Prompting</li><li>RAG</li><li>Agents</li><li>MCP</li></ul>
        </div>
        <h3 class="h4">Generative AI in every program</h3>
        <p>GenAI isn’t a bolt-on. From AI-assisted analysis to Transformers, RAG and autonomous agents, it’s woven through all four curricula.</p>
      </article>
      <article class="bento__card spot bento--daily" data-reveal>
        <div class="bento__viz viz-grid" aria-hidden="true">${Array.from({ length: 84 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
        <h3 class="h4">Build-first, every day</h3>
        <p>Each session pairs a core concept with hands-on practice — labs, deliverables and assessments, not just slides.</p>
      </article>
      <article class="bento__card spot bento--map" data-reveal>
        <div class="bento__viz viz-days" aria-hidden="true"><span class="viz-days__num" data-count="${STATS.sessions}">${STATS.sessions}</span><span class="viz-days__label mono">sessions, mapped day by day</span></div>
        <h3 class="h4">A curriculum you can read in full</h3>
        <p>Every session is published. Search any program’s curriculum online, or download the brochure and see exactly what you’ll learn — and when.</p>
      </article>
      <article class="bento__card spot bento--projects" data-reveal>
        <div class="bento__viz viz-stack" aria-hidden="true">
          <span style="--r:-8deg;--y:18px">Executive Power BI report</span><span style="--r:-3deg;--y:9px">YOLO helmet detection</span><span style="--r:3deg;--y:0px">Production RAG assistant</span>
        </div>
        <h3 class="h4">${STATS.projects} portfolio-grade projects</h3>
        <p>Capstones that mirror real business problems — the kind of work you can walk an interviewer through, line by line.</p>
      </article>
      <article class="bento__card spot bento--prod" data-reveal>
        <div class="bento__viz viz-pipe" aria-hidden="true">
          <span>${icon('code-xml')}Notebook</span><i></i><span>${icon('git-branch')}Git</span><i></i><span>${icon('server')}FastAPI</span><i></i><span>${icon('blocks')}Docker</span><i></i><span>${icon('rocket')}Deploy</span>
        </div>
        <h3 class="h4">From notebook to production</h3>
        <p>Git and GitHub, Streamlit, FastAPI, Docker, MLflow and live deployments — so your work runs beyond your laptop.</p>
      </article>
      <article class="bento__card spot bento--safe" data-reveal>
        <div class="bento__viz viz-shield" aria-hidden="true">${icon('shield-check')}<ul><li>Guardrails</li><li>Human-in-the-loop</li><li>Bias &amp; hallucination checks</li></ul></div>
        <h3 class="h4">Responsible by design</h3>
        <p>Ethics, bias, hallucinations, guardrails, security and AI disclosure are taught alongside the technology — never as an afterthought.</p>
      </article>
    </div>
  </div>
</section>

<section class="section--tight numbers" aria-label="NeuralVarsity in numbers">
  <div class="container">
    <div class="stats">
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.programs}">${STATS.programs}</span></div><p class="stat__label">Career-focused programs</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.sessions}">${STATS.sessions}</span></div><p class="stat__label">Guided sessions, mapped day by day</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.projects}">${STATS.projects}</span></div><p class="stat__label">Projects &amp; capstones</p></div>
      <div class="stat" data-reveal><div class="stat__num"><span data-count="${STATS.tools}">${STATS.tools}</span></div><p class="stat__label">Tools &amp; frameworks</p></div>
    </div>
  </div>
</section>

<section class="journey" aria-labelledby="journey-title" data-journey>
  <div class="journey__pin">
    <div class="container journey__head">
      <p class="eyebrow">How you’ll learn</p>
      <h2 class="h2" id="journey-title" data-split>Concept. Lab. Project. Proof.</h2>
    </div>
    <div class="journey__track" data-journey-track>
      <svg class="journey__line" viewBox="0 0 2400 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120 C 300 20, 500 200, 800 110 S 1300 20, 1600 110 S 2100 200, 2400 90" /></svg>
      ${each([
        { n: '01', t: 'Learn the concept', d: 'Every session opens with one focused idea — from conditional aggregation to attention mechanisms — explained from first principles.', i: 'lightbulb' },
        { n: '02', t: 'Practise in a lab', d: 'Apply it immediately in Excel, notebooks, SQL editors, Power BI, TensorFlow or no-code agent builders.', i: 'terminal' },
        { n: '03', t: 'Build a project', d: 'Combine skills into capstones that mirror real business problems: dashboards, models, RAG assistants, agents.', i: 'blocks' },
        { n: '04', t: 'Show your proof', d: 'Publish to GitHub, present your capstones and walk into interviews with work that speaks for itself.', i: 'trophy' },
      ], (s) => `<article class="journey__step" data-reveal>
        <span class="journey__n">${s.n}</span>
        <div class="journey__card spot"><span class="journey__icon">${icon(s.i)}</span><h3 class="h3">${s.t}</h3><p>${s.d}</p></div>
      </article>`)}
    </div>
  </div>
</section>

<section class="section toolkit" aria-labelledby="tools-title">
  <div class="container">
    <div class="section-head section-head--center">
      <p class="eyebrow">The toolkit</p>
      <h2 class="h2" id="tools-title" data-split>${STATS.tools} tools you’ll actually use.</h2>
      <p class="lede" data-reveal>Industry-standard software, frameworks and models — learned by using them on real problems.</p>
    </div>
  </div>
  <div class="toolkit__rows">
    ${toolsMarquee(tools.slice(0, half), { dur: 90 })}
    ${toolsMarquee(tools.slice(half), { dur: 100, rev: true })}
  </div>
</section>

<section class="section finder-teaser" aria-labelledby="finder-title">
  <div class="container"><div class="finder-teaser__grid">
    <div>
      <p class="eyebrow">Not sure where to start?</p>
      <h2 class="h2" id="finder-title" data-split>Find your program in three questions.</h2>
    </div>
    <div class="finder-teaser__side" data-reveal>
      <p class="lede">Tell us where you’re starting from, what you want to build and how much time you have. We’ll recommend the right path — and explain why.</p>
      <div class="btn-row">
        ${btn({ href: 'programs/index.html#finder', label: 'Take the program finder', iconName: 'compass', iconPos: 'start' })}
        ${btn({ href: 'programs/index.html#compare', label: 'Compare programs', variant: 'ghost', iconName: 'scale', iconPos: 'start' })}
      </div>
    </div>
  </div></div>
</section>

<section class="section faq-sec" aria-labelledby="faq-title">
  <div class="container faq-sec__grid">
    <div class="faq-sec__head">
      <p class="eyebrow">FAQ</p>
      <h2 class="h2" id="faq-title" data-split>Questions, answered.</h2>
      <p class="lede" data-reveal>Can’t find what you’re looking for? Message an advisor on WhatsApp — we’re happy to help.</p>
      ${waBtn(b, site.whatsappGreeting, 'Message an advisor')}
    </div>
    ${faqList(FAQS)}
  </div>
</section>

${ctaBand(b)}
`;
  return page({
    title: '', pageKey: 'home', path: 'index.html', depth: 0, css: ['home'], js: ['home'], three: true, body,
    description: site.description,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: site.name, url: site.url, description: site.description,
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Programs', itemListElement: PROGRAMS.map((p) => ({ '@type': 'Course', name: p.name, description: p.summary, url: `${site.url}/${p.url}` })) } },
      faqJsonLd(FAQS),
    ],
  });
}
