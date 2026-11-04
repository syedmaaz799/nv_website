/** Data Analyst with GenAI — immersive story: from spreadsheets to AI-assisted insight. */
import { esc, each, icon, codeLines } from '../lib.mjs';
import { chapter, win } from '../chapter.mjs';

export const three = false;

const SALES = [
  ['2025-07-01', 'West', '  aisha k.', 'Aisha K.', 'Laptop', 14, 18200],
  ['2025-07-02', 'East', 'RAHUL m. ', 'Rahul M.', 'Tablet', 22, 9680],
  ['2025-07-03', 'West', 'sofia  l.', 'Sofia L.', 'Monitor', 9, 3150],
  ['2025-07-04', 'North', ' omar S.', 'Omar S.', 'Laptop', 11, 14300],
  ['2025-07-05', 'South', 'MEI t.', 'Mei T.', 'Phone', 31, 21700],
  ['2025-07-06', 'West', 'daniel r', 'Daniel R.', 'Phone', 18, 12600],
  ['2025-07-07', 'East', ' priya N.', 'Priya N.', 'Laptop', 7, 9100],
];
const fmt = (n) => n.toLocaleString('en-US');
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/* ---------------------------------------------------------------- hero */
export function heroArt() {
  const rows = SALES.slice(0, 6);
  return `<div class="da-hero" data-da-hero>
  <div class="da-hero__sheet">
    ${win('Q3_Sales.xlsx — Excel', `
      <div class="xl-ribbon"><span class="is-on">Home</span><span>Insert</span><span>Formulas</span><span>Data</span><span>Review</span></div>
      <div class="xl-fx"><span class="xl-fx__ref mono">F9</span><span class="xl-fx__fx">fx</span><span class="xl-fx__in mono"><span data-hero-type>=SUMIFS(F2:F7, B2:B7, "West")</span><span class="caret"></span></span></div>
      <div class="xl-grid xl-grid--hero">
        <div class="xl-row xl-row--h"><span></span>${each(COLS.slice(0, 6), (c) => `<span>${c}</span>`)}</div>
        <div class="xl-row xl-row--th"><span>1</span><span>Date</span><span>Region</span><span>Rep</span><span>Product</span><span>Units</span><span>Revenue</span></div>
        ${each(rows, (r, i) => `<div class="xl-row"><span>${i + 2}</span><span>${r[0].slice(5)}</span><span class="${r[1] === 'West' ? 'is-hit' : ''}">${r[1]}</span><span>${r[3]}</span><span>${r[4]}</span><span class="num">${r[5]}</span><span class="num ${r[1] === 'West' ? 'is-hit' : ''}">${fmt(r[6])}</span></div>`)}
        <div class="xl-row xl-row--total"><span>9</span><span></span><span></span><span></span><span></span><span class="num">West</span><span class="num xl-sel" data-hero-total>33,950</span></div>
      </div>`, 'da-hero__win')}
  </div>
  <div class="da-chip da-chip--1 mono" data-par="0.6">=SORT(UNIQUE(B2:B8))</div>
  <div class="da-chip da-chip--2 mono" data-par="-0.5"><span class="t-kw">SELECT</span> region, <span class="t-fn">SUM</span>(revenue)</div>
  <div class="da-chip da-chip--3" data-par="0.9"><span class="stage-label">Revenue</span><b>4.82M</b><em>▲ 12.4% YoY</em></div>
  <div class="da-chip da-chip--4 mono" data-par="-0.8">df.<span class="t-fn">groupby</span>(<span class="t-str">"region"</span>)</div>
  <div class="da-chip da-chip--5" data-par="0.4">${icon('sparkles')}<span>“Summarise Q3 drivers”</span></div>
</div>`;
}

