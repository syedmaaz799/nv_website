/** Full, searchable curriculum explorer — renders every unit, week and day from the parsed curricula. */
import { esc, each, icon } from './lib.mjs';
import { btn } from './layout.mjs';

const points = (pts) => `<ul class="day__points">${each(pts, (pt) => `<li>${pt.label ? `<b>${pt.label}:</b> ` : ''}${pt.text}</li>`)}</ul>`;

function dayBody(d) {
  let h = '';
  if (d.body) h += `<p class="day__para">${d.body}</p>`;
  if (d.points && d.points.length) h += points(d.points);
  if (d.project && (d.project.title || d.project.text)) {
    h += `<div class="day__block day__block--project"><p class="day__block-t">${icon('blocks')}Hands-on: ${d.project.title || 'Project / task'}</p><p>${d.project.text}</p></div>`;
  }
  if (d.deliverables && d.deliverables.length) {
    h += `<div class="day__block"><p class="day__block-t">${icon('list-checks')}Deliverables</p><ul class="day__chips">${each(d.deliverables, (x) => `<li>${x}</li>`)}</ul></div>`;
  }
  if (d.assessment) h += `<div class="day__block"><p class="day__block-t">${icon('target')}Assessment</p><p>${d.assessment}</p></div>`;
  return h;
}

export function curriculumExplorer(p, b) {
  const c = p.curriculum;
  return `<section class="section curr" id="curriculum" aria-labelledby="curr-title" data-curr>
  <div class="container">
    <div class="section-head section-head--split">
      <div class="stack" style="--stack:18px">
        <p class="eyebrow">Full curriculum</p>
        <h2 class="h2" id="curr-title" data-split>Every session, day by day.</h2>
      </div>
      <div class="curr__tools" data-reveal>
        <label class="curr__search">${icon('search')}<span class="sr-only">Search the curriculum</span><input type="search" placeholder="Search ${p.dayCount} sessions — e.g. ${esc(searchHint(p))}" data-curr-search autocomplete="off"></label>
        <button type="button" class="btn btn--ghost btn--sm" data-curr-expand aria-pressed="false">${icon('chevrons-up-down')}<span class="btn__label"><span>Expand all</span></span></button>
        ${btn({ href: b + p.brochure, label: 'PDF brochure', variant: 'glass', size: 'sm', iconName: 'download', attrs: `download data-brochure="${p.key}"` })}
      </div>
    </div>
    <div class="curr__layout">
      <div class="curr__tabs" role="tablist" aria-label="${esc(p.name)} curriculum by ${esc(c.unitLabel.toLowerCase())}">
        ${each(c.units, (u, i) => `<button class="curr__tab" role="tab" id="tab-${u.id}" aria-controls="panel-${u.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${u.id}">
          <span class="curr__tab-l mono">${u.label}</span><span class="curr__tab-t">${u.title}</span><span class="curr__tab-m mono">${u.count} sessions</span>
        </button>`)}
      </div>
      <div class="curr__panels">
        ${each(c.units, (u, i) => `<div class="curr__panel" role="tabpanel" id="panel-${u.id}" aria-labelledby="tab-${u.id}" data-panel="${u.id}"${i === 0 ? '' : ' hidden'}>
          <header class="curr__head"><span class="mono curr__head-l">${u.label} · ${u.meta}</span><h3 class="h3">${u.title}</h3></header>
          ${each(u.groups, (g) => `<div class="curr__group" data-group>
            ${g.title ? `<p class="curr__group-t"><span class="mono">${g.title}</span>${g.subtitle ? ` ${g.subtitle}` : ''}</p>` : ''}
            ${each(g.days, (d) => `<details class="day" data-day>
              <summary class="day__sum"><span class="day__n mono">${d.label}</span><span class="day__t">${d.titles.join(' <i>+</i> ')}</span><span class="day__icon">${icon('plus')}</span></summary>
              <div class="day__body">${dayBody(d)}</div>
            </details>`)}
          </div>`)}
        </div>`)}
        <p class="curr__empty" data-curr-empty hidden>No sessions match your search. Try another keyword.</p>
      </div>
    </div>
  </div>
</section>`;
}

function searchHint(p) {
  return { da: 'DAX, SUMIFS, window functions', ds: 'YOLO, BERT, Streamlit', aiml: 'LoRA, FastAPI, attention', aaa: 'MCP, n8n, OpenClaw' }[p.key] || 'Python';
}
