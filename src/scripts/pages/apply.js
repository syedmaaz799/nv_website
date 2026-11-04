/* Apply page: accessible multi-step application with validation, draft saving and honest delivery. */
import { deliver, draft } from '../shared/submit.js';

const { gsap, $, $$, reduced, onReady, scrollToTarget } = window.NV;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LABELS = { program: 'Program', name: 'Name', email: 'Email', phone: 'Phone / WhatsApp', city: 'City', contactPref: 'Preferred contact', background: 'I am a', experience: 'Coding experience', goal: 'Main goal', mode: 'Learning mode', message: 'Notes' };

onReady(() => {
  const form = $('[data-apply]');
  if (!form) return;
  const steps = $$('[data-af-step]', form), dots = $$('.aform__dots li', form), bar = $('[data-af-bar]', form);
  const back = $('[data-af-back]', form), next = $('[data-af-next]', form), submit = $('[data-af-submit]', form);
  const store = draft('apply');
  let cur = 0;

  const val = (name) => { const els = form.elements[name]; if (!els) return ''; if (els instanceof RadioNodeList) return els.value; return els.type === 'checkbox' ? (els.checked ? 'yes' : '') : els.value.trim(); };
  const setErr = (name, msg) => { const e = $(`[data-err="${name}"]`, form); if (e) e.textContent = msg || ''; const f = form.elements[name]; const field = f && f.closest && f.closest('.field'); if (field) field.classList.toggle('is-invalid', !!msg); if (f && f.setAttribute) f.setAttribute('aria-invalid', msg ? 'true' : 'false'); };

  function validate(i) {
    const errs = {};
    if (i === 0 && !val('program')) errs.program = 'Please choose a program.';
    if (i === 1) {
      if (val('name').length < 2) errs.name = 'Please enter your full name.';
      if (!EMAIL.test(val('email'))) errs.email = 'Please enter a valid email address.';
      if (val('phone').replace(/\D/g, '').length < 7) errs.phone = 'Please enter a valid phone number.';
    }
    if (i === 2) ['background', 'experience', 'goal'].forEach((n) => { if (!val(n)) errs[n] = 'Please choose one option.'; });
    if (i === 3 && !val('consent')) errs.consent = 'Please confirm so we can contact you.';
    ['program', 'name', 'email', 'phone', 'background', 'experience', 'goal', 'consent'].forEach((n) => setErr(n, errs[n]));
    const first = Object.keys(errs)[0];
    if (first) { const f = form.elements[first]; const el = f instanceof RadioNodeList ? f[0] : f; if (el && el.focus) el.focus(); }
    return !first;
  }

  function show(i, focus = true) {
    cur = i;
    steps.forEach((s, j) => { s.classList.toggle('is-on', j === i); s.hidden = j !== i; });
    dots.forEach((d, j) => { d.classList.toggle('is-on', j === i); d.classList.toggle('is-done', j < i); });
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    if (i === steps.length - 1) review();
    if (!reduced) gsap.fromTo(steps[i], { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    if (focus) { const lg = $('legend', steps[i]); if (lg) { lg.tabIndex = -1; lg.focus({ preventScroll: true }); } if (form.getBoundingClientRect().top < 0) scrollToTarget(form); }
  }

  function collect() {
    const out = {};
    Object.keys(LABELS).forEach((k) => { const v = val(k); if (v) out[k] = v; });
    const p = form.querySelector('input[name=program]:checked');
    if (p) out.programName = p.dataset.name;
    return out;
  }
  function review() {
    const d = collect();
    $('[data-af-review]', form).innerHTML = Object.entries(LABELS).filter(([k]) => d[k]).map(([k, l]) => `<div><dt>${l}</dt><dd>${(k === 'program' ? d.programName : d[k]).replace(/</g, '&lt;')}</dd></div>`).join('');
  }
  function summary(d) {
    return [`New application — ${d.programName}`, `Name: ${d.name}`, `Email: ${d.email}`, `Phone/WhatsApp: ${d.phone}`, d.city && `City: ${d.city}`, d.contactPref && `Preferred contact: ${d.contactPref}`, `Background: ${d.background}`, `Coding experience: ${d.experience}`, `Goal: ${d.goal}`, d.mode && `Mode: ${d.mode}`, d.message && `Notes: ${d.message}`].filter(Boolean).join('\n');
  }

  // Preselect program from ?program=slug, restore draft
  const saved = store.load();
  if (saved) Object.entries(saved).forEach(([k, v]) => { const f = form.elements[k]; if (!f || k === 'consent') return; if (f instanceof RadioNodeList) { const r = [...f].find((x) => x.value === v); if (r) r.checked = true; } else if (f.type !== 'checkbox') f.value = v; });
  const qp = new URLSearchParams(location.search).get('program');
  if (qp) { const r = form.querySelector(`input[name=program][value="${CSS.escape(qp)}"]`); if (r) { r.checked = true; } }
  form.addEventListener('input', () => { const d = collect(); delete d.consent; store.save(d); });
  form.addEventListener('change', (e) => { if (e.target.name === 'program' && cur === 0) setTimeout(() => { if (validate(0)) show(1); }, 220); });

  next.addEventListener('click', () => { if (validate(cur)) show(cur + 1); });
  back.addEventListener('click', () => show(Math.max(0, cur - 1)));
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && cur < steps.length - 1) { e.preventDefault(); next.click(); } });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(3)) return;
    if (val('company_website')) return; // honeypot
    const d = collect();
    submit.disabled = true;
    submit.querySelector('.btn__label > span').textContent = 'Sending…';
    const r = await deliver('application', d, summary(d));
    const done = $('[data-af-done]', form), text = $('[data-af-done-text]', form), actions = $('[data-af-done-actions]', form);
    const base = (window.NV_CONFIG || {}).base || './';
    const prog = (window.NV_CONFIG.programs || []).find((p) => p.slug === d.program);
    if (r.channel === 'endpoint') { text.textContent = `Thank you, ${d.name.split(' ')[0]}! Your application for ${d.programName} has been received. An advisor will contact you via ${d.contactPref || 'your preferred channel'} shortly.`; store.clear(); }
    else if (r.channel === 'whatsapp' || r.channel === 'email') {
      text.textContent = `Almost done, ${d.name.split(' ')[0]} — tap below to send your application via ${r.channel === 'whatsapp' ? 'WhatsApp' : 'email'}. It's already written for you.`;
      actions.innerHTML = `<a class="btn btn--primary" href="${r.url}" ${r.channel === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}><span class="btn__label"><span>Send via ${r.channel === 'whatsapp' ? 'WhatsApp' : 'email'}</span></span></a>`;
      store.clear();
    } else {
      text.textContent = 'Your application has not been sent yet: online submissions are still being set up. Your answers are saved on this device — copy them below and send them to our admissions team.';
      actions.innerHTML = `<button type="button" class="btn btn--primary" data-copy><span class="btn__label"><span>Copy my application</span></span></button>`;
      $('[data-copy]', actions).addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText(summary(d)).then(() => window.NV.toast('Application copied to clipboard.')); });
    }
    if (prog) actions.insertAdjacentHTML('beforeend', `<a class="btn btn--ghost" href="${base}programs/${prog.slug}.html"><span class="btn__label"><span>Back to ${prog.name}</span></span></a>`);
    steps.forEach((s) => (s.hidden = true));
    $('[data-af-nav]', form).hidden = true;
    $('.aform__top', form).hidden = true;
    done.hidden = false;
    done.focus();
    if (!reduced) gsap.from(done.children, { opacity: 0, y: 16, stagger: 0.08, duration: 0.6, ease: 'power3.out' });
  });

  show(0, false);
});
