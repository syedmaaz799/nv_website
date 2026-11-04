/* Programs listing: program finder quiz. */
const { $, $$, onReady, scrollToTarget } = window.NV;

const REASONS = {
  start: { new: 'Starts from fundamentals — no prior coding needed', sheets: 'Builds directly on spreadsheet and reporting experience', tech: 'Rewards a technical background with real engineering depth', fast: 'Designed for fast, practical results with minimal code' },
  goal: { insight: 'Centred on dashboards, BI and business insight', models: 'Covers the complete data-science lifecycle end to end', systems: 'Goes deep on deep learning, LLMs, agents and MLOps', agents: 'Built entirely around AI agents, automation and AI apps' },
  time: { w6: 'Fits a focused six-week commitment', m3: 'Fits a three-month commitment', m6: 'Uses six months to build real depth' },
};
const FIT = { // which answers genuinely support each program (for honest reasons)
  da: { start: ['new', 'sheets'], goal: ['insight'], time: ['m3'] },
  ds: { start: ['new', 'sheets', 'tech'], goal: ['models'], time: ['m6'] },
  aiml: { start: ['tech'], goal: ['systems'], time: ['m6'] },
  aaa: { start: ['new', 'fast'], goal: ['agents'], time: ['w6'] },
};
const ORDER = ['da', 'ds', 'aiml', 'aaa'];

onReady(() => {
  const root = $('[data-finder]');
  if (!root) return;
  const steps = $$('.finder__step', root);
  const bar = $('[data-finder-bar]', root);
  const result = $('[data-finder-result]', root);
  let cur = 0;
  const show = (i) => {
    cur = i;
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    result.hidden = i < steps.length;
    bar.style.width = `${Math.max(8, (i / steps.length) * 100)}%`;
  };
  root.addEventListener('change', (e) => {
    if (!e.target.matches('input[type=radio]')) return;
    setTimeout(() => (cur < steps.length - 1 ? show(cur + 1) : finish()), 260);
  });
  $$('[data-finder-back]', root).forEach((bk) => bk.addEventListener('click', () => show(Math.max(0, cur - 1))));
  $('[data-finder-restart]', root).addEventListener('click', () => { $$('input', root).forEach((i) => (i.checked = false)); show(0); });

  function finish() {
    const scores = { da: 0, ds: 0, aiml: 0, aaa: 0 };
    const answers = {};
    $$('input:checked', root).forEach((inp) => {
      answers[inp.name] = inp.value;
      Object.entries(JSON.parse(inp.dataset.score)).forEach(([k, v]) => (scores[k] += v));
    });
    const best = ORDER.slice().sort((a, b) => scores[b] - scores[a] || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    $$('[data-match]', root).forEach((m) => (m.hidden = m.dataset.match !== best));
    const why = $(`[data-match="${best}"] [data-why]`, root);
    const lines = Object.entries(answers).filter(([q, v]) => FIT[best][q].includes(v)).map(([q, v]) => REASONS[q][v]);
    if (!lines.length) lines.push('The closest overall match to your answers');
    why.innerHTML = lines.map((l) => `<li>${l}</li>`).join('');
    show(steps.length);
    bar.style.width = '100%';
    if (root.getBoundingClientRect().top < 0) scrollToTarget(root);
  }
  show(0);
});