/* ---------------------------------------------------------------- chapters */
function excelStage() {
  return win('Sales_Model.xlsx — Excel', `
  <div class="xl-ribbon"><span>Home</span><span>Insert</span><span class="is-on">Formulas</span><span>Data</span><span>Review</span><span class="xl-ribbon__fn mono">ƒx SUMIFS · FILTER · SORT</span></div>
  <div class="xl-fx"><span class="xl-fx__ref mono" data-xl-ref>C2</span><span class="xl-fx__fx">fx</span>
    <span class="xl-fx__in mono">
      <span class="xl-f" data-f="0">=PROPER(TRIM(C2))</span>
      <span class="xl-f" data-f="1">=SUMIFS(F2:F8, B2:B8, "West")</span>
      <span class="xl-f" data-f="2">Conditional Formatting › Color Scale</span>
      <span class="xl-f" data-f="3">=SORT(UNIQUE(B2:B8))</span>
      <span class="xl-f" data-f="4">Insert › Column Chart · Sparklines</span>
    </span></div>
  <div class="xl-sheet">
    <div class="xl-grid xl-grid--main" data-xl>
      <div class="xl-row xl-row--h"><span></span>${each(COLS, (c) => `<span>${c}</span>`)}</div>
      <div class="xl-row xl-row--th"><span>1</span><span>Date</span><span>Region</span><span>Rep</span><span>Product</span><span>Units</span><span>Revenue</span><span>Trend</span><span>Regions</span></div>
      ${each(SALES, (r, i) => `<div class="xl-row" data-xl-row="${i}"><span>${i + 2}</span><span>${r[0].slice(5)}</span><span class="xl-b ${r[1] === 'West' ? 'is-west' : ''}">${r[1]}</span><span class="xl-rep"><i class="xl-raw">${esc(r[2])}</i><i class="xl-clean">${r[3]}</i></span><span>${r[4]}</span><span class="num">${r[5]}</span><span class="num xl-rev ${r[1] === 'West' ? 'is-west' : ''}" style="--heat:${(r[6] / 21700).toFixed(2)}">${fmt(r[6])}</span><span class="xl-spark"><svg viewBox="0 0 60 18"><polyline points="${[0, 1, 2, 3, 4, 5].map((k) => `${k * 12},${(14 - ((r[6] / 2000 + k * (i % 3) + (k % 2 ? 3 : 0)) % 12)).toFixed(1)}`).join(' ')}"/></svg></span><span class="xl-spill">${['East', 'North', 'South', 'West', '', '', ''][i]}</span></div>`)}
      <div class="xl-row xl-row--total"><span>9</span><span></span><span></span><span></span><span></span><span class="num">West Σ</span><span class="num xl-result" data-xl-result>33,950</span><span></span><span></span></div>
    </div>
    <div class="xl-ants xl-ants--b" aria-hidden="true"></div><div class="xl-ants xl-ants--f" aria-hidden="true"></div><div class="xl-spillbox" aria-hidden="true"></div>
    <div class="xl-chart" data-xl-chart>
      <p class="stage-label">Revenue by region</p>
      <div class="xl-chart__bars">${each([['West', 33950], ['South', 21700], ['East', 18780], ['North', 14300]], ([k, v]) => `<div class="xl-chart__col"><i style="--h:${(v / 33950).toFixed(3)}"></i><span>${k}</span></div>`)}</div>
    </div>
  </div>`, 'stage-win xl-win');
}

