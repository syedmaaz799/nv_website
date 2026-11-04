import { site, isPlaceholder } from '../config/site.mjs';
import { PROGRAMS } from '../data/programs.mjs';
import { esc, each, icon, brand } from './lib.mjs';

/* ---------- contact link builders (placeholder-aware) ---------- */
export const hasWhatsApp = () => !isPlaceholder(site.contact.whatsapp);
export function waHref(text = site.whatsappGreeting) {
  return hasWhatsApp() ? `https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}` : '#contact-pending';
}
export const waAttrs = (text) => (hasWhatsApp() ? `href="${waHref(text)}" target="_blank" rel="noopener"` : `href="#contact-pending" data-pending="whatsapp"`);
export const telAttrs = () => (isPlaceholder(site.contact.phoneHref) ? `href="#contact-pending" data-pending="phone"` : `href="tel:${site.contact.phoneHref}"`);
export const mailAttrs = (subject = '') =>
  isPlaceholder(site.contact.email) ? `href="#contact-pending" data-pending="email"` : `href="mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}"`;

const LINKEDIN = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM.5 8h4.9v15.5H.5V8zm7.6 0h4.7v2.1h.07c.65-1.24 2.25-2.55 4.63-2.55 4.95 0 5.87 3.26 5.87 7.5v8.45h-4.9v-7.5c0-1.79-.03-4.09-2.49-4.09-2.5 0-2.88 1.95-2.88 3.96v7.63H8.1V8z"/></svg>';
export function socials() {
  const s = site.social;
  const items = [
    s.linkedin && ['LinkedIn', s.linkedin, LINKEDIN],
    s.instagram && ['Instagram', s.instagram, brand('instagram')],
    s.youtube && ['YouTube', s.youtube, brand('youtube')],
    s.facebook && ['Facebook', s.facebook, brand('facebook')],
    s.x && ['X', s.x, brand('x')],
  ].filter(Boolean);
  if (!items.length) return '';
  return `<div class="socials">${each(items, ([n, u, svg]) => `<a href="${esc(u)}" target="_blank" rel="noopener" aria-label="NeuralVarsity on ${n}">${svg}</a>`)}</div>`;
}

export const waGlyph = () => brand('whatsapp');
/** Render a config value; placeholders are flagged so they're easy to spot before launch. */
export const ph = (v) => (isPlaceholder(v) ? `<span class="is-placeholder">${esc(v || '[Not set]')}</span>` : esc(v));

/* ---------- reusable buttons ---------- */
export const btn = ({ href, label, variant = 'primary', size = '', iconName = 'arrow-right', attrs = '', iconPos = 'end', cls = '' }) => {
  const ic = iconName ? icon(iconName, iconName === 'arrow-right' || iconName === 'arrow-up-right' ? 'icon--arrow' : iconName === 'download' ? 'icon--down' : '') : '';
  return `<a class="btn btn--${variant}${size ? ' btn--' + size : ''}${cls ? ' ' + cls : ''}" href="${href}" data-magnetic ${attrs}>${iconPos === 'start' ? ic : ''}<span class="btn__label"><span>${esc(label)}</span></span>${iconPos === 'end' ? ic : ''}</a>`;
};
export const waBtn = (b, text, label = 'Chat on WhatsApp', size = '') =>
  `<a class="btn btn--wa${size ? ' btn--' + size : ''}" ${waAttrs(text)} data-magnetic>${waGlyph()}<span class="btn__label"><span>${esc(label)}</span></span></a>`;

/** The three program actions required on listings: Download Brochure · Apply Now · Learn More */
export function programActions(p, b, { size = 'sm', learn = true } = {}) {
  return `<div class="btn-row program-actions">
    ${btn({ href: b + p.brochure, label: 'Download Brochure', variant: 'ghost', size, iconName: 'download', attrs: `download data-brochure="${p.key}"` })}
    ${btn({ href: b + p.applyUrl, label: 'Apply Now', variant: 'primary', size, iconName: 'arrow-up-right' })}
    ${learn ? btn({ href: b + p.url, label: 'Learn More', variant: 'glass', size, iconName: 'arrow-right' }) : ''}
  </div>`;
}

