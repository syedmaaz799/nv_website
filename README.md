# NeuralVarsity — website

A fast, static, immersive marketing site for NeuralVarsity's four programs:

| Program | Duration | Sessions | Page |
|---|---|---|---|
| Data Analyst with GenAI | 3 months | 60 | `programs/data-analyst-with-genai.html` |
| Data Science with GenAI | 6 months | 120 | `programs/data-science-with-genai.html` |
| Applied AI & Machine Learning | 6 months | 120 | `programs/applied-ai-and-machine-learning.html` |
| AI Agents & Automation | 6 weeks | 36 | `programs/ai-agents-and-automation.html` |

All curriculum content (every module, week, day, topic, project, deliverable and assessment) is parsed directly from the four official curriculum documents — nothing is retyped by hand.

---

## ⚠️ Before launch: fill in your contact details

The build environment could not reach the current neuralvarsity.ai site, so **phone, WhatsApp, email, address and social links are placeholders**. They're all in one file:

```
src/config/site.mjs
```

Fill in `contact`, `locations`, `social` and (optionally) `forms.endpoint`, then rebuild **including brochures** so the PDFs' contact page is updated too:

```bash
npm run build:all
```

Until a value is filled in, it shows on the site in **amber** (e.g. `[WhatsApp number]`) so nothing is missed, WhatsApp/phone/email buttons show a friendly "being set up" message instead of a dead link, and the build prints a checklist of what's left.

---

## Quick start

```bash
npm install
npm run build        # → dist/
npm run serve        # → http://localhost:4173
npm run dev          # rebuild on every change in src/
```

Requires Node 18+. The brochure generator and QA suite also need Playwright:

```bash
npm i -D playwright && npx playwright install chromium
npm run brochures    # regenerate the 4 PDF brochures + social share images
npm run qa           # links, console errors, overflow at 3 viewports, a11y basics
```

## Deploying

`dist/` is a plain static site — upload it to any host (Hostinger, Netlify, Vercel, Cloudflare Pages, S3, nginx…). Point the host's "not found" page at `404.html`. Set `site.url` in `src/config/site.mjs` to the live domain so canonical URLs, the sitemap and social cards are correct.

## Forms (Apply + Contact)

Submissions are delivered in this order of preference:

1. **`forms.endpoint`** — if set, the form POSTs JSON there. Works with Formspree, Getform, Web3Forms (set `forms.accessKey`), a Google Apps Script web app, or your own API.
2. **WhatsApp** — if `contact.whatsapp` is set, the visitor gets a one-tap button that opens WhatsApp with their application pre-written.
3. **Email** — if `contact.email` is set, a pre-filled email draft.

If none are configured, the visitor is told plainly that the application has **not** been sent and can copy their answers. The Apply page accepts `?program=<slug>` to pre-select a program (every "Apply Now" button uses this), validates each step, and saves a draft on the visitor's device.

## Updating a curriculum

Replace the `.docx` and re-run the parser (needs `pip install python-docx`). Files are matched by keyword (`Data_Analyst`, `Data_Science`, `AIML`, `AAA`):

```bash
python3 tools/parse_curricula.py path/to/folder-with-docx/ src/data/curriculum
npm run build:all
```

Marketing copy per program (taglines, outcomes, projects, FAQs, tools) lives in `src/data/programs.mjs`.

---

## What's on each page

- **Home** — WebGL particle field that morphs sphere → bar chart → clusters → neural network → agent orbits as you scroll through the four programs; skills ticker; bento "why"; animated stats; horizontal "Concept · Lab · Project · Proof" journey; 118-tool marquee; FAQ.
- **Programs** — four interactive cards (each with **Download Brochure · Apply Now · Learn More**), side-by-side comparison table, a three-question program finder, and brochure downloads.
- **Program pages** — each tells its own scroll-driven story, then gives the full searchable curriculum:
  - *Data Analyst*: a live Excel sheet (TRIM/PROPER → SUMIFS → conditional formatting → dynamic arrays → charts), a Power Query editor with applied steps, a SQL editor with a **switchable JOIN Venn diagram and live results**, a Power BI report with **working region slicers and Row-Level Security**, a Jupyter notebook running Pandas, a **draggable hypothesis test** (z, α, p-value), a prompting playground, and Hadoop/Spark + regression.
  - *Data Science*: a 3D particle journey (table → bell curve → clusters → network → "GenAI" → dashboard), HTML-to-DataFrame scraping, a **Central Limit Theorem simulator**, a **K-Means playground** (click to add points), a convolution sweep + YOLO detection, attention + RAG, and the end-to-end capstone pipeline.
  - *Applied AI & ML*: a 3D neural network firing forward passes, typed Python with concurrency lanes, a **bias–variance slider**, a **3D loss landscape with SGD/Adam/momentum racing**, a **CNN output-shape calculator**, **interactive attention heads**, a **temperature/top-k/top-p decoding lab**, production RAG + LangGraph agents, a **LoRA rank/QLoRA memory calculator**, and MLOps.
  - *AI Agents & Automation*: a **draggable n8n-style agent workflow** with live data packets, a prompt studio with token optimisation, MCP client↔server JSON-RPC + the agent loop, a **chunk size/overlap RAG lab**, a UGC content factory, prompt-to-app + webhooks, and an OpenClaw production agent.
- **Apply**, **Contact**, **About**, **Privacy** (template — have it reviewed), **404**.

## Tech

Static HTML generated at build time (no framework runtime), bundled with **esbuild**.

| Library | Use |
|---|---|
| [GSAP 3](https://github.com/greensock/GSAP) + ScrollTrigger + SplitText | scroll-scrubbed timelines, pinned chapters, split-text reveals, magnetic buttons |
| [Lenis](https://github.com/darkroomengineering/lenis) | smooth scrolling |
| [Three.js](https://github.com/mrdoob/three.js) | GPU particle morphs, 3D neural network, loss landscape (custom shaders); loaded lazily, only on pages that use it |
| [Simple Icons](https://github.com/simple-icons/simple-icons), [Lucide](https://github.com/lucide-icons/lucide) | brand + UI icons, inlined as an SVG sprite |
| [Fontsource](https://github.com/fontsource/fontsource) | self-hosted Sora, Manrope, JetBrains Mono |

**Performance** — critical CSS + fonts preloaded, 3D bundle deferred until after first paint, render loops pause off-screen and when tabs are hidden, zero layout shift (CLS 0.00 measured).
**Accessibility** — skip link, keyboard-operable menus, tabs (arrow keys), sliders and draggable nodes; visible focus; labelled form controls with inline errors; `prefers-reduced-motion` shows every scene in its final state with no motion; semantic headings checked in QA.

## Project structure

```
src/
  config/site.mjs          ← organisation details (edit me)
  data/programs.mjs        ← program metadata & copy
  data/curriculum/*.json   ← parsed curricula (generated)
  data/tools.mjs           ← tool → icon mapping
  templates/               ← page templates (layout, pages/, stories/ per program)
  styles/                  ← base, layout, components, curriculum, pages/*.css
  scripts/core/            ← smooth scroll, menus, reveals, cursor, magnetic buttons
  scripts/three/           ← WebGL scenes
  scripts/pages/           ← per-page scenes & interactions
  scripts/shared/          ← chapter controller, curriculum explorer, form delivery
tools/
  build.mjs  serve.mjs  brochures.mjs  qa.mjs  shot.mjs  parse_curricula.py
generated/                 ← brochures + social images (copied into dist/)
dist/                      ← the deployable site
```
