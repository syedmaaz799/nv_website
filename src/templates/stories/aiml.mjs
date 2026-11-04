/** Applied AI & Machine Learning — immersive story: engineer intelligence end to end. */
import { esc, each, icon, codeLines } from '../lib.mjs';
import { chapter, win } from '../chapter.mjs';
import { programViz } from '../viz.mjs';

export const three = true;

export function heroArt() {
  return `<div class="ml-hero" data-ml-hero>
  <div class="ml-hero__frame">
    <div class="ml-hero__canvas" data-ml-net aria-hidden="true" data-cursor="Fire"></div>
    <div class="ml-hero__fallback" aria-hidden="true">${programViz('aiml')}</div>
    <div class="ml-hero__hud mono" aria-hidden="true"><span>input</span><span>hidden × 3</span><span>output</span></div>
    <p class="ml-hero__tip mono">${icon('mouse-pointer-click')}Click to fire a forward pass</p>
  </div>
  <div class="ml-chip ml-chip--1 mono">softmax(QK<sup>T</sup>/√d<sub>k</sub>)V</div>
  <div class="ml-chip ml-chip--2 mono">LoRA · r = 8</div>
  <div class="ml-chip ml-chip--3 mono"><span class="t-kw">POST</span> /predict · 200 OK</div>
</div>`;
}

function pythonStage() {
  const code = `from pydantic import BaseModel
from functools import wraps
import asyncio, time

def timed(fn):
    @wraps(fn)
    async def inner(*args, **kwargs):
        t0 = time.perf_counter()
        out = await fn(*args, **kwargs)
        print(f"{fn.__name__}: {time.perf_counter()-t0:.2f}s")
        return out
    return inner

class Page(BaseModel):
    url: str
    status: int

@timed
async def crawl(urls: list[str]) -> list[Page]:
    return await asyncio.gather(*(fetch(u) for u in urls))`;
  const lane = (cls, label, sub, tracks) => `<div class="cc__lane cc__lane--${cls}"><div class="cc__l"><b>${label}</b><small class="mono">${sub}</small></div><div class="cc__tracks">${tracks}</div></div>`;
  const blocks = (n, w, off = 0) => each(Array.from({ length: n }), (_, i) => `<i class="cc__b" style="--x:${off + i * (w + 4)}%;--w:${w}%"></i>`);
  return `<div class="py3">
  ${win('crawler.py', `<pre class="code code--type py3__code" data-py3-code>${codeLines(code, 'python')}</pre>`, 'stage-win py3__win')}
  <div class="cc stage-card" data-cc>
    <p class="stage-label">Same 4 jobs, three concurrency models</p>
    ${lane('thr', 'Threading', 'ThreadPoolExecutor · I/O', `<div class="cc__track">${blocks(4, 21)}<span class="cc__gil mono">GIL</span></div>`)}
    ${lane('mp', 'Multiprocessing', 'ProcessPoolExecutor · CPU', each([0, 1, 2, 3], () => `<div class="cc__track cc__track--thin"><i class="cc__b" style="--x:0%;--w:88%"></i></div>`))}
    ${lane('aio', 'asyncio', 'event loop · await', `<div class="cc__track">${each([0, 1, 2, 3, 4, 5, 6, 7], (i) => `<i class="cc__b cc__b--s" style="--x:${i * 12}%;--w:9%"></i>`)}</div>`)}
    <div class="cc__tests mono" data-cc-tests>${icon('circle-check')}<span>pytest · <b data-tests>0</b> passed</span><span class="cc__dots">${each(Array.from({ length: 24 }), () => '<i></i>')}</span></div>
  </div>
</div>`;
}