function pqStage() {
  const rows = [
    ['C-1001', '  ali HASSAN ', '03/04/2025', '1,200 USD', 'Gold', 'Ali Hassan', '2025-04-03', '1200'],
    ['C-1002', 'SARA khan', '4-Mar-2025', '860 usd', 'Silver', 'Sara Khan', '2025-03-04', '860'],
    ['C-1003', ' n/a ', '2025.03.12', '—', 'Gold', 'null', '2025-03-12', 'null'],
    ['C-1004', 'john  o\'neil', '12/03/25', '2,045 USD', 'Bronze', 'John O\'Neil', '2025-03-12', '2045'],
    ['C-1005', 'MEI lin ', '15-03-2025', '1,530 USD', 'Silver', 'Mei Lin', '2025-03-15', '1530'],
  ];
  const steps = ['Source', 'Promoted Headers', 'Changed Type', 'Trimmed & Proper Text', 'Replaced Values', 'Merged Queries', 'Appended Queries'];
  return win('Power Query Editor — Sales', `
  <div class="pq">
    <aside class="pq__queries"><p class="stage-label">Queries [3]</p><ul><li class="is-on">${icon('table')}Sales_2025</li><li>${icon('table')}Sales_2024</li><li>${icon('table')}Customers</li></ul></aside>
    <div class="pq__main">
      <div class="pq__formula mono">= Table.TransformColumns(#"Changed Type", {{"Name", each Text.Proper(Text.Trim(_))}})</div>
      <div class="pq__table" data-pq>
        <div class="pq__row pq__row--h"><span><i class="pq__ty" data-ty="abc">ABC</i>CustomerID</span><span><i class="pq__ty" data-ty="abc">ABC</i>Name</span><span><i class="pq__ty pq__ty--date">ABC</i>Joined</span><span><i class="pq__ty pq__ty--num">ABC</i>Amount</span><span class="pq__seg"><i class="pq__ty">ABC</i>Segment</span></div>
        ${each(rows, (r) => `<div class="pq__row"><span>${r[0]}</span><span class="pq__cell"><i class="pq__raw">${esc(r[1])}</i><i class="pq__ok${r[5] === 'null' ? ' pq__null' : ''}">${esc(r[5])}</i></span><span class="pq__cell"><i class="pq__raw">${esc(r[2])}</i><i class="pq__ok">${r[6]}</i></span><span class="pq__cell num"><i class="pq__raw">${esc(r[3])}</i><i class="pq__ok${r[7] === 'null' ? ' pq__null' : ''}">${r[7]}</i></span><span class="pq__seg">${r[4]}</span></div>`)}
        <div class="pq__append" data-pq-append>${icon('layers')}<span>+ Sales_2024 appended</span><b class="mono">2,496 rows</b></div>
      </div>
    </div>
    <aside class="pq__steps"><p class="stage-label">Applied steps</p><ol>${each(steps, (s, i) => `<li data-pq-step="${i}">${s}</li>`)}</ol></aside>
  </div>`, 'stage-win');
}

function sqlStage() {
  const q = `SELECT c.name, c.city,
       SUM(o.amount) AS revenue
FROM customers AS c
INNER JOIN orders AS o
  ON o.customer_id = c.id
GROUP BY c.name, c.city
ORDER BY revenue DESC;`;
  return `<div class="sql">
  ${win('analytics.sql — SQL Editor', `<pre class="code code--type sql__code" data-sql-code>${codeLines(q, 'sql')}</pre>
    <div class="sql__run mono">${icon('play')}Run · <span data-sql-rows>3 rows</span> · 0.04 s</div>`, 'stage-win sql__editor')}
  <div class="sql__side stage-card">
    <div class="sql__top"><span class="try">${icon('mouse-pointer-click')}Try a join</span>
      <div class="seg" role="group" aria-label="Join type" data-join>${each(['INNER', 'LEFT', 'RIGHT', 'FULL'], (j, i) => `<button type="button" aria-pressed="${i === 0}" data-j="${j}">${j}</button>`)}</div></div>
    <svg class="venn j-inner" viewBox="0 0 300 150" data-venn aria-hidden="true">
      <defs><clipPath id="vA"><circle cx="115" cy="75" r="62"/></clipPath><mask id="vNotB"><rect width="300" height="150" fill="#fff"/><circle cx="185" cy="75" r="62" fill="#000"/></mask><mask id="vNotA"><rect width="300" height="150" fill="#fff"/><circle cx="115" cy="75" r="62" fill="#000"/></mask></defs>
      <circle class="venn__a" cx="115" cy="75" r="62" mask="url(#vNotB)"/><circle class="venn__b" cx="185" cy="75" r="62" mask="url(#vNotA)"/><circle class="venn__i" cx="185" cy="75" r="62" clip-path="url(#vA)"/>
      <circle class="venn__o" cx="115" cy="75" r="62"/><circle class="venn__o" cx="185" cy="75" r="62"/>
      <text x="78" y="79">customers</text><text x="222" y="79" text-anchor="middle">orders</text>
    </svg>
    <table class="sql__res" data-sql-res><thead><tr><th>name</th><th>city</th><th>revenue</th></tr></thead><tbody></tbody></table>
  </div>
</div>`;
}

