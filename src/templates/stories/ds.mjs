/** Data Science with GenAI — immersive story: one dataset, six transformations. */
import { esc, each, icon, codeLines } from '../lib.mjs';
import { chapter, win } from '../chapter.mjs';
import { programViz } from '../viz.mjs';

export const three = true;

export function heroArt() {
  return `<div class="ds-hero" data-ds-hero>
  <div class="ds-hero__frame">
    <div class="ds-hero__canvas" data-ds-hero-canvas aria-hidden="true"></div>
    <div class="ds-hero__fallback" aria-hidden="true">${programViz('ds')}</div>
    <div class="ds-hero__hud mono" aria-hidden="true"><span></span><span data-ds-hero-state>state: raw data</span></div>
  </div>
  <div class="ds-hero__chip ds-hero__chip--1 mono">model.fit(X_train, y_train)</div>
  <div class="ds-hero__chip ds-hero__chip--2"><span class="stage-label">ROC-AUC</span><b>0.94</b></div>
  <div class="ds-hero__chip ds-hero__chip--3 mono">${icon('sparkles')}LLM · RAG · LangChain</div>
</div>`;
}

function journeyStage() {
  const caps = ['DataFrame', 'Distribution', 'Clusters', 'Neural network', 'Language model', 'Dashboard'];
  return `<div class="ds-morph stage-card" data-ds-morph>
  <div class="ds-morph__canvas" data-ds-morph-canvas aria-hidden="true"></div>
  <div class="ds-morph__fallback" aria-hidden="true">${programViz('ds')}</div>
  <div class="ds-morph__hud">
    <span class="mono ds-morph__m" data-ds-month>Month 01</span>
    <span class="ds-morph__cap" data-ds-cap>${caps[0]}</span>
  </div>
  <ol class="ds-morph__dots" aria-hidden="true">${each(caps, (_, i) => `<li data-ds-dot="${i}"></li>`)}</ol>
  <script type="application/json" data-ds-caps>${JSON.stringify(caps)}</script>
</div>`;
}

function scrapeStage() {
  const html = `<table class="products">
  <tr><td>Aurora Lamp</td><td>$49.00</td><td>4.6</td></tr>
  <tr><td>Nimbus Chair</td><td>$189.50</td><td>4.8</td></tr>
  <tr><td>Echo Speaker</td><td>$79.99</td><td>4.3</td></tr>
  <tr><td>Drift Mug</td><td>$14.25</td><td>4.9</td></tr>
</table>`;
  const py = `import pandas as pd
df = pd.read_html(url)[0]
df.columns = ["product", "price", "rating"]
df["price"] = (df["price"].str.replace("$", "")
                          .astype(float))
df.describe()`;
  const rows = [['Aurora Lamp', '49.00', '4.6'], ['Nimbus Chair', '189.50', '4.8'], ['Echo Speaker', '79.99', '4.3'], ['Drift Mug', '14.25', '4.9']];
  return `<div class="scr">
  ${win('shop.example/products — HTML', `<pre class="code scr__html" data-scr-html>${codeLines(html, 'plain')}</pre>`, 'stage-win scr__src')}
  <div class="scr__flow" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="scr__right">
    ${win('scrape.py', `<pre class="code code--type scr__py" data-scr-py>${codeLines(py, 'python')}</pre>`, 'stage-win')}
    <div class="scr__df stage-card" data-scr-df>
      <p class="stage-label">DataFrame · 4 × 3</p>
      <table><thead><tr><th></th><th>product</th><th>price</th><th>rating</th></tr></thead>
      <tbody>${each(rows, (r, i) => `<tr data-scr-row="${i}"><td>${i}</td><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`)}</tbody></table>
    </div>
  </div>
</div>`;
}

function cltStage() {
  return `<div class="clt stage-card" data-clt>
  <div class="clt__top">
    <div class="seg" role="group" aria-label="Population shape" data-clt-shape>${each([['uniform', 'Uniform'], ['skewed', 'Skewed'], ['bimodal', 'Bimodal']], ([k, l], i) => `<button type="button" aria-pressed="${i === 1}" data-shape="${k}">${l}</button>`)}</div>
    <span class="try">${icon('mouse-pointer-click')}Try it</span>
  </div>
  <div class="clt__plots">
    <div><p class="stage-label">Population</p><canvas class="clt__pop" width="460" height="150" data-clt-pop></canvas></div>
    <div><p class="stage-label">Distribution of sample means <span class="mono clt__n" data-clt-count>0 samples</span></p><canvas class="clt__means" width="460" height="190" data-clt-means></canvas></div>
  </div>
  <div class="clt__ctrl">
    <div class="ctrl"><div class="ctrl__top"><label for="clt-n">Sample size (n)</label><span class="ctrl__val" data-clt-nval>30</span></div><input id="clt-n" class="range" type="range" min="2" max="60" step="1" value="30" data-clt-n></div>
    <button type="button" class="btn btn--ghost btn--sm" data-clt-draw><span class="btn__label"><span>Draw 50 samples</span></span>${icon('plus')}</button>
    <button type="button" class="btn btn--glass btn--sm" data-clt-reset><span class="btn__label"><span>Reset</span></span>${icon('repeat')}</button>
  </div>
</div>`;
}

