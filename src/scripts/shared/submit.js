/**
 * Form delivery. Order of preference (configured in src/config/site.mjs):
 *   1. POST JSON to forms.endpoint (Formspree, Web3Forms, Apps Script, your API…)
 *   2. Hand off to WhatsApp with a pre-filled message
 *   3. Open the visitor's email client with a pre-filled draft
 * Returns { ok, channel, url? } — the UI tells the visitor exactly what happened.
 */
export async function deliver(kind, data, summaryText) {
  const cfg = window.NV_CONFIG || {};
  if (cfg.endpoint) {
    try {
      const payload = { form: kind, submittedAt: new Date().toISOString(), page: location.href, ...data };
      if (cfg.accessKey) payload.access_key = cfg.accessKey;
      const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) return { ok: true, channel: 'endpoint' };
    } catch (e) { /* fall through to manual channels */ }
  }
  if (cfg.whatsapp) return { ok: true, channel: 'whatsapp', url: `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(summaryText)}` };
  if (cfg.email) return { ok: true, channel: 'email', url: `mailto:${cfg.email}?subject=${encodeURIComponent(kind === 'application' ? 'Program application' : 'Website enquiry')}&body=${encodeURIComponent(summaryText)}` };
  return { ok: false, channel: 'none' };
}

/** Persist a draft so visitors never lose their input. */
export function draft(key) {
  const k = `nv-draft-${key}`;
  return {
    load() { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
    save(v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
    clear() { try { localStorage.removeItem(k); } catch { /* storage unavailable */ } },
  };
}