const CATS = ['Laptops', 'Phones', 'Tablets', 'Monitors', 'Accessories'];
function biStage() {
  const dax = `Revenue YoY % =
VAR PY = CALCULATE ( [Revenue], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN DIVIDE ( [Revenue] - PY, PY )`;
  return `<div class="bi" data-bi>
  <div class="bi__frame stage-card">
    <aside class="bi__nav" aria-hidden="true"><i class="is-on">${icon('chart-column')}</i><i>${icon('table')}</i><i>${icon('network')}</i></aside>
    <div class="bi__canvas">
      <div class="bi__top"><div><p class="stage-label">Sales Performance · FY2025</p><b class="bi__title">Executive overview</b></div>
        <div class="bi__slicer" role="group" aria-label="Region slicer" data-slicer>${each(['All', 'North', 'South', 'East', 'West'], (r, i) => `<button type="button" aria-pressed="${i === 0}" data-r="${r}">${r}</button>`)}</div></div>
      <div class="bi__kpis">
        ${each([['Revenue', 'rev'], ['Orders', 'ord'], ['Avg. order', 'aov'], ['YoY growth', 'yoy']], ([l, k]) => `<div class="bi__kpi bi__tile"><span class="stage-label">${l}</span><b data-kpi="${k}">—</b><i class="bi__kpi-bar"><i data-kpibar="${k}"></i></i></div>`)}
      </div>
      <div class="bi__charts">
        <div class="bi__tile bi__bars"><p class="stage-label">Revenue by category</p><div class="bi__barlist">${each(CATS, (c) => `<div class="bi__barrow"><span>${c}</span><i><i data-bar="${c}"></i></i><b data-barv="${c}"></b></div>`)}</div></div>
        <div class="bi__tile bi__line"><p class="stage-label">Monthly revenue <span class="bi__legend"><i></i>FY25 <i class="is-py"></i>FY24</span></p>
          <svg viewBox="0 0 320 130" preserveAspectRatio="none"><path class="bi__grid" d="M0 32H320M0 65H320M0 98H320"/><path class="bi__py" data-line-py d=""/><path class="bi__cy" data-line-cy d=""/></svg></div>
        <div class="bi__tile bi__donut"><p class="stage-label">Channel mix</p>
          <svg viewBox="0 0 120 120"><circle class="bi__ring" cx="60" cy="60" r="44"/>${each(['on', 're', 'pa'], (k) => `<circle class="bi__arc bi__arc--${k}" data-arc="${k}" cx="60" cy="60" r="44" pathLength="100"/>`)}<text x="60" y="58" text-anchor="middle" class="bi__dv" data-donut-v>62%</text><text x="60" y="74" text-anchor="middle" class="bi__dl">online</text></svg>
          <ul class="bi__keys"><li><i class="k-on"></i>Online</li><li><i class="k-re"></i>Retail</li><li><i class="k-pa"></i>Partner</li></ul></div>
      </div>
      <div class="bi__rls" data-rls>${icon('lock')}Row-Level Security · viewing as <b>West Region Manager</b></div>
    </div>
  </div>
  <div class="bi__model stage-card" data-bi-model aria-hidden="true">
    <p class="stage-label">Model view · star schema</p>
    <svg viewBox="0 0 260 170"><g class="bi__rel"><path d="M130 85 L50 30"/><path d="M130 85 L210 30"/><path d="M130 85 L50 140"/><path d="M130 85 L210 140"/></g>
      ${each([[130, 85, 'Fact_Sales', 'is-fact'], [50, 30, 'Dim_Date', ''], [210, 30, 'Dim_Product', ''], [50, 140, 'Dim_Region', ''], [210, 140, 'Dim_Customer', '']], ([x, y, t, c]) => `<g class="bi__ent ${c}" transform="translate(${x} ${y})"><rect x="-44" y="-13" width="88" height="26" rx="7"/><text text-anchor="middle" y="4">${t}</text></g>`)}
      <text class="bi__card1" x="88" y="62">*</text><text class="bi__card1" x="64" y="46">1</text></svg>
  </div>
  <div class="bi__dax stage-card" data-bi-dax><p class="stage-label">DAX measure</p><pre class="code code--type" data-dax>${codeLines(dax, 'dax')}</pre></div>
</div>`;
}