function kmeansStage() {
  return `<div class="km stage-card" data-km>
  <div class="km__top"><span class="try">${icon('mouse-pointer-click')}Click to add points</span>
    <div class="km__stats mono"><span>iter <b data-km-iter>0</b></span><span>inertia <b data-km-inertia>—</b></span></div></div>
  <canvas class="km__canvas" width="760" height="420" data-km-canvas aria-label="K-means clustering playground: click to add data points" role="img"></canvas>
  <div class="km__ctrl">
    <div class="ctrl"><div class="ctrl__top"><label for="km-k">Clusters (k)</label><span class="ctrl__val" data-km-kval>4</span></div><input id="km-k" class="range" type="range" min="2" max="6" step="1" value="4" data-km-k></div>
    <button type="button" class="btn btn--ghost btn--sm" data-km-step><span class="btn__label"><span>Step</span></span>${icon('chevron-right')}</button>
    <button type="button" class="btn btn--primary btn--sm" data-km-run><span class="btn__label"><span>Run</span></span>${icon('play')}</button>
    <button type="button" class="btn btn--glass btn--sm" data-km-new><span class="btn__label"><span>New data</span></span>${icon('repeat')}</button>
  </div>
</div>`;
}

const SEVEN = [
  '0000000000', '0111111110', '0111111110', '0000001110', '0000011100',
  '0000111000', '0001110000', '0001110000', '0011100000', '0000000000',
];
function cnnStage() {
  const px = SEVEN.join('').split('');
  return `<div class="cnn">
  <div class="cnn__conv stage-card" data-cnn>
    <div class="cnn__head"><p class="stage-label">Convolution · 3×3 edge kernel</p><span class="mono cnn__eq" data-cnn-eq>Σ (patch ⊙ kernel) = 0</span></div>
    <div class="cnn__row">
      <div class="cnn__img" data-cnn-img>${each(px, (v, i) => `<i class="${v === '1' ? 'on' : ''}" data-px="${i}"></i>`)}<span class="cnn__win" data-cnn-win></span></div>
      <div class="cnn__kernel" aria-hidden="true">${each([-1, -1, -1, -1, 8, -1, -1, -1, -1], (k) => `<i>${k}</i>`)}</div>
      <div class="cnn__map" data-cnn-map>${each(Array.from({ length: 64 }), (_, i) => `<i data-fm="${i}"></i>`)}</div>
    </div>
    <ol class="cnn__arch mono" data-cnn-arch>${each(['LeNet-5', 'AlexNet', 'VGG16', 'Inception', 'ResNet', 'MobileNet', 'EfficientNet'], (a) => `<li>${a}</li>`)}</ol>
  </div>
  <div class="cnn__det stage-card" data-det>
    <div class="cnn__head"><p class="stage-label">YOLO · real-time detection</p><span class="mono cnn__fps">${icon('video')}live · 42 fps</span></div>
    <svg viewBox="0 0 360 200" class="det__scene" aria-hidden="true">
      <rect x="0" y="150" width="360" height="50" class="det__ground"/>
      <path d="M30 150 L80 60 L130 150 Z" class="det__crane"/><rect x="250" y="70" width="80" height="80" class="det__bldg"/>
      ${each([[90, 'helmet'], [180, 'nohelmet'], [270, 'helmet']], ([x, kind], i) => `<g transform="translate(${x} 0)" class="det__p">
        <circle cx="0" cy="92" r="11" class="det__head"/>${kind === 'helmet' ? '<path d="M-13 90 A13 13 0 0 1 13 90 Z" class="det__helmet"/>' : ''}
        <rect x="-12" y="104" width="24" height="34" rx="6" class="det__body"/><rect x="-11" y="138" width="9" height="14" class="det__leg"/><rect x="2" y="138" width="9" height="14" class="det__leg"/></g>`)}
      ${each([[72, 74, 'helmet 0.97', 'ok'], [162, 76, 'no-helmet 0.91', 'bad'], [252, 74, 'helmet 0.95', 'ok']], ([x, y, l, k], i) => `<g class="det__box det__box--${k}" data-box="${i}"><rect x="${x}" y="${y}" width="36" height="82" rx="3"/><rect x="${x}" y="${y - 16}" width="${l.length * 6.2 + 8}" height="15" rx="3" class="det__tag"/><text x="${x + 4}" y="${y - 5}">${l}</text></g>`)}
    </svg>
  </div>
</div>`;
}