function bvStage() {
  return `<div class="bv stage-card" data-bv>
  <div class="bv__top"><div><p class="stage-label">Polynomial regression on noisy data</p><b class="bv__fit" data-bv-fit>Underfit</b></div>
    <div class="bv__errs mono"><span>train MSE <b data-bv-train>—</b></span><span>test MSE <b data-bv-test>—</b></span></div></div>
  <svg class="bv__plot" viewBox="0 0 520 260" data-bv-svg aria-hidden="true">
    <path class="bv__axis" d="M30 230H505M30 15V230"/><path class="bv__true" data-bv-true d=""/><g data-bv-train-pts></g><g data-bv-test-pts></g><path class="bv__curve" data-bv-curve d=""/>
  </svg>
  <div class="bv__ctrl">
    <div class="ctrl"><div class="ctrl__top"><label for="bv-d">Model complexity · polynomial degree</label><span class="ctrl__val" data-bv-dval>1</span></div><input id="bv-d" class="range" type="range" min="1" max="14" step="1" value="1" data-bv-d></div>
    <div class="bv__legend mono"><span><i class="is-train"></i>train</span><span><i class="is-test"></i>test</span><span><i class="is-true"></i>true function</span></div>
  </div>
</div>`;
}

function landscapeStage() {
  return `<div class="ls stage-card" data-ls>
  <div class="ls__canvas" data-ls-canvas aria-hidden="true"></div>
  <div class="ls__fallback" aria-hidden="true">${programViz('aiml')}</div>
  <div class="ls__hud"><p class="stage-label">Loss landscape · non-convex</p><b class="mono ls__step">step <span data-ls-step>0</span> / 240</b></div>
  <ul class="ls__legend mono">
    <li><i style="background:#5fe1e8"></i>SGD<b data-ls-loss="sgd">—</b></li>
    <li><i style="background:#f5b544"></i>Adam<b data-ls-loss="adam">—</b></li>
    <li><i style="background:#f472d0"></i>SGD + momentum<b data-ls-loss="momentum">—</b></li>
  </ul>
  <p class="ls__note mono" data-ls-note>Same start. Different optimisers.</p>
</div>`;
}

function convStage() {
  const nets = [['LeNet-5', '1998', 'Pioneering CNN for digits'], ['AlexNet', '2012', 'Deep CNNs win ImageNet'], ['VGG16', '2014', 'Depth with 3×3 kernels'], ['Inception', '2014', 'Parallel multi-scale filters'], ['ResNet', '2015', 'Skip connections: F(x) + x'], ['MobileNet', '2017', 'Depthwise separable convs'], ['EfficientNet', '2019', 'Compound scaling'], ['ViT', '2020', '16×16 patches as tokens']];
  return `<div class="cv stage-card" data-cv>
  <div class="cv__calc">
    <div class="cv__grid-wrap"><div class="cv__grid" data-cv-grid></div><p class="mono cv__out" data-cv-out>output: 28 × 28</p></div>
    <div class="cv__ctrls">
      <p class="cv__formula mono">⌊(W − K + 2P) / S⌋ + 1 = <b data-cv-res>28</b></p>
      ${each([['W', 'Input size W', 5, 32, 12], ['K', 'Kernel K', 1, 7, 3], ['P', 'Padding P', 0, 3, 1], ['S', 'Stride S', 1, 3, 1]], ([k, l, a, b, v]) => `<div class="ctrl"><div class="ctrl__top"><label for="cv-${k}">${l}</label><span class="ctrl__val" data-cv-v="${k}">${v}</span></div><input id="cv-${k}" class="range" type="range" min="${a}" max="${b}" step="${k === 'K' ? 2 : 1}" value="${v}" data-cv="${k}"></div>`)}
    </div>
  </div>
  <ol class="cv__nets" data-cv-nets>${each(nets, ([n, y, d]) => `<li><span class="mono">${y}</span><b>${n}</b><small>${d}</small></li>`)}</ol>
</div>`;
}