function pyStage() {
  const cells = [
    { code: `import pandas as pd
import seaborn as sns
df = pd.read_csv("sales.csv", parse_dates=["date"])
df.shape`, out: `<pre class="nb__txt">(12480, 9)</pre>` },
    { code: `(df.groupby("region")["revenue"]
   .agg(["sum", "mean"])
   .sort_values("sum", ascending=False))`, out: `<table class="nb__df"><thead><tr><th>region</th><th>sum</th><th>mean</th></tr></thead><tbody><tr><td>West</td><td>1,482,300</td><td>412.6</td></tr><tr><td>South</td><td>1,190,450</td><td>398.1</td></tr><tr><td>East</td><td>1,064,120</td><td>371.9</td></tr><tr><td>North</td><td>881,770</td><td>352.4</td></tr></tbody></table>` },
    { code: `df["rev_7d"] = df["revenue"].rolling(7).mean()
sns.lineplot(data=df, x="date", y="rev_7d", hue="region")`, out: `<svg class="nb__plot" viewBox="0 0 300 110" preserveAspectRatio="none"><path d="M0 100H300M0 0V100" class="nb__axis"/>${each([['#3ee08f', 70], ['#3fd5e0', 58], ['#f5b544', 46], ['#a685ff', 34]], ([c, base], i) => `<path class="nb__l" style="stroke:${c}" d="${Array.from({ length: 16 }, (_, k) => `${k ? 'L' : 'M'}${(k * 20).toFixed(0)} ${(base - k * 1.6 + Math.sin(k * 0.9 + i) * 7).toFixed(1)}`).join(' ')}"/>`)}</svg>` },
    { code: `df["domain"] = df["email"].str.extract(r"@([\\w.]+)$")
df["domain"].value_counts().head(3)`, out: `<pre class="nb__txt">gmail.com      4212
outlook.com    2890
company.io     1104
Name: domain, dtype: int64</pre>` },
  ];
  return win('EDA_sales.ipynb — Jupyter', `<div class="nb" data-nb><div class="nb__scroll" data-nb-scroll>${each(cells, (c, i) => `<div class="nb__cell" data-cell="${i}">
      <div class="nb__in"><span class="nb__p mono" data-p>In [ ]:</span><pre class="code code--type">${codeLines(c.code, 'python')}</pre></div>
      <div class="nb__out"><span class="nb__p mono">${i === 2 ? '' : `Out[${i + 1}]:`}</span><div class="nb__o">${c.out}</div></div>
    </div>`)}</div></div>`, 'stage-win nb-win');
}

