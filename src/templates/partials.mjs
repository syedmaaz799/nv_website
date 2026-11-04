import { site } from '../config/site.mjs';
import { PROGRAMS } from '../data/programs.mjs';
import { esc, each, icon, toolChip } from './lib.mjs';
import { btn, waBtn } from './layout.mjs';

export function faqList(items, { name = 'faq' } = {}) {
  return `<div class="faq">${each(items, (f, i) => `<details class="faq__item" data-reveal${i === 0 ? ' open' : ''}>
    <summary class="faq__q">${esc(f.q)}<span class="faq__icon">${icon('plus')}</span></summary>
    <div class="faq__a"><p>${esc(f.a)}</p></div>
  </details>`)}</div>`;
}

export function faqJsonLd(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function toolsMarquee(names, { dur = 70, rev = false } = {}) {
  const row = each(names, (n) => toolChip(n));
  const dup = row.replace(/<li class="tool /g, '<li aria-hidden="true" class="tool ');
  return `<div class="marquee${rev ? ' marquee--rev' : ''}" style="--dur:${dur}s"><ul class="marquee__track">${row}${dup}</ul></div>`;
}

export function ctaBand(b, { title = 'Your AI career starts with a single session.', text = 'Talk to an admissions advisor, download a detailed brochure, or apply in under three minutes.', program } = {}) {
  const brochureHref = program ? b + program.brochure : `${b}programs/index.html#brochures`;
  const applyHref = program ? b + program.applyUrl : `${b}apply.html`;
  const wa = program ? `Hi NeuralVarsity! I'm interested in the ${program.name} program.` : site.whatsappGreeting;
  return `<section class="cta-band section--tight">
  <div class="container">
    <div class="cta-band__card spot" data-reveal>
      <div class="cta-band__glow" aria-hidden="true"></div>
      <div class="bg-grid" aria-hidden="true"></div>
      <div class="cta-band__copy">
        <p class="eyebrow">${program ? esc(program.name) : 'Admissions'}</p>
        <h2 class="h2" data-split>${esc(title)}</h2>
        <p class="lede">${esc(text)}</p>
      </div>
      <div class="btn-row">
        ${btn({ href: applyHref, label: 'Apply now', size: 'lg', iconName: 'arrow-up-right' })}
        ${btn({ href: brochureHref, label: program ? 'Download brochure' : 'Get brochures', variant: 'ghost', size: 'lg', iconName: 'download', attrs: program ? `download data-brochure="${program.key}"` : '' })}
        ${waBtn(b, wa, 'Ask on WhatsApp', 'lg')}
      </div>
    </div>
  </div>
</section>`;
}

export const allToolNames = () => [...new Set(PROGRAMS.flatMap((p) => p.tools))];