const TOKS = ['The', 'robot', 'picked', 'up', 'the', 'ball', 'because', 'it', 'was', 'light'];
function attStage() {
  return `<div class="at stage-card" data-at>
  <div class="at__top"><span class="try">${icon('mouse-pointer-click')}Hover or tap a word</span>
    <div class="seg" role="group" aria-label="Attention head" data-at-heads>${each([['coref', 'Head 1 · coreference'], ['syntax', 'Head 2 · syntax'], ['local', 'Head 3 · position']], ([k, l], i) => `<button type="button" aria-pressed="${i === 0}" data-head="${k}">${l}</button>`)}</div></div>
  <div class="at__viz">
    <svg class="at__arcs" data-at-arcs viewBox="0 0 1000 170" preserveAspectRatio="none" aria-hidden="true"></svg>
    <div class="at__toks" data-at-toks>${each(TOKS, (t, i) => `<button type="button" class="at__tok" data-tok="${i}">${t}</button>`)}</div>
  </div>
  <div class="at__bottom">
    <p class="at__formula mono">Attention(<b class="q">Q</b>, <b class="k">K</b>, <b class="v">V</b>) = softmax(<b class="q">Q</b><b class="k">K</b><sup>T</sup> / √d<sub>k</sub>) <b class="v">V</b></p>
    <div class="at__mask" aria-hidden="true"><p class="stage-label">Causal mask</p><div class="at__mgrid">${each(Array.from({ length: 36 }), (_, i) => `<i class="${i % 6 <= Math.floor(i / 6) ? 'on' : ''}"></i>`)}</div></div>
  </div>
  <script type="application/json" data-at-toks-json>${JSON.stringify(TOKS)}</script>
</div>`;
}

function decStage() {
  return `<div class="dec stage-card" data-dec>
  <p class="dec__prompt mono">The future of AI is<span class="dec__gen" data-dec-gen></span><span class="caret"></span></p>
  <div class="dec__bars" data-dec-bars></div>
  <div class="dec__ctrl">
    ${each([['T', 'Temperature', 0.1, 2, 0.05, 0.7], ['K', 'Top-k', 1, 8, 1, 8], ['P', 'Top-p (nucleus)', 0.1, 1, 0.05, 1]], ([k, l, a, b, st, v]) => `<div class="ctrl"><div class="ctrl__top"><label for="dec-${k}">${l}</label><span class="ctrl__val" data-dec-v="${k}">${v}</span></div><input id="dec-${k}" class="range" type="range" min="${a}" max="${b}" step="${st}" value="${v}" data-dec="${k}"></div>`)}
  </div>
  <div class="dec__actions"><span class="mono dec__h">entropy <b data-dec-h>—</b> bits</span>
    <button type="button" class="btn btn--ghost btn--sm" data-dec-greedy><span class="btn__label"><span>Greedy</span></span></button>
    <button type="button" class="btn btn--primary btn--sm" data-dec-sample><span class="btn__label"><span>Sample next token</span></span>${icon('sparkles')}</button>
    <button type="button" class="btn btn--glass btn--sm" data-dec-reset aria-label="Reset generated text">${icon('repeat')}</button></div>
</div>`;
}

function ragStage() {
  const row1 = [['file-text', 'Documents', 'PDF · HTML · MD'], ['blocks', 'Semantic chunks', 'cosine shifts'], ['atom', 'Embeddings', '1536-d'], ['database', 'Vector DB', 'HNSW index']];
  const row2 = [['search', 'Query + HyDE', 'expand'], ['filter', 'Hybrid search', 'BM25 + dense'], ['layers', 'RRF fusion', 'top-100'], ['list-checks', 'Cross-encoder', 'rerank top-10'], ['sparkles', 'LLM answer', 'cited [1][2]']];
  const node = ([ic, t, s], i, r) => `<div class="rg__n" data-rg="${r}-${i}"><span>${icon(ic)}</span><b>${t}</b><small class="mono">${s}</small></div>`;
  return `<div class="rg stage-card" data-rg-root>
  <p class="stage-label">Ingestion</p>
  <div class="rg__row">${row1.map((n, i) => node(n, i, 1) + (i < row1.length - 1 ? '<i class="rg__a"></i>' : '')).join('')}</div>
  <p class="stage-label">Retrieval &amp; generation</p>
  <div class="rg__row">${row2.map((n, i) => node(n, i, 2) + (i < row2.length - 1 ? '<i class="rg__a"></i>' : '')).join('')}</div>
  <div class="rg__agents" data-rg-agents>
    <p class="stage-label">Agentic layer · LangGraph</p>
    <div class="rg__graph">
      ${each([['Planner', 'route'], ['Researcher', 'search'], ['Tools · MCP', 'plug'], ['Critic · CRAG', 'scan-eye'], ['Writer', 'file-code']], ([t, ic], i) => `<span class="rg__ag" data-ag="${i}">${icon(ic)}${t}</span>${i < 4 ? '<i class="rg__ga"></i>' : ''}`)}
      <span class="rg__hitl mono">${icon('users')}HITL approval</span>
    </div>
  </div>
</div>`;
}

