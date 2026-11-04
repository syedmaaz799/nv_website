import { site, isPlaceholder } from '../../config/site.mjs';
import { PROGRAMS } from '../../data/programs.mjs';
import { esc, each, icon } from '../lib.mjs';
import { page, btn, waBtn, ph, waAttrs, mailAttrs, telAttrs } from '../layout.mjs';
import { programViz } from '../viz.mjs';

const BACKGROUNDS = ['Student', 'Recent graduate', 'Working professional', 'Career switcher', 'Founder / business owner', 'Other'];
const EXPERIENCE = ['No coding experience', 'Some Excel / spreadsheets', 'Some coding (any language)', 'I code professionally'];
const GOALS = ['Land a new role in data / AI', 'Upskill in my current role', 'Build AI products or automations', 'Explore before committing'];
const MODES = ['Online (live)', 'In-person', 'Either works'];
const CONTACT = ['WhatsApp', 'Phone call', 'Email'];

const radioCards = (name, items, req = true) => `<div class="rcards">${each(items, (it, i) => `<label class="rcard"><input type="radio" name="${name}" value="${esc(it)}"${req && i === 0 ? ' required' : ''}><span>${esc(it)}</span></label>`)}</div>`;

export function render() {
  const b = './';
  const body = `
<section class="page-hero apply-hero">
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true" style="--s:900px;right:-300px;top:-380px;--g:245,181,68"></div>
  <div class="container apply-grid">
    <div class="apply-intro">
      <p class="eyebrow">Admissions</p>
      <h1 class="display-l" data-split data-split-now>Apply in under <span class="brand-grad-text">three minutes.</span></h1>
      <p class="lede" data-reveal>Tell us a little about yourself and the program you’re interested in. An admissions advisor will reach out to talk through fit, schedules and next steps.</p>
      <ol class="apply-steps" data-reveal>
        <li><span class="mono">01</span><b>Apply online</b><small>Choose a program and share your background.</small></li>
        <li><span class="mono">02</span><b>Talk to an advisor</b><small>A quick conversation about goals, fit and schedules.</small></li>
        <li><span class="mono">03</span><b>Enrol &amp; start building</b><small>Get set up and begin your first session.</small></li>
      </ol>
      <div class="apply-help spot" data-reveal>
        <p class="stage-label">Prefer to talk first?</p>
        <ul>
          <li><a ${waAttrs('Hi NeuralVarsity! I have a question before applying.')}>${icon('message-circle')}WhatsApp · ${ph(site.contact.whatsappDisplay)}</a></li>
          <li><a ${telAttrs()}>${icon('phone')}${ph(site.contact.phoneDisplay)}</a></li>
          <li><a ${mailAttrs('Admissions enquiry')}>${icon('mail')}${ph(site.contact.email)}</a></li>
        </ul>
      </div>
    </div>

    <div class="aform-wrap" data-reveal>
      <form class="aform" data-apply novalidate aria-describedby="aform-note">
        <div class="aform__top">
          <ol class="aform__dots" aria-hidden="true"><li class="is-on">Program</li><li>About you</li><li>Background</li><li>Review</li></ol>
          <div class="aform__bar"><span data-af-bar></span></div>
        </div>

        <fieldset class="aform__step is-on" data-af-step="0">
          <legend class="aform__q">Which program are you applying for?</legend>
          <div class="pchoice">
            ${each(PROGRAMS, (p, i) => `<label class="pchoice__card" style="--accent:${p.accent};--accent-2:${p.accent2};--accent-rgb:${p.accentRgb}">
              <input type="radio" name="program" value="${p.slug}" data-name="${esc(p.name)}"${i === 0 ? ' required' : ''}>
              <span class="pchoice__viz">${programViz(p.key)}</span>
              <span class="pchoice__txt"><b>${esc(p.name)}</b><small>${esc(p.duration)} · ${p.sessions} sessions</small></span>
              <span class="pchoice__tick">${icon('check')}</span>
            </label>`)}
          </div>
          <p class="field__error" data-err="program" role="alert"></p>
        </fieldset>

        <fieldset class="aform__step" data-af-step="1">
          <legend class="aform__q">About you</legend>
          <div class="aform__grid">
            <div class="field"><label class="field__label" for="af-name">Full name</label><input class="input" id="af-name" name="name" autocomplete="name" required placeholder="Your full name"><p class="field__error" data-err="name"></p></div>
            <div class="field"><label class="field__label" for="af-email">Email</label><input class="input" id="af-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><p class="field__error" data-err="email"></p></div>
            <div class="field"><label class="field__label" for="af-phone">Phone / WhatsApp</label><input class="input" id="af-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+00 00000 00000" inputmode="tel"><p class="field__error" data-err="phone"></p></div>
            <div class="field"><label class="field__label" for="af-city">City <small>(optional)</small></label><input class="input" id="af-city" name="city" autocomplete="address-level2" placeholder="Where are you based?"></div>
          </div>
          <div class="field"><span class="field__label">Preferred way to reach you</span>${radioCards('contactPref', CONTACT)}</div>
        </fieldset>

        <fieldset class="aform__step" data-af-step="2">
          <legend class="aform__q">Your background &amp; goals</legend>
          <div class="field"><span class="field__label">I am a…</span>${radioCards('background', BACKGROUNDS)}<p class="field__error" data-err="background"></p></div>
          <div class="field"><span class="field__label">Coding experience</span>${radioCards('experience', EXPERIENCE)}<p class="field__error" data-err="experience"></p></div>
          <div class="field"><span class="field__label">Main goal</span>${radioCards('goal', GOALS)}<p class="field__error" data-err="goal"></p></div>
          <div class="field"><span class="field__label">Learning mode <small>(optional)</small></span>${radioCards('mode', MODES, false)}</div>
          <div class="field"><label class="field__label" for="af-msg">Anything else? <small>(optional)</small></label><textarea class="textarea" id="af-msg" name="message" rows="3" placeholder="Questions, schedule constraints, what you hope to build…"></textarea></div>
        </fieldset>

        <fieldset class="aform__step" data-af-step="3">
          <legend class="aform__q">Review &amp; submit</legend>
          <dl class="aform__review" data-af-review></dl>
          <label class="check"><input type="checkbox" name="consent" required><span>I agree to be contacted by NeuralVarsity about my application, and I have read the <a class="u-link" href="privacy.html">privacy notice</a>.</span></label>
          <p class="field__error" data-err="consent"></p>
          <input type="text" name="company_website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
        </fieldset>

        <div class="aform__done" data-af-done hidden tabindex="-1">
          <span class="aform__ok">${icon('circle-check')}</span>
          <h2 class="h3">Application received.</h2>
          <p class="muted" data-af-done-text>Thank you! An admissions advisor will contact you shortly.</p>
          <div class="btn-row" data-af-done-actions></div>
        </div>

        <div class="aform__nav" data-af-nav>
          <button type="button" class="btn btn--ghost btn--sm" data-af-back hidden>${icon('arrow-right', 'icon--back')}<span class="btn__label"><span>Back</span></span></button>
          <button type="button" class="btn btn--primary" data-af-next><span class="btn__label"><span>Continue</span></span>${icon('arrow-right', 'icon--arrow')}</button>
          <button type="submit" class="btn btn--primary" data-af-submit hidden><span class="btn__label"><span>Submit application</span></span>${icon('send')}</button>
        </div>
        <p class="aform__note" id="aform-note">${icon('lock')}Your details are only used to respond to your application.</p>
      </form>
    </div>
  </div>
</section>
`;
  return page({
    title: 'Apply', pageKey: 'apply', active: 'apply', path: 'apply.html', depth: 0, css: ['forms'], js: ['apply'], body,
    description: 'Apply to a NeuralVarsity program: Data Analyst with GenAI, Data Science with GenAI, Applied AI & Machine Learning, or AI Agents & Automation.',
    ogImage: 'assets/img/og/og-apply.png',
  });
}