/* ---------- head ---------- */
function head({ title, description, path: pagePath, b, css = [], ogImage, jsonLd, accent }) {
  const url = site.url.replace(/\/$/, '') + '/' + pagePath.replace(/^\//, '').replace(/index\.html$/, '');
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const og = site.url.replace(/\/$/, '') + '/' + (ogImage || 'assets/img/og/og-home.png');
  return `<!doctype html>
<html lang="en"${accent ? ` style="${accent}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#05070d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" type="image/png" sizes="64x64" href="${b}assets/img/favicon.png">
<link rel="apple-touch-icon" href="${b}assets/img/favicon.png">
<link rel="preload" href="${b}assets/fonts/sora.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${b}assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${b}assets/css/site.css?v=__V_site.css__">
${each(css, (c) => `<link rel="stylesheet" href="${b}assets/css/${c}.css?v=__V_${c}.css__">\n`)}<script>document.documentElement.classList.add('js');</script>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>`;
}

/* ---------- header ---------- */
function header(b, active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="hdr" data-hdr>
  <div class="hdr__inner container">
    <a class="logo" href="${b}index.html" aria-label="${esc(site.name)} — home">
      <img class="logo__crest" src="${b}assets/img/favicon.png" width="34" height="34" alt="">
      <span class="logo__word">NeuralVarsity<span class="logo__tld">.ai</span></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav__list">
        <li class="nav__item nav__item--mega" data-mega>
          <button class="nav__link" type="button" aria-expanded="false" aria-controls="mega-programs"${active === 'programs' ? ' aria-current="page"' : ''}>Programs ${icon('chevron-down')}</button>
          <div class="mega" id="mega-programs">
            ${each(PROGRAMS, (p) => `<a class="mega__card" href="${b}${p.url}" style="--c:${p.accent};--c-rgb:${p.accentRgb}">
              <span class="mega__num">PROGRAM ${p.number}</span>
              <span class="mega__name">${esc(p.name)}</span>
              <span class="mega__meta">${esc(p.duration)} · ${p.sessions} sessions</span>
              <span class="mega__blurb">${esc(p.cardBlurb)}</span>
              <span class="mega__go">Explore ${icon('arrow-right')}</span>
            </a>`)}
            <div class="mega__side">
              <span class="mega__side-title">Explore</span>
              <a href="${b}programs/index.html">All programs ${icon('arrow-right')}</a>
              <a href="${b}programs/index.html#compare">Compare programs ${icon('scale')}</a>
              <a href="${b}programs/index.html#finder">Find your fit ${icon('compass')}</a>
              <a href="${b}apply.html">Apply now ${icon('arrow-up-right')}</a>
            </div>
          </div>
        </li>
        <li><a class="nav__link" href="${b}about.html"${cur('about')}>About</a></li>
        <li><a class="nav__link" href="${b}apply.html"${cur('apply')}>Admissions</a></li>
        <li><a class="nav__link" href="${b}contact.html"${cur('contact')}>Contact</a></li>
      </ul>
    </nav>
    <div class="hdr__actions">
      <a class="icon-btn icon-btn--wa" ${waAttrs()} aria-label="Chat with an advisor on WhatsApp">${waGlyph()}</a>
      ${btn({ href: `${b}apply.html`, label: 'Apply now', size: 'sm', iconName: 'arrow-up-right', cls: 'btn--apply' })}
      <button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mnav" id="mnav" aria-label="Mobile menu">
  <p class="mnav__label mnav__anim" style="--i:0">Programs</p>
  <div class="mnav__programs">
    ${each(PROGRAMS, (p, i) => `<a class="mnav__program mnav__anim" style="--i:${i + 1};--c:${p.accent}" href="${b}${p.url}"><span class="mnav__dot"></span><span><b>${esc(p.name)}</b><small>${esc(p.duration)} · ${p.sessions} sessions</small></span></a>`)}
  </div>
  <nav class="mnav__links" aria-label="Mobile">
    <a class="mnav__anim" style="--i:5" href="${b}programs/index.html">All programs</a>
    <a class="mnav__anim" style="--i:6" href="${b}about.html">About</a>
    <a class="mnav__anim" style="--i:7" href="${b}apply.html">Admissions</a>
    <a class="mnav__anim" style="--i:8" href="${b}contact.html">Contact</a>
  </nav>
  <div class="mnav__foot mnav__anim" style="--i:9">
    ${btn({ href: `${b}apply.html`, label: 'Apply now', iconName: 'arrow-up-right' })}
    ${waBtn(b, site.whatsappGreeting, 'WhatsApp')}
  </div>
</div>`;
}

/* ---------- footer ---------- */
function footer(b) {
  const c = site.contact;
  return `<footer class="ftr">
  <div class="container">
    <div class="ftr__grid">
      <div class="ftr__brand">
        <a class="logo" href="${b}index.html" aria-label="${esc(site.name)} — home"><img class="logo__crest" src="${b}assets/img/favicon.png" width="34" height="34" alt=""><span class="logo__word">NeuralVarsity<span class="logo__tld">.ai</span></span></a>
        <p>${esc(site.description)}</p>
        ${socials()}
      </div>
      <div>
        <p class="ftr__title">Programs</p>
        <ul class="ftr__list">${each(PROGRAMS, (p) => `<li><a class="u-link" href="${b}${p.url}">${esc(p.name)}</a></li>`)}
          <li><a class="u-link" href="${b}programs/index.html#compare">Compare programs</a></li></ul>
      </div>
      <div>
        <p class="ftr__title">NeuralVarsity</p>
        <ul class="ftr__list">
          <li><a class="u-link" href="${b}about.html">About us</a></li>
          <li><a class="u-link" href="${b}apply.html">Admissions &amp; apply</a></li>
          <li><a class="u-link" href="${b}programs/index.html#brochures">Brochures</a></li>
          <li><a class="u-link" href="${b}contact.html">Contact</a></li>
          <li><a class="u-link" href="${b}privacy.html">Privacy</a></li>
        </ul>
      </div>
      <div>
        <p class="ftr__title">Get in touch</p>
        <ul class="ftr__list">
          <li><a ${waAttrs()}>${icon('message-circle')}<span>WhatsApp: ${ph(c.whatsappDisplay)}</span></a></li>
          <li><a ${telAttrs()}>${icon('phone')}<span>${ph(c.phoneDisplay)}</span></a></li>
          <li><a ${mailAttrs()}>${icon('mail')}<span>${ph(c.email)}</span></a></li>
          ${each(site.locations, (l) => `<li><span>${icon('map-pin')}<span>${ph(l.name)}<br>${ph(l.address)}, ${ph(l.city)}</span></span></li>`)}
        </ul>
      </div>
    </div>
    <svg class="ftr__word" viewBox="0 0 1000 150" aria-hidden="true" focusable="false"><defs><linearGradient id="ftrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".9" stop-color="#fff" stop-opacity=".01"/></linearGradient></defs><text x="0" y="128" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="url(#ftrGrad)">NeuralVarsity</text></svg>
    <div class="ftr__bottom">
      <span>© ${new Date().getFullYear()} ${esc(site.legalName)}. All rights reserved.</span>
      <nav aria-label="Footer"><a href="${b}privacy.html">Privacy</a><a href="${b}contact.html">Contact</a><a href="#main" data-top>Back to top ↑</a></nav>
    </div>
  </div>
</footer>`;
}

/* ---------- full page ---------- */
export function page({ title, description, path: pagePath, depth = 0, active = '', css = [], js = [], three = false, body, ogImage, jsonLd, accent, waText, pageKey = '' }) {
  const b = depth ? '../'.repeat(depth) : './';
  const runtime = {
    base: b,
    whatsapp: hasWhatsApp() ? site.contact.whatsapp.replace(/\D/g, '') : '',
    email: isPlaceholder(site.contact.email) ? '' : site.contact.email,
    endpoint: site.forms.endpoint || '',
    accessKey: site.forms.accessKey || '',
    programs: PROGRAMS.map((p) => ({ slug: p.slug, name: p.name, key: p.key })),
    scene3d: three ? `${b}assets/js/scene3d.js?v=__V_scene3d.js__` : '',
  };
  return `${head({ title, description, path: pagePath, b, css, ogImage, jsonLd, accent })}
<body class="grain" data-page="${pageKey}">
<!--SPRITE-->
${header(b, active)}
<main id="main">
${body}
</main>
${footer(b)}
<a class="wa-float" ${waAttrs(waText || site.whatsappGreeting)} aria-label="Chat with an admissions advisor on WhatsApp">
  <span class="wa-float__icon">${waGlyph()}</span><span class="wa-float__text">Chat with an advisor</span>
</a>
<div class="cursor is-hidden" aria-hidden="true"><div class="cursor__ring"><span class="cursor__label"></span></div><div class="cursor__dot"></div></div>
<div class="toast" role="status" aria-live="polite"></div>
<script>window.NV_CONFIG=${JSON.stringify(runtime)};</script>
<script src="${b}assets/js/core.js?v=__V_core.js__" defer></script>
${each(js, (j) => `<script src="${b}assets/js/${j}.js?v=__V_${j}.js__" defer></script>\n`)}</body>
</html>`;
}
