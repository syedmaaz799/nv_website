import { site, isPlaceholder } from '../../config/site.mjs';
import { PROGRAMS } from '../../data/programs.mjs';
import { esc, each, icon } from '../lib.mjs';
import { page, btn, waBtn, ph, waAttrs, mailAttrs, telAttrs, socials, waGlyph } from '../layout.mjs';

export function render() {
  const b = './';
  const c = site.contact;
  const body = `
<section class="page-hero contact-hero">
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:900px;left:-320px;top:-380px;--g:63,213,224"></div>
  <div class="container">
    <p class="eyebrow">Contact</p>
    <h1 class="display-l" data-split data-split-now>Let’s talk about <span class="brand-grad-text">your next step.</span></h1>
    <p class="lede" data-reveal>Questions about programs, schedules or fit? Reach an admissions advisor on the channel that suits you.</p>
  </div>
</section>

<section class="section--tight">
  <div class="container contact-grid">
    <div class="ccards">
      <a class="ccard ccard--wa spot" ${waAttrs()} data-reveal>
        <span class="ccard__ic">${waGlyph()}</span>
        <span class="ccard__t">WhatsApp</span>
        <span class="ccard__v">${ph(c.whatsappDisplay)}</span>
        <span class="ccard__go">Start a chat ${icon('arrow-up-right')}</span>
      </a>
      <a class="ccard spot" ${telAttrs()} data-reveal>
        <span class="ccard__ic">${icon('phone')}</span>
        <span class="ccard__t">Call us</span>
        <span class="ccard__v">${ph(c.phoneDisplay)}</span>
        <span class="ccard__go">${ph(c.hours)}</span>
      </a>
      <a class="ccard spot" ${mailAttrs('Website enquiry')} data-reveal>
        <span class="ccard__ic">${icon('mail')}</span>
        <span class="ccard__t">Email</span>
        <span class="ccard__v">${ph(c.email)}</span>
        <span class="ccard__go">Write to admissions</span>
      </a>
      ${each(site.locations, (l) => `<div class="ccard ccard--loc spot" data-reveal>
        <span class="ccard__ic">${icon('map-pin')}</span>
        <span class="ccard__t">${ph(l.name)}</span>
        <span class="ccard__v ccard__addr">${ph(l.address)}<br>${ph(l.city)}</span>
        ${l.mapUrl ? `<a class="ccard__go" href="${esc(l.mapUrl)}" target="_blank" rel="noopener">Open in Maps ${icon('arrow-up-right')}</a>` : ''}
      </div>`)}
      ${socials() ? `<div class="ccard ccard--social" data-reveal><span class="ccard__t">Follow NeuralVarsity</span>${socials()}</div>` : ''}
    </div>

    <form class="cform card" data-contact novalidate data-reveal>
      <h2 class="h3">Send us a message</h2>
      <div class="aform__grid">
        <div class="field"><label class="field__label" for="c-name">Name</label><input class="input" id="c-name" name="name" autocomplete="name" required><p class="field__error" data-err="name"></p></div>
        <div class="field"><label class="field__label" for="c-email">Email</label><input class="input" id="c-email" name="email" type="email" autocomplete="email" required><p class="field__error" data-err="email"></p></div>
        <div class="field"><label class="field__label" for="c-phone">Phone / WhatsApp <small>(optional)</small></label><input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label class="field__label" for="c-topic">Topic</label>
          <select class="select" id="c-topic" name="topic">
            <option>General enquiry</option>
            ${each(PROGRAMS, (p) => `<option>${esc(p.name)}</option>`)}
            <option>Corporate training</option><option>Partnerships</option>
          </select></div>
      </div>
      <div class="field"><label class="field__label" for="c-msg">Message</label><textarea class="textarea" id="c-msg" name="message" rows="5" required></textarea><p class="field__error" data-err="message"></p></div>
      <input type="text" name="company_website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="btn-row"><button type="submit" class="btn btn--primary" data-c-submit><span class="btn__label"><span>Send message</span></span>${icon('send')}</button></div>
      <p class="cform__status" data-c-status role="status" aria-live="polite"></p>
    </form>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="cta-mini" data-reveal>
      <div><p class="eyebrow">Ready to apply?</p><h2 class="h3">Pick a program and apply in minutes.</h2></div>
      <div class="btn-row">${btn({ href: 'apply.html', label: 'Apply now', iconName: 'arrow-up-right' })}${btn({ href: 'programs/index.html', label: 'Explore programs', variant: 'ghost' })}</div>
    </div>
  </div>
</section>
`;
  return page({
    title: 'Contact', pageKey: 'contact', active: 'contact', path: 'contact.html', depth: 0, css: ['forms'], js: ['contact'], body,
    description: 'Contact NeuralVarsity admissions on WhatsApp, phone or email, or send us a message.',
    ogImage: 'assets/img/og/og-home.png',
    jsonLd: { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact NeuralVarsity', url: `${site.url}/contact.html` },
  });
}