function statsStage() {
  return `<div class="st stage-card" data-st>
  <div class="st__head"><p class="stage-label" data-st-label>Distribution of daily orders</p><span class="try">${icon('mouse-pointer-click')}Drag the test statistic</span></div>
  <svg class="st__plot" viewBox="0 0 520 250" data-st-svg aria-hidden="true">
    <g class="st__bars" data-st-bars></g>
    <g class="st__bands" data-st-bands></g>
    <path class="st__tailL" data-tail-l d=""/><path class="st__tailR" data-tail-r d=""/>
    <path class="st__curve" data-st-curve d=""/>
    <line class="st__axis" x1="20" y1="220" x2="500" y2="220"/>
    <g class="st__ticks" data-st-ticks></g>
    <g class="st__z" data-st-z><line y1="30" y2="220"/><circle r="7" cy="30"/><text y="18" text-anchor="middle" data-z-label>z = 2.10</text></g>
  </svg>
  <div class="st__ctrl">
    <div class="ctrl"><div class="ctrl__top"><label for="st-z">Observed test statistic (z)</label><span class="ctrl__val" data-z-val>2.10</span></div><input id="st-z" class="range" type="range" min="-3.6" max="3.6" step="0.01" value="2.1" data-z></div>
    <div class="st__alpha"><span class="stage-label">Significance <span style="text-transform:none">α</span></span><div class="seg" role="group" aria-label="Significance level" data-alpha>${each(['0.10', '0.05', '0.01'], (a) => `<button type="button" aria-pressed="${a === '0.05'}" data-a="${a}">${a}</button>`)}</div></div>
    <div class="st__out"><span class="stage-label">two-tailed p-value</span><b class="mono" data-p-val>0.036</b><span class="st__verdict" data-verdict>Reject H₀</span></div>
  </div>
</div>`;
}

function aiStage() {
  const PROMPTS = {
    zero: 'Which region drove the Q3 revenue increase? Answer in 3 bullet points.',
    few: 'Example → Q: Top product in Q1? A: Laptops (+18%).\nQ: Which region drove the Q3 revenue increase?',
    cot: 'Which region drove the Q3 revenue increase? Think step by step: identify the metric, compare periods, then segment.',
    tpl: 'You are a {role}. Using {table}, explain {question} for {audience}. Format: {format}.',
  };
  return `<div class="ai stage-card" data-ai>
  <div class="ai__top"><span class="ai__brand">${icon('sparkles')}Ask your data</span>
    <div class="seg" role="group" aria-label="Prompting technique" data-ptech>${each([['zero', 'Zero-shot'], ['few', 'Few-shot'], ['cot', 'Chain-of-thought'], ['tpl', 'Template']], ([k, l], i) => `<button type="button" aria-pressed="${k === 'cot'}" data-k="${k}">${l}</button>`)}</div></div>
  <div class="ai__thread">
    <div class="ai__msg ai__msg--me" data-ai-step="0"><p data-prompt>${esc(PROMPTS.cot)}</p></div>
    <div class="ai__msg ai__msg--bot" data-ai-step="1">
      <ol class="ai__cot"><li>Metric: revenue, Q3 vs Q2</li><li>Compare by region</li><li>Segment by product</li></ol>
    </div>
    <div class="ai__msg ai__msg--bot ai__code" data-ai-step="2"><pre class="code">${codeLines(`SELECT region, SUM(revenue) AS q3
FROM sales WHERE quarter = 'Q3'
GROUP BY region ORDER BY q3 DESC;`, 'sql')}</pre></div>
    <div class="ai__msg ai__msg--bot" data-ai-step="3">
      <div class="ai__mini">${each([['West', 92], ['South', 64], ['East', 51], ['North', 38]], ([r, v]) => `<div><span>${r}</span><i style="--w:${v}%"></i></div>`)}</div>
      <p><b>West</b> contributed most of the Q3 lift, led by premium laptops. Review before sharing: figures are computed from the <span class="mono">sales</span> table.</p>
    </div>
  </div>
  <div class="ai__guards" data-ai-step="4"><span>${icon('shield-check')}Validated against source</span><span>${icon('users')}Human-in-the-loop</span><span>${icon('scan-eye')}Hallucination check</span></div>
  <script type="application/json" data-prompts>${JSON.stringify(PROMPTS)}</script>
</div>`;
}

