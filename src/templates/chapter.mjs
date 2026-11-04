import { each, esc } from './lib.mjs';

/** A scroll-story chapter: narrative copy + sticky visual stage driven by a JS builder (data-chapter). */
export function chapter({ id, scene, len = 260, eyebrow, title, lede, steps = [], topics = [], stage, flip = false, cls = '' }) {
  return `<section class="chapter${flip ? ' chapter--flip' : ''}${cls ? ' ' + cls : ''}" id="ch-${id}" data-chapter="${scene}" style="--len:${len}" aria-labelledby="ch-${id}-t">
  <div class="chapter__sticky">
    <div class="container chapter__grid">
      <div class="chapter__copy">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="chapter__title" id="ch-${id}-t">${title}</h2>
        <p class="chapter__lede">${lede}</p>
        ${steps.length ? `<ol class="chapter__steps">${each(steps, (s, i) => `<li data-step="${i}"><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${s}</span></li>`)}</ol>` : ''}
        ${topics.length ? `<ul class="chapter__topics">${each(topics, (t) => `<li>${esc(t)}</li>`)}</ul>` : ''}
      </div>
      <div class="chapter__stage">${stage}</div>
    </div>
  </div>
</section>`;
}

/** Window chrome used by most stages. */
export const win = (title, body, cls = '') => `<div class="win ${cls}"><div class="win__bar"><span class="win__dots"><i></i><i></i><i></i></span><span class="win__title">${title}</span><span style="width:46px"></span></div><div class="win__body">${body}</div></div>`;