function loraStage() {
  return `<div class="lo stage-card" data-lo>
  <p class="lo__eq mono">W′ = W + <b class="lo__b">B</b><b class="lo__a">A</b>  ·  W ∈ ℝ<sup>d×d</sup> frozen · B ∈ ℝ<sup>d×r</sup> · A ∈ ℝ<sup>r×d</sup></p>
  <div class="lo__viz" aria-hidden="true">
    <div class="lo__W">${icon('lock')}<span class="mono">W · frozen</span></div>
    <span class="lo__plus">+</span>
    <div class="lo__B" data-lo-b><span class="mono">B</span></div>
    <span class="lo__x">×</span>
    <div class="lo__A" data-lo-a><span class="mono">A</span></div>
  </div>
  <div class="lo__ctrl">
    <div class="ctrl"><div class="ctrl__top"><label for="lo-r">LoRA rank (r) · layer d = 4096</label><span class="ctrl__val" data-lo-rv>8</span></div><input id="lo-r" class="range" type="range" min="1" max="64" step="1" value="8" data-lo-r></div>
    <div class="lo__nums mono"><span>trainable <b data-lo-train>65,536</b></span><span>full <b>16,777,216</b></span><span>share <b data-lo-pct>0.39%</b></span></div>
  </div>
  <div class="lo__q">
    <div class="seg" role="group" aria-label="Weight precision" data-lo-prec><button type="button" aria-pressed="true" data-prec="16">FP16</button><button type="button" aria-pressed="false" data-prec="4">QLoRA · 4-bit</button></div>
    <p class="mono">7B weights ≈ <b data-lo-mem>14.0 GB</b> <small>(weights only)</small></p>
  </div>
  <div class="lo__align mono"><span>RLHF: SFT → reward model → PPO</span><span>DPO: preference pairs → direct loss</span></div>
</div>`;
}

function opsStage() {
  const sh = `$ git commit -m "train: xgboost v3"
$ dvc push
$ mlflow ui --port 5000
$ docker build -t churn-api .
$ docker run -p 8000:8000 churn-api
$ curl -X POST localhost:8000/predict -d '{"tenure": 14}'
{"prediction": 0.83, "label": "churn"}`;
  return `<div class="ops">
  ${win('zsh — mlops', `<pre class="code code--type ops__sh" data-ops-sh>${codeLines(sh, 'bash')}</pre>`, 'stage-win ops__term')}
  <div class="ops__side">
    <div class="ops__pipe stage-card" data-ops-pipe>${each([['git-branch', 'Git'], ['database', 'DVC'], ['chart-line', 'MLflow'], ['server', 'FastAPI'], ['blocks', 'Docker'], ['cloud', 'Cloud']], ([ic, t], i) => `<span data-op="${i}">${icon(ic)}<b>${t}</b></span>`)}</div>
    <div class="ops__bigo stage-card" data-bigo><p class="stage-label">Big-O · interview prep</p>
      <svg viewBox="0 0 240 130" aria-hidden="true"><path class="bo__ax" d="M20 115H232M20 8V115"/>
        <path class="bo__c" style="--c:#3ee08f" d="M20 110 L232 110"/>
        <path class="bo__c" style="--c:#5fe1e8" d="M20 110 C 60 90, 120 86, 232 82"/>
        <path class="bo__c" style="--c:#f5b544" d="M20 110 L232 40"/>
        <path class="bo__c" style="--c:#f472d0" d="M20 110 C 90 90, 160 50, 232 14"/>
        <path class="bo__c" style="--c:#ff7a8a" d="M20 110 C 90 106, 130 60, 160 8"/>
      </svg>
      <ul class="bo__keys mono"><li style="--c:#3ee08f">O(1)</li><li style="--c:#5fe1e8">O(log n)</li><li style="--c:#f5b544">O(n)</li><li style="--c:#f472d0">O(n log n)</li><li style="--c:#ff7a8a">O(n²)</li></ul>
    </div>
  </div>
</div>`;
}