const EMB = [['king', 66, 26], ['queen', 80, 50], ['man', 24, 36], ['woman', 38, 60], ['Paris', 70, 78], ['France', 88, 86], ['Rome', 20, 80], ['Italy', 36, 92]];
function nlpStage() {
  const toks = ['The', 'model', 'answered', 'because', 'it', 'read', 'the', 'docs'];
  return `<div class="nlp">
  <div class="nlp__tok stage-card" data-nlp-tok>
    <p class="stage-label">Tokenise · lemmatise · embed</p>
    <div class="nlp__chips">${each(toks, (t, i) => `<span data-tok="${i}">${t}</span>`)}</div>
    <svg class="nlp__emb" viewBox="0 0 110 110" aria-hidden="true"><path class="nlp__ax" d="M8 102H104M8 102V6"/>
      ${each(EMB, ([w, x, y]) => `<g class="nlp__pt" data-emb><circle cx="${x}" cy="${110 - y}" r="2.6"/><text x="${x + 4}" y="${110 - y + 1.5}">${w}</text></g>`)}
      <path class="nlp__vec" d="M24 74 L66 84" data-vec/><path class="nlp__vec" d="M38 50 L80 60" data-vec/>
    </svg>
  </div>
  <div class="nlp__att stage-card" data-nlp-att>
    <p class="stage-label">Self-attention · head 3</p>
    <div class="nlp__grid" style="--n:${toks.length}">${each(toks, (t) => `<span class="nlp__lab">${t}</span>`)}${each(toks, (r, i) => each(toks, (c, j) => `<i data-att style="--a:${att(i, j, toks.length).toFixed(2)}"></i>`))}</div>
  </div>
  <div class="nlp__chat stage-card" data-nlp-chat>
    <div class="nlp__q">${icon('messages-square')}<span>What does the refund policy say about digital goods?</span></div>
    <p class="nlp__a" data-nlp-a>Digital goods can be refunded within 14 days if they have not been downloaded <sup>[1]</sup>. Subscriptions are pro-rated <sup>[2]</sup>.</p>
    <div class="nlp__src mono"><span>[1] policy.pdf · p.3</span><span>[2] billing-faq.md</span><span>${icon('database')}LangChain · RAG</span></div>
  </div>
</div>`;
}
function att(i, j, n) { if (i === 4 && j === 1) return 0.95; if (i === 4) return 0.08; if (i === j) return 0.55; if (Math.abs(i - j) === 1) return 0.3; return 0.06 + ((i * 7 + j * 3) % 5) * 0.02; }

function capStage() {
  const nodes = [['SQL', 'database', 'Extract'], ['Pandas', 'table', 'Clean'], ['Model', 'brain-circuit', 'Predict'], ['Power BI', 'chart-column', 'Visualise'], ['GenAI', 'sparkles', 'Summarise']];
  return `<div class="cap stage-card" data-cap>
  <div class="cap__pipe">${each(nodes, ([n, ic, v], i) => `<div class="cap__node" data-cap-node="${i}"><span class="cap__ic">${icon(ic)}</span><b>${n}</b><small class="mono">${v}</small></div>${i < nodes.length - 1 ? `<i class="cap__link" data-cap-link="${i}"><span></span></i>` : ''}`)}</div>
  <div class="cap__out">
    <div class="cap__dash" data-cap-dash>
      <div class="cap__kpi"><span class="stage-label">Churn risk</span><b>18.4%</b><em>▼ 3.1 pts</em></div>
      <div class="cap__kpi"><span class="stage-label">At-risk revenue</span><b>1.2M</b><em class="is-bad">▲ 6%</em></div>
      <div class="cap__bars">${each([72, 54, 88, 40, 66, 92, 58], (h) => `<i style="--h:${h}%"></i>`)}</div>
    </div>
    <div class="cap__sum" data-cap-sum><p class="stage-label">${icon('sparkles')}GenAI executive summary</p><p data-cap-text>Churn risk fell 3.1 points after the loyalty launch. The model flags 412 high-value accounts in the West region; prioritise outreach to annual-plan customers in the next 30 days.</p></div>
  </div>
</div>`;
}

