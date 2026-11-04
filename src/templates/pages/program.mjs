import { site } from '../../config/site.mjs';
import { PROGRAMS } from '../../data/programs.mjs';
import { esc, each, icon, toolChip } from '../lib.mjs';
import { page, btn, waBtn, programActions } from '../layout.mjs';
import { faqList, faqJsonLd, ctaBand } from '../partials.mjs';
import { curriculumExplorer } from '../curriculum.mjs';
import { programViz } from '../viz.mjs';
import * as da from '../stories/da.mjs';
import * as ds from '../stories/ds.mjs';
import * as aiml from '../stories/aiml.mjs';
import * as aaa from '../stories/aaa.mjs';

const STORIES = { da, ds, aiml, aaa };
const IDEAL_ICONS = ['graduation-cap', 'briefcase', 'route', 'target'];

function nameHtml(p) {
  const n = esc(p.name);
  const cut = { da: 'with GenAI', ds: 'with GenAI', aiml: 'Machine Learning', aaa: '&amp; Automation' }[p.key];
  return cut && n.includes(cut) ? n.replace(cut, `<span class="grad-text">${cut}</span>`) : n;
}

export function render(p) {
  const b = '../';
  const story = STORIES[p.key];
  const others = PROGRAMS.filter((x) => x.key !== p.key);
  const waText = `Hi NeuralVarsity! I'm interested in the ${p.name} program. Could you share more details?`;
  const totalWeeks = p.weeks;
  const body = `
<section class="phero phero--${p.key}" data-phero>
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:1000px;left:-380px;top:-420px;--g:${p.accentRgb}"></div>
  <div class="container phero__grid">
    <div class="phero__copy">
      <nav class="crumbs" aria-label="Breadcrumb" data-hero-in><ol><li><a href="${b}index.html">Home</a></li><li><a href="index.html">Programs</a></li><li aria-current="page">${esc(p.short)}</li></ol></nav>
      <p class="eyebrow" data-hero-in>Program ${p.number} · ${esc(p.duration)}</p>
      <h1 class="display-l phero__title" data-split data-split-now data-delay="0.1">${nameHtml(p)}</h1>
      <p class="lede phero__lede" data-hero-in>${esc(p.headline)}</p>
      <ul class="phero__meta" data-hero-in>
        <li>${icon('calendar-days')}<b>${esc(p.duration)}</b><span>${totalWeeks} weeks</span></li>
        <li>${icon('book-open')}<b>${p.sessions}</b><span>sessions</span></li>
        <li>${icon('blocks')}<b>${p.projects.length}</b><span>projects</span></li>
        <li>${icon('wand-sparkles')}<b>${p.tools.length}</b><span>tools</span></li>
      </ul>
      <div class="btn-row" data-hero-in>
        ${btn({ href: b + p.applyUrl, label: 'Apply Now', size: 'lg', iconName: 'arrow-up-right' })}
        ${btn({ href: b + p.brochure, label: 'Download Brochure', variant: 'ghost', size: 'lg', iconName: 'download', attrs: `download data-brochure="${p.key}"` })}
      </div>
    </div>
    <div class="phero__art" data-hero-in>${story.heroArt(p, b)}</div>
  </div>
  <div class="container phero__foot"><span class="scroll-cue"><i></i>Scroll the story</span><span class="mono phero__level">${icon('graduation-cap')}${esc(p.level)}</span></div>
</section>

<section class="cmap-sec" aria-label="Program structure">
  <div class="container">
    <div class="cmap" data-map>
      <div class="cmap__head"><span class="mono">Your ${totalWeeks}-week journey · ${p.curriculum.units.length} ${esc(p.curriculum.unitLabel.toLowerCase())}s</span><a class="mono cmap__all" href="#curriculum">View full curriculum ↓</a></div>
      <div class="cmap__bar">
        ${each(p.curriculum.units, (u) => `<a class="cmap__seg" href="#curriculum" data-map-unit="${u.id}" style="flex:${u.count}" title="${esc(u.label)} — ${u.title.replace(/"/g, '&quot;')}"><span class="cmap__l mono">${u.label}</span><span class="cmap__t">${u.title}</span><span class="cmap__c mono">${u.count} sessions</span></a>`)}
      </div>
    </div>
  </div>
</section>

<section class="section overview" aria-labelledby="ov-title">
  <div class="container overview__grid">
    <div class="overview__main">
      <p class="eyebrow">Overview</p>
      <h2 class="h2" id="ov-title" data-split>${esc(p.tagline)}</h2>
      <p class="lede" data-reveal>${esc(p.summary)}</p>
      <p class="overview__start" data-reveal>${icon('info')}${esc(p.startsFrom)}</p>
    </div>
    <div class="overview__side">
      <p class="mono overview__label">Built for</p>
      <ul class="ideal">${each(p.idealFor, (t, i) => `<li class="ideal__item spot" data-reveal><span class="ideal__icon">${icon(IDEAL_ICONS[i % 4])}</span><span>${esc(t)}</span></li>`)}</ul>
    </div>
  </div>