export function chapters(p) {
  const u = p.curriculum.units;
  const m = (i, extra) => `${u[i].label} · ${extra || u[i].meta}`;
  return [
    chapter({ id: 'python', scene: 'aiml-python', len: 260, eyebrow: m(0, 'Days 1–15'), title: 'Python, written like an engineer.',
      lede: 'Beyond syntax: comprehensions, decorators, generators, CPython internals and the GIL, threading vs multiprocessing vs asyncio, type hints, Pydantic, packaging, pytest, logging and an end-to-end extraction pipeline.',
      steps: ['Write typed, decorated code', 'Validate data with Pydantic', 'Choose the right concurrency model', 'Prove it works with pytest'], topics: ['LEGB scope', '*args / **kwargs', 'yield', 'tracemalloc', 'Semaphores', 'mypy', 'Selenium', 'pdb'], stage: pythonStage() }),
    chapter({ id: 'bias-variance', scene: 'aiml-bv', len: 240, flip: true, eyebrow: m(1), title: 'The bias–variance trade-off, felt.',
      lede: 'CLT, hypothesis testing and correlation; feature engineering, scaling, SMOTE and leakage-safe validation — then regression, classification metrics, Naive Bayes, KNN, SVMs, trees, ensembles, boosting, clustering, PCA, t-SNE, UMAP and anomaly detection.',
      steps: ['Underfit: too simple', 'A good fit generalises', 'Overfit: memorising noise', 'Regularise and cross-validate'], topics: ['MSE = Bias² + Var + Noise', 'k-Fold & nested CV', 'XGBoost · LightGBM · CatBoost', 'GMM & DBSCAN', 'UMAP', 'Isolation Forest'], stage: bvStage() }),
    chapter({ id: 'optimisers', scene: 'aiml-ls', len: 280, eyebrow: m(2, 'Days 41–49'), title: 'Gradient descent, in three dimensions.',
      lede: 'Time series, Optuna, SHAP and LIME — then TensorFlow from tensors and GradientTape to backpropagation through computation graphs, activations, losses, optimisers and custom training loops.',
      steps: ['Initialise on a non-convex surface', 'Follow the gradient', 'Momentum carries through ridges', 'Compare where each optimiser lands'], topics: ['@tf.function', 'GradientTape', 'Vanishing gradients', 'GELU', 'AdamW', 'BatchNorm', 'Custom loops'], stage: landscapeStage() }),
    chapter({ id: 'vision', scene: 'aiml-cv', len: 240, flip: true, eyebrow: m(2, 'Days 50–60'), title: 'Computer vision, from kernels to transformers.',
      lede: 'Image tensors and tf.data pipelines, convolutions, pooling and receptive fields, VGG, Inception, ResNet, MobileNet and EfficientNet, R-CNN and YOLO detection, U-Net and Mask R-CNN segmentation, Albumentations, Mixup, CutMix and Vision Transformers.',
      steps: ['Compute every output shape', 'Stack deeper architectures', 'Detect and segment objects', 'Replace convolutions with attention'], topics: ['Receptive field', '1×1 convolutions', 'Quantisation', 'IoU & mAP', 'NMS', 'Dice loss', 'Focal loss'], stage: convStage() }),
    chapter({ id: 'attention', scene: 'aiml-at', len: 240, eyebrow: m(3), title: 'Attention is the whole idea.',
      lede: 'Text normalisation, spaCy, subword tokenisers, TF-IDF and word embeddings; n-gram LMs, RNNs, LSTMs and GRUs; Seq2Seq and its bottleneck; then attention, QKV, multi-head attention, positional encodings, causal masks, BERT — and a Transformer built from scratch.',
      steps: ['Tokens become queries, keys and values', 'Scores weigh every other token', 'Multiple heads learn different patterns', 'Causal masks block the future'], topics: ['BPE & WordPiece', 'Word2Vec & GloVe', 'BPTT', 'Teacher forcing', 'BLEU & ROUGE', 'RoPE', '[CLS] token'], stage: attStage() }),
    chapter({ id: 'decoding', scene: 'aiml-dec', len: 220, flip: true, eyebrow: m(3, 'Days 76–80'), title: 'How a model chooses its next word.',
      lede: 'GPT-style decoders, scaling laws, emergent abilities and the KV cache; greedy, beam and stochastic decoding; advanced prompting, chain- and tree-of-thought, self-consistency, ReAct agents, embeddings and vector databases.',
      steps: ['Logits become probabilities', 'Temperature reshapes the distribution', 'Top-k and top-p prune the tail', 'Sample — or decode greedily'], topics: ['KV cache', 'Beam search', 'Frequency penalty', 'JSON outputs', 'ReAct loop', 'HNSW'], stage: decStage() }),
    chapter({ id: 'rag-agents', scene: 'aiml-rag', len: 260, eyebrow: m(4, 'Days 81–90'), title: 'Retrieval that holds up in production.',
      lede: 'Semantic chunking, HyDE and query expansion, hybrid search with reciprocal rank fusion, cross-encoder reranking, GraphRAG with Neo4j, LangChain and LlamaIndex, CRAG and Self-RAG, MCP tool calling, LangGraph, RAGAS evaluation and LangSmith tracing.',
      steps: ['Ingest and embed documents', 'Retrieve with hybrid search', 'Rerank and generate with citations', 'Orchestrate agents with human approval'], topics: ['Metadata filtering', 'Self-querying', 'Cypher', 'ConversationBufferMemory', 'n8n & Flowise', 'Celery + Redis', 'TTFT'], stage: ragStage() }),
    chapter({ id: 'fine-tuning', scene: 'aiml-lora', len: 220, flip: true, eyebrow: m(4, 'Days 86–98'), title: 'Fine-tune billions of parameters on one GPU.',
      lede: 'LoRA and QLoRA with PEFT and TRL, RLHF and DPO alignment, Streamlit and Gradio front ends, multimodal CLIP, fairness and red-teaming, adversarial robustness, federated learning, ML system design — and the final capstone, from scoping to a 15-minute stakeholder defence.',
      steps: ['Freeze the base weights', 'Train two low-rank matrices', 'Quantise to 4-bit with QLoRA', 'Align with RLHF or DPO'], topics: ['NF4 quantisation', 'ChatML datasets', 'CLIP', 'Demographic parity', 'FGSM', 'Federated averaging'], stage: loraStage() }),
    chapter({ id: 'mlops', scene: 'aiml-ops', len: 240, eyebrow: m(5), title: 'Ship it. Version it. Prove it.',
      lede: 'Data structures and algorithms for interviews, SQL from DDL to window functions, then MLOps: Git and DVC, experiment tracking with MLflow, serialisation, REST APIs with FastAPI and Pydantic, testing with Swagger and Postman, and Docker.',
      steps: ['Version code and data', 'Track experiments with MLflow', 'Serve the model behind FastAPI', 'Containerise and call it'], topics: ['Two pointers', 'Sliding window', 'Binary search', 'Hashmaps', 'RANK & DENSE_RANK', 'joblib', 'docker ps'], stage: opsStage() }),
  ].join('\n');
}