export function chapters(p) {
  const u = p.curriculum.units;
  const m = (i) => `${u[i].label} · ${u[i].meta.split(' · ')[0]}`;
  const short = (i) => u[i].title.replace(/ &amp; /g, ' & ').replace(/\s*\(.*?\)/g, '');
  return [
    chapter({ id: 'journey', scene: 'ds-journey', len: 420, eyebrow: '24 weeks · 120 sessions', title: 'One lifecycle. Six transformations.',
      lede: 'Watch the same data move through every stage of the craft — from a raw table to statistics, models, neural networks, language and finally the dashboard that drives the decision.',
      steps: u.map((x, i) => `<b class="mono">M${i + 1}</b> ${esc(short(i))}`), stage: journeyStage() }),
    chapter({ id: 'scrape', scene: 'ds-scrape', len: 240, flip: true, eyebrow: m(0), title: 'From raw HTML to a clean DataFrame.',
      lede: 'Programming fundamentals, data structures, functions, OOP and regex — then NumPy, Pandas and web scraping to acquire, clean and engineer real-world data.',
      steps: ['Fetch unstructured web data', 'Parse it into a DataFrame', 'Clean types and strings', 'Describe and explore'], topics: ['f-strings', 'Comprehensions', 'map · filter · reduce', '@classmethod', 'Regex', 'Broadcasting', 'MCAR / MAR / MNAR', 'Data leakage'], stage: scrapeStage() }),
    chapter({ id: 'clt', scene: 'ds-clt', len: 260, eyebrow: m(1), title: 'See the Central Limit Theorem happen.',
      lede: 'Visualisation with Matplotlib and Seaborn, EDA, descriptive statistics, probability, distributions and sampling — then inference: confidence intervals, p-values, z- and t-tests, A/B tests, chi-square and ANOVA.',
      steps: ['Pick any population shape', 'Draw random samples', 'Plot the sample means', 'A bell curve emerges'], topics: ['Box & violin plots', 'Bayes theorem', 'PMF vs PDF', 'Poisson', 'Shapiro-Wilk', 'A/B testing', 'Regularisation'], stage: cltStage() }),
    chapter({ id: 'kmeans', scene: 'ds-kmeans', len: 260, flip: true, eyebrow: m(2), title: 'Teach machines to find patterns.',
      lede: 'Regression and classification metrics, logistic regression, Naive Bayes, KNN, SVMs with kernels, trees, random forests and boosting — then PCA, t-SNE, K-Means, hierarchical clustering and DBSCAN.',
      steps: ['Initialise k centroids', 'Assign each point', 'Move centroids to the mean', 'Converge and evaluate'], topics: ['ROC-AUC', 'Kernel trick', 'Gini & entropy', 'XGBoost', 'PCA', 'Silhouette score', 'Isolation Forest'], stage: kmeansStage() }),
    chapter({ id: 'vision', scene: 'ds-cnn', len: 280, eyebrow: m(3), title: 'Give your models eyes.',
      lede: 'Perceptrons, backpropagation, activations, optimisers and regularisation in TensorFlow and Keras; OpenCV; CNNs from LeNet to EfficientNet; transfer learning, R-CNN and real-time YOLO detection.',
      steps: ['Turn pixels into tensors', 'Convolve with learned kernels', 'Go deeper with modern architectures', 'Detect objects in real time'], topics: ['Backpropagation', 'ReLU variants', 'Adam & NADAM', 'Batch norm', 'Transfer learning', 'YOLO v8', 'Helmet detection'], stage: cnnStage() }),
    chapter({ id: 'nlp-genai', scene: 'ds-nlp', len: 280, flip: true, eyebrow: m(4), title: 'Language, meaning and generation.',
      lede: 'NLTK and spaCy pipelines, TF-IDF, Word2Vec, RNNs, LSTMs, attention, Transformers and BERT — then prompt engineering, OpenAI, DALL·E, Gemini, LLaMA and LangChain RAG apps shipped with Streamlit.',
      steps: ['Tokenise and clean text', 'Embed words as vectors', 'Attend to context', 'Generate grounded answers'], topics: ['Stemming vs lemmatisation', 'Skip-gram & CBOW', 'NER & POS', 'Autoencoders', 'Fine-tuning BERT', 'Gemini API', 'Responsible AI'], stage: nlpStage() }),
    chapter({ id: 'capstone', scene: 'ds-cap', len: 240, eyebrow: m(5), title: 'Connect all six months.',
      lede: 'SQL end to end — DDL, joins, subqueries, CTEs, window functions, views and procedures — then Power Query, data modelling and DAX in Power BI, culminating in an end-to-end business analytics system.',
      steps: ['Extract with SQL', 'Clean with Pandas', 'Predict with ML', 'Serve in Power BI with a GenAI summary'], topics: ['Window functions', 'Stored procedures', 'Star schema', 'CALCULATE', 'Row-Level Security', 'Capstone'], stage: capStage() }),
  ].join('\n');
}