</section>

<div class="story story--${p.key}">
${story.chapters(p, b)}
</div>

<section class="section" aria-labelledby="out-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Outcomes</p>
      <h2 class="h2" id="out-title" data-split>What you’ll be able to do.</h2>
    </div>
    <ol class="outcomes">${each(p.outcomes, (o) => `<li data-reveal>${esc(o)}</li>`)}</ol>
  </div>
</section>

<section class="rail" data-rail aria-labelledby="proj-title">
  <div class="rail__pin">
    <div class="container rail__head">
      <div class="stack" style="--stack:16px"><p class="eyebrow">Projects &amp; capstones</p><h2 class="h2" id="proj-title" data-split>${p.projects.length} things you’ll build.</h2></div>
      <div class="rail__progress" aria-hidden="true"><span data-rail-bar></span></div>
    </div>
    <div class="rail__viewport">
      <ol class="rail__track" data-rail-track>
        ${each(p.projects, (x, i) => `<li class="proj spot" data-reveal>
          <span class="proj__n mono">${String(i + 1).padStart(2, '0')}</span>
          <span class="proj__when mono">${esc(x.when)}</span>
          <h3 class="h3">${esc(x.title)}</h3>
          <p>${esc(x.text)}</p>
        </li>`)}
      </ol>
    </div>
  </div>
</section>

${curriculumExplorer(p, b)}

<section class="section" aria-labelledby="tools-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div class="stack" style="--stack:16px"><p class="eyebrow">Tools &amp; technologies</p><h2 class="h2" id="tools-title" data-split>${p.tools.length} tools, used for real.</h2></div>
      <p class="lede" data-reveal>Everything you’ll install, configure and ship with during the program.</p>
    </div>
    <ul class="tools tools--grid" data-reveal>${each(p.tools, (t) => toolChip(t))}</ul>
  </div>
</section>

<section class="section--tight careers" aria-labelledby="careers-title">
  <div class="container careers__grid">
    <div class="stack" style="--stack:16px"><p class="eyebrow">Careers</p><h2 class="h2" id="careers-title" data-split>Roles this program prepares you for.</h2></div>
    <ul class="roles">${each(p.roles, (r) => `<li class="role" data-reveal>${icon('briefcase')}<span>${esc(r)}</span></li>`)}</ul>
  </div>
</section>

<section class="section faq-sec" aria-labelledby="faq-title">
  <div class="container faq-sec__grid">
    <div class="faq-sec__head">
      <p class="eyebrow">FAQ</p>
      <h2 class="h2" id="faq-title" data-split>About ${esc(p.short)}.</h2>
      <p class="lede" data-reveal>Have a question that isn’t covered here? Ask an advisor directly.</p>
      ${waBtn(b, waText, 'Ask on WhatsApp')}
    </div>
    ${faqList(p.faqs)}
  </div>
</section>

${ctaBand(b, { program: p, title: `Ready to start ${p.name}?`, text: 'Apply in under three minutes, download the complete brochure, or talk to an advisor about schedules and fit.' })}

<section class="section--tight others" aria-labelledby="others-title">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Explore more</p><h2 class="h3" id="others-title">Other programs</h2></div>
    <div class="others__grid">
      ${each(others, (o) => `<a class="other spot" href="${o.slug}.html" style="--accent:${o.accent};--accent-2:${o.accent2};--accent-rgb:${o.accentRgb};--spot-rgb:${o.accentRgb}" data-reveal>
        <span class="other__viz">${programViz(o.key)}</span>
        <span class="mono other__meta">${o.number} · ${esc(o.duration)}</span>
        <b class="other__name">${esc(o.name)}</b>
        <span class="other__go">Explore ${icon('arrow-right')}</span>
      </a>`)}
    </div>
  </div>
</section>
`;
  return page({
    title: `${p.name} (${p.duration})`, pageKey: p.key, active: 'programs', path: p.url, depth: 1,
    css: ['program', p.key], js: [p.key], three: !!story.three, body, waText,
    accent: `--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}`,
    description: `${p.name} — ${p.duration}, ${p.sessions} sessions. ${p.summary}`,
    ogImage: `assets/img/og/og-${p.key}.png`,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Course', name: p.name, description: p.summary, url: `${site.url}/${p.url}`,
        provider: { '@type': 'EducationalOrganization', name: site.name, sameAs: site.url },
        timeRequired: `P${p.weeks}W`, educationalLevel: p.level, teaches: p.chips,
        hasCourseInstance: { '@type': 'CourseInstance', courseWorkload: `${p.sessions} sessions` },
        syllabusSections: p.curriculum.units.map((u) => ({ '@type': 'Syllabus', name: `${u.label}: ${u.title.replace(/&amp;/g, '&')}` })) },
      faqJsonLd(p.faqs),
    ],
  });
}
