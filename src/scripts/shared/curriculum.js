/* Curriculum explorer: accessible tabs, search with highlighting, expand/collapse all. */
export function initCurriculum(root) {
  if (!root) return;
  const { $, $$, scrollToTarget } = window.NV;
  const tabs = $$('[role=tab]', root);
  const panels = $$('[role=tabpanel]', root);
  const days = $$('[data-day]', root);
  const input = $('[data-curr-search]', root);
  const empty = $('[data-curr-empty]', root);
  const expandBtn = $('[data-curr-expand]', root);
  const original = new Map(days.map((d) => [d, d.innerHTML]));
  const text = new Map(days.map((d) => [d, d.textContent.toLowerCase()]));

  function select(tab, focus = false) {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    panels.forEach((p) => (p.hidden = p.id !== tab.getAttribute('aria-controls')));
    if (focus) tab.focus();
    if (window.innerWidth < 960) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    window.NV.ScrollTrigger.refresh();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key; let j = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % tabs.length;
      if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') j = 0; if (k === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });

  // Deep link: #curriculum-<unit-id>
  window.NV.selectUnit = (id) => { const t = tabs.find((x) => x.dataset.tab === id); if (t) { select(t); scrollToTarget(root); } };

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function highlight(node, re) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const hits = [];
    const probe = new RegExp(re.source, 'i');
    while (walker.nextNode()) if (probe.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
    hits.forEach((tn) => {
      const span = document.createElement('span');
      span.innerHTML = tn.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(re, '<mark>$&</mark>');
      tn.replaceWith(...span.childNodes);
    });
  }
  let timer;
  function search(q) {
    q = q.trim().toLowerCase();
    days.forEach((d) => { d.innerHTML = original.get(d); });
    if (!q) {
      root.classList.remove('is-searching');
      days.forEach((d) => { d.hidden = false; d.open = false; });
      $$('[data-group]', root).forEach((g) => (g.hidden = false));
      panels.forEach((p) => (p.hidden = p.id !== tabs.find((t) => t.getAttribute('aria-selected') === 'true').getAttribute('aria-controls')));
      empty.hidden = true;
      window.NV.ScrollTrigger.refresh();
      return;
    }
    root.classList.add('is-searching');
    const re = new RegExp(escRe(q), 'gi');
    let n = 0;
    days.forEach((d) => { const hit = text.get(d).includes(q); d.hidden = !hit; d.open = hit; if (hit) { n++; highlight(d, re); } });
    $$('[data-group]', root).forEach((g) => (g.hidden = !$$('[data-day]', g).some((d) => !d.hidden)));
    panels.forEach((p) => (p.hidden = !$$('[data-day]', p).some((d) => !d.hidden)));
    empty.hidden = n > 0;
    window.NV.ScrollTrigger.refresh();
  }
  input && input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => search(input.value), 140); });

  expandBtn && expandBtn.addEventListener('click', () => {
    const on = expandBtn.getAttribute('aria-pressed') !== 'true';
    expandBtn.setAttribute('aria-pressed', String(on));
    expandBtn.querySelector('.btn__label > span').textContent = on ? 'Collapse all' : 'Expand all';
    days.forEach((d) => { if (!d.hidden) d.open = on; });
    window.NV.ScrollTrigger.refresh();
  });
  root.addEventListener('toggle', () => window.NV.ScrollTrigger.refresh(), true);
}
