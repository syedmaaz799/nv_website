/* Contact form: validation + delivery (endpoint → WhatsApp → email). */
import { deliver } from '../shared/submit.js';

const { $, onReady } = window.NV;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

onReady(() => {
  const form = $('[data-contact]');
  if (!form) return;
  const status = $('[data-c-status]', form), btn = $('[data-c-submit]', form);
  const setErr = (n, m) => { const e = $(`[data-err="${n}"]`, form); if (e) e.textContent = m || ''; const f = form.elements[n]; f.closest('.field').classList.toggle('is-invalid', !!m); f.setAttribute('aria-invalid', m ? 'true' : 'false'); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    if (d.company_website) return;
    const errs = { name: d.name.trim().length < 2 && 'Please enter your name.', email: !EMAIL.test(d.email.trim()) && 'Please enter a valid email.', message: d.message.trim().length < 5 && 'Please write a short message.' };
    Object.entries(errs).forEach(([k, v]) => setErr(k, v));
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) { form.elements[first].focus(); return; }
    btn.disabled = true;
    const text = `Website enquiry — ${d.topic}\nName: ${d.name}\nEmail: ${d.email}${d.phone ? `\nPhone: ${d.phone}` : ''}\n\n${d.message}`;
    const r = await deliver('contact', d, text);
    btn.disabled = false;
    if (r.channel === 'endpoint') { status.textContent = 'Thanks — your message has been sent. Our team will get back to you soon.'; form.reset(); }
    else if (r.url) { status.innerHTML = `Your message is ready — <a class="u-link" href="${r.url}" ${r.channel === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}>send it via ${r.channel === 'whatsapp' ? 'WhatsApp' : 'email'}</a>.`; }
    else status.textContent = 'Your message has not been sent: online messaging is still being set up. Please try WhatsApp, phone or email instead.';
  });
});