function bigStage() {
  return `<div class="bd">
  <div class="bd__cluster stage-card" data-bd>
    <div class="bd__head"><p class="stage-label">Distributed processing</p><span class="mono bd__file" data-bd-file>${icon('database')}events.parquet · 1.2 TB</span></div>
    <div class="bd__blocks" data-bd-blocks>${each(Array.from({ length: 8 }), (_, i) => `<i data-blk="${i}">B${i + 1}</i>`)}</div>
    <div class="bd__nodes">${each(['worker-1', 'worker-2', 'worker-3', 'worker-4'], (n, i) => `<div class="bd__node" data-node="${i}"><span class="mono">${n}</span><div class="bd__slots">${each([0, 1, 2, 3], () => '<i></i>')}</div></div>`)}</div>
    <div class="bd__dag" data-bd-dag><span>read</span><i></i><span>filter</span><i></i><span>groupBy</span><i></i><span>agg</span><em class="mono">Spark DAG · in-memory</em></div>
  </div>
  <div class="bd__ml stage-card" data-ml>
    <div class="bd__head"><p class="stage-label" data-ml-label>Linear regression · OLS</p><span class="mono bd__r2" data-r2>R² = 0.00</span></div>
    <svg viewBox="0 0 300 170" class="ml__plot" aria-hidden="true">
      <path class="ml__axis" d="M20 150H290M20 10V150"/>
      <g data-ml-pts>${each([[40, 128], [62, 120], [80, 112], [96, 108], [118, 94], [134, 98], [150, 82], [172, 76], [188, 70], [206, 58], [228, 54], [246, 42], [266, 36]], ([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`)}</g>
      <g class="ml__res" data-ml-res>${each([[40, 128, 131], [62, 120, 122], [80, 112, 114], [96, 108, 107], [118, 94, 98], [134, 98, 91], [150, 82, 85], [172, 76, 76], [188, 70, 69], [206, 58, 62], [228, 54, 53], [246, 42, 45], [266, 36, 37]], ([x, y, f]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${f}"/>`)}</g>
      <line class="ml__fit" data-ml-fit x1="20" y1="140" x2="290" y2="140"/>
      <path class="ml__sig" data-ml-sig d="M20 145 C 120 145, 120 145, 155 80 S 190 15, 290 15"/>
    </svg>
  </div>
</div>`;
}

export function chapters(p) {
  const u = p.curriculum.units;
  const ey = (i, extra = '') => `${u[i].label} · ${u[i].meta.split(' · ')[0]}${extra}`;
  return [
    chapter({ id: 'excel', scene: 'da-excel', len: 300, eyebrow: ey(0), title: 'Every analysis starts in a grid.',
      lede: 'Excel architecture, functions and references — then text, date and conditional logic, multi-condition aggregation, dynamic arrays, advanced charts and fully interactive dashboards.',
      steps: ['Clean text with TRIM, PROPER &amp; SUBSTITUTE', 'Aggregate with SUMIFS &amp; COUNTIFS', 'Flag anomalies with conditional formatting', 'Spill results with SORT, UNIQUE &amp; FILTER', 'Visualise: charts, sparklines, dashboards'],
      topics: ['Relative vs absolute refs', 'IFS & nested IF', 'NETWORKDAYS', 'SUMPRODUCT', 'Pareto & waterfall', 'Gauge charts', 'Form controls'], stage: excelStage() }),
    chapter({ id: 'power-query', scene: 'da-pq', len: 240, flip: true, eyebrow: `${u[0].label} · Days 9–10`, title: 'Messy data in. Clean tables out.',
      lede: 'Power Query turns ETL into repeatable steps: import raw files, standardise text, numbers and dates, add index and conditional columns, merge on keys and append history into one master table.',
      steps: ['Promote headers &amp; set data types', 'Trim, clean and standardise text', 'Replace values and handle nulls', 'Merge &amp; append queries'], topics: ['Extract · Transform · Load', 'Index columns', 'Conditional columns', 'Primary/foreign keys'], stage: pqStage() }),
    chapter({ id: 'sql', scene: 'da-sql', len: 240, eyebrow: ey(1), title: 'Ask the database anything.',
      lede: 'From DDL and constraints to SELECT, WHERE and GROUP BY — then every join type, set operations, string and date functions, CASE logic, subqueries, CTEs and window functions.',
      steps: ['Write the query', 'Join related tables', 'Aggregate &amp; sort the result', 'Switch join types — see what changes'], topics: ['DDL · DML · DQL', 'UNION / EXCEPT / INTERSECT', 'DATEDIFF & CAST', 'Correlated subqueries', 'Recursive CTEs', 'LAG · LEAD · NTILE'], stage: sqlStage() }),
    chapter({ id: 'power-bi', scene: 'da-bi', len: 300, flip: true, eyebrow: ey(2), title: 'Dashboards that drive decisions.',
      lede: 'Connect sources, shape data with Power Query and M, model star schemas with the right cardinality, write DAX with CALCULATE and time intelligence, then publish secure, interactive reports.',
      steps: ['Model a star schema', 'Write DAX measures', 'Build interactive visuals', 'Publish with Row-Level Security'], topics: ['Slicers & KPI cards', 'SUMX · AVERAGEX', 'ALL · ALLEXCEPT', 'YTD · MTD', 'Drill-through', 'Python visuals'], stage: biStage() }),
    chapter({ id: 'python', scene: 'da-py', len: 280, eyebrow: ey(3), title: 'Automate the analysis with Python.',
      lede: 'Start from your very first line of code, then master collections, functions, OOP, file handling and regex — before NumPy, Pandas, Matplotlib, Seaborn and web-scraped exploratory analysis.',
      steps: ['Load data with Pandas', 'Group, pivot and summarise', 'Visualise trends with Seaborn', 'Extract patterns with regex'], topics: ['Lists, dicts & sets', 'Vectorisation', 'groupby & pivot', 'Rolling windows', 'MCAR / MAR / MNAR', 'Pair plots & heatmaps'], stage: pyStage() }),
    chapter({ id: 'statistics', scene: 'da-stats', len: 260, flip: true, eyebrow: ey(4), title: 'Separate signal from noise.',
      lede: 'Descriptive statistics, probability and Bayes, distributions and sampling, then hypothesis testing with z-tests, t-tests, chi-square, ANOVA and the Central Limit Theorem.',
      steps: ['Describe a distribution', 'Approximate it with the normal curve', 'Measure spread with σ', 'Test a hypothesis'], topics: ['Skewness & kurtosis', 'Bayes’ theorem', 'PDF & CDF', 'Confidence intervals', 'Type I / II errors', 'ANOVA & ANCOVA'], stage: statsStage() }),
    chapter({ id: 'genai', scene: 'da-ai', len: 240, eyebrow: ey(5), title: 'Your AI co-analyst.',
      lede: 'How GPT, LLaMA and Claude work; zero-, one- and few-shot prompting, chain-of-thought and reusable templates; knowledge assistants, no-code AI agents — and the guardrails that keep them honest.',
      steps: ['Prompt with the right technique', 'Let the model reason step by step', 'Generate SQL and charts', 'Validate with guardrails'], topics: ['Predictive vs generative AI', 'Pre-training vs fine-tuning', 'Prompt templates', 'Search augmentation', 'Bias & hallucinations', 'Human-in-the-loop'], stage: aiStage() }),
    chapter({ id: 'big-data-ml', scene: 'da-big', len: 260, flip: true, eyebrow: `${u[6].label} &amp; ${u[7].label} · Weeks 11–12`, title: 'Scale up. Look ahead.',
      lede: 'Hadoop’s fault-tolerant storage, Spark’s in-memory DAGs and distributed SQL, and Microsoft Fabric — then your first machine-learning models: linear, multiple, polynomial and logistic regression.',
      steps: ['Distribute data across a cluster', 'Process it in memory with Spark', 'Fit a regression line', 'Classify with a sigmoid'], topics: ['Volume · velocity · variety', 'Spark DataFrames', 'Microsoft Fabric', 'OLS', 'Adjusted R²', 'Bias–variance'], stage: bigStage() }),
  ].join('\n');
}
