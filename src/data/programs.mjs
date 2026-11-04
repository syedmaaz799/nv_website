/**
 * Program catalogue. Curriculum content is parsed verbatim from the official
 * curriculum documents (see tools/parse_curricula.py → src/data/curriculum/*.json).
 * Marketing copy below is written strictly from what those curricula contain.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const load = (n) => JSON.parse(fs.readFileSync(path.join(here, 'curriculum', `${n}.json`), 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const range = (a, b) => (a === b ? `${a}` : `${a}–${b}`);

/* ---------- curriculum normalisers → { unitLabel, units:[{label,title,meta,groups:[{title,days}]}] } ---------- */
function normDA(raw) {
  const units = raw.modules.map((m, i) => {
    const weeks = [...new Set(m.days.map((d) => d.week))];
    const days = m.days.map((d) => d.day);
    const groups = weeks.map((w) => ({
      title: `Week ${w}`,
      days: m.days.filter((d) => d.week === w).map((d) => ({
        num: d.day, label: `Day ${d.day}`, titles: [d.title], points: d.points,
      })),
    }));
    return {
      id: `module-${i + 1}`, label: `Module ${pad(i + 1)}`, title: m.title,
      meta: `Week${weeks.length > 1 ? 's' : ''} ${range(weeks[0], weeks.at(-1))} · Days ${range(days[0], days.at(-1))}`,
      count: days.length, groups,
    };
  });
  return { unitLabel: 'Module', units };
}

function normDS(raw) {
  const units = raw.months.map((m) => {
    const all = m.weeks.flatMap((w) => w.days);
    return {
      id: `month-${m.month}`, label: `Month ${pad(m.month)}`, title: m.title,
      meta: `Weeks ${range(m.weeks[0].week, m.weeks.at(-1).week)} · Days ${range(all[0].day, all.at(-1).day)}`,
      count: all.length,
      groups: m.weeks.map((w) => ({
        title: `Week ${w.week}`, subtitle: w.title,
        days: w.days.map((d) => ({ num: d.day, label: `Day ${d.day}`, titles: [d.title], body: d.body })),
      })),
    };
  });
  return { unitLabel: 'Month', units };
}

function normAIML(raw) {
  const units = raw.months.map((m) => ({
    id: `month-${m.month}`, label: `Month ${pad(m.month)}`, title: m.title,
    meta: `Days ${range(m.range[0], m.range[1])}`, count: m.days.length,
    groups: [{ title: '', days: m.days.map((d) => ({ num: d.day, label: `Day ${d.day}`, titles: d.titles, points: d.points })) }],
  }));
  return { unitLabel: 'Month', units };
}

function normAAA(raw) {
  const units = raw.weeks.map((w) => ({
    id: `week-${w.week}`, label: `Week ${pad(w.week)}`, title: w.title,
    meta: `Sessions ${range(w.days[0].session, w.days.at(-1).session)}`, count: w.days.length,
    groups: [{
      title: '', days: w.days.map((d) => ({
        num: d.session, label: `Day ${d.day}`, titles: d.topics.length && d.topics[0].label ? [d.topics[0].label] : ['Session ' + d.session],
        points: d.topics, project: d.project, deliverables: d.deliverables, assessment: d.assessment,
      })),
    }],
  }));
  return { unitLabel: 'Week', units };
}

/* ------------------------------------------------------------------------------------------------ */
export const PROGRAMS = [
  {
    key: 'da',
    slug: 'data-analyst-with-genai',
    name: 'Data Analyst with GenAI',
    short: 'Data Analyst',
    number: '01',
    duration: '3 Months',
    durationShort: '3 mo',
    weeks: 12,
    sessions: 60,
    level: 'Beginner-friendly',
    format: 'Day-by-day, hands-on',
    accent: '#3EE08F',
    accent2: '#3FD5E0',
    accentRgb: '62, 224, 143',
    tagline: 'From spreadsheets to AI-assisted insight.',
    headline: 'Turn raw data into decisions — with GenAI as your co-analyst.',
    summary:
      'A 12-week, 60-session journey through the complete analyst toolkit: Advanced Excel and Power Query, SQL, Power BI with DAX, Python with Pandas, statistics, Generative AI for analytics, big-data foundations and your first machine-learning models.',
    cardBlurb: 'Excel, SQL, Power BI, Python and statistics — supercharged with Generative AI.',
    startsFrom: 'Starts from Excel fundamentals; Python is taught from scratch.',
    focus: 'Analytics, BI dashboards & reporting',
    genai: 'LLMs, prompt engineering, knowledge assistants and no-code AI agents for analytics',
    idealFor: [
      'Students and graduates starting a career in data',
      'Professionals who already live in spreadsheets and reports',
      'Career switchers moving into analytics and BI',
      'Managers who want to make confident, data-driven decisions',
    ],
    outcomes: [
      'Build automated Excel models with dynamic arrays, Power Query and interactive dashboards',
      'Query relational databases using joins, subqueries, CTEs and window functions',
      'Model data, write DAX and publish secure Power BI dashboards with Row-Level Security',
      'Clean, analyse and visualise data with Python, NumPy, Pandas, Matplotlib and Seaborn',
      'Validate business questions with statistics and hypothesis testing',
      'Use LLMs and prompt engineering to accelerate analysis, summaries and code',
      'Understand distributed processing with Hadoop, Spark and Microsoft Fabric',
      'Build your first regression and classification models',
    ],
    chips: ['Excel & Power Query', 'SQL', 'Power BI & DAX', 'Python', 'Statistics', 'Generative AI', 'Spark & Fabric', 'Intro to ML'],
    roles: ['Data Analyst', 'Business Intelligence Analyst', 'Power BI Developer', 'Reporting & MIS Analyst', 'Business Analyst', 'Product / Operations Analyst'],
    tools: ['Excel', 'Power Query', 'SQL', 'Power BI', 'DAX', 'M Language', 'Power BI Service', 'Python', 'Anaconda', 'Jupyter', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Regex', 'ChatGPT', 'Claude', 'Meta LLaMA', 'Apache Hadoop', 'Apache Spark', 'Microsoft Fabric'],
    projects: [
      { title: 'Dynamic Excel Dashboard', when: 'Days 7–8', text: 'Self-updating charts with OFFSET/COUNTA named ranges, form-control interactivity, pacing and gauge charts for KPI tracking.' },
      { title: 'Power Query ETL Pipeline', when: 'Days 9–10', text: 'Ingest, cleanse, merge and append messy multi-source data into one normalised master table.' },
      { title: 'SQL Analytics Workbench', when: 'Days 11–20', text: 'Design schemas with constraints, then answer business questions with joins, subqueries, CTEs and window functions.' },
      { title: 'Executive Power BI Report', when: 'Days 21–28', text: 'Star-schema model, DAX time intelligence, drill-through, Row-Level Security — published to Power BI Service.' },
      { title: 'Web-Scraped EDA Study', when: 'Day 44', text: 'Scrape raw data, structure it with Pandas and surface correlations with pair plots and heat maps.' },
      { title: 'Statistical Testing Report', when: 'Days 45–51', text: 'Z-tests, t-tests, chi-square, ANOVA and confidence intervals to back recommendations with evidence.' },
      { title: 'GenAI Analytics Assistant', when: 'Days 52–54', text: 'Prompt templates, knowledge assistants and a no-code AI agent that automates a business decision.' },
      { title: 'First Predictive Models', when: 'Days 58–60', text: 'Simple, multiple, polynomial and logistic regression — with honest evaluation of fit.' },
    ],
    faqs: [
      { q: 'Do I need a technical background?', a: 'No. The program opens with Excel architecture and fundamentals, and Python is introduced from the very first line of code, environment setup included.' },
      { q: 'Which tools will I learn?', a: 'Advanced Excel and Power Query, SQL, Power BI (Desktop and Service) with DAX and M, Python with NumPy, Pandas, Matplotlib and Seaborn, plus LLMs for analytics and an introduction to Hadoop, Spark and Microsoft Fabric.' },
      { q: 'How is Generative AI used in this program?', a: 'You will learn how LLMs such as the GPT family, LLaMA and Claude work, master zero-shot, few-shot and chain-of-thought prompting, and apply GenAI to summarisation, code generation, knowledge assistants and no-code AI agents — with guardrails for bias and hallucinations.' },
      { q: 'Will I build projects?', a: 'Yes — an interactive Excel dashboard, a Power Query ETL pipeline, SQL analytics, an executive Power BI report with Row-Level Security, a web-scraped EDA study, statistical testing and your first ML models.' },
      { q: 'Does it cover machine learning?', a: 'The final week introduces machine learning: simple, multiple and polynomial regression, the bias–variance trade-off and logistic regression for classification.' },
    ],
    curriculum: normDA(load('da')),
  },
  {
    key: 'ds',
    slug: 'data-science-with-genai',
    name: 'Data Science with GenAI',
    short: 'Data Science',
    number: '02',
    duration: '6 Months',
    durationShort: '6 mo',
    weeks: 24,
    sessions: 120,
    level: 'Beginner to advanced',
    format: 'Day-by-day, hands-on',
    accent: '#4AA8FF',
    accent2: '#8B7CFF',
    accentRgb: '74, 168, 255',
    tagline: 'The complete data-science lifecycle — from Python to production GenAI.',
    headline: 'Master the full data-science lifecycle — and ship it with GenAI.',
    summary:
      'A 24-week, 120-session program that takes you from Python and statistics through machine learning, deep learning and computer vision, NLP and Generative AI, to SQL and Power BI — finishing with an end-to-end analytics system.',
    cardBlurb: 'Python, statistics, ML, deep learning, NLP and GenAI — plus SQL and Power BI.',
    startsFrom: 'Starts from programming fundamentals and environment setup.',
    focus: 'Machine learning, deep learning, NLP & GenAI',
    genai: 'OpenAI, DALL·E, Gemini, LLaMA, LangChain RAG and a deployed GenAI assistant',
    idealFor: [
      'Aspiring data scientists who want the complete lifecycle',
      'Analysts ready to move into machine learning',
      'Engineers and developers transitioning into AI',
      'STEM graduates building a data-science portfolio',
    ],
    outcomes: [
      'Write clean, object-oriented Python and wrangle data with NumPy and Pandas',
      'Run rigorous EDA, probability and hypothesis testing — A/B, chi-square, ANOVA',
      'Train and tune supervised and unsupervised models, from regression to XGBoost, K-Means and DBSCAN',
      'Build deep networks with TensorFlow and Keras and detect objects in real time with YOLO',
      'Process language with NLTK, spaCy, embeddings, RNNs, LSTMs, Transformers and BERT',
      'Build GenAI apps with OpenAI, Gemini, LLaMA and LangChain RAG, deployed with Streamlit',
      'Query databases with advanced SQL and tell the story in Power BI',
    ],
    chips: ['Python & Pandas', 'Statistics', 'Machine Learning', 'Deep Learning & CV', 'NLP & GenAI', 'SQL & Power BI'],
    roles: ['Data Scientist', 'Machine Learning Engineer', 'GenAI Developer', 'Computer Vision Engineer', 'NLP Engineer', 'Data / BI Analyst'],
    tools: ['Python', 'Anaconda', 'Jupyter', 'VS Code', 'Google Colab', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Regex', 'scikit-learn', 'XGBoost', 'TensorFlow', 'Keras', 'TensorBoard', 'OpenCV', 'YOLO (Ultralytics)', 'NLTK', 'spaCy', 'BERT', 'OpenAI API', 'DALL·E', 'Gemini', 'Meta LLaMA', 'LangChain', 'Streamlit', 'Git', 'GitHub', 'MySQL Workbench', 'SQL', 'Excel', 'Power BI', 'Power Query', 'DAX'],
    projects: [
      { title: 'Student Management System', when: 'Day 13', text: 'A console application that puts classes, inheritance, magic methods and abstract base classes to work.' },
      { title: 'Web-Scraping Case Studies', when: 'Day 20', text: 'Acquire data from the web from scratch, then clean and prepare it with advanced Pandas.' },
      { title: 'ML App with Streamlit', when: 'Day 60', text: 'Customer segmentation (unsupervised) or classification (supervised), served as a live web app.' },
      { title: 'Face Mask Detection', when: 'Day 75', text: 'An image-classification case study using modern, efficient CNN architectures.' },
      { title: 'Bone-Fracture Detection', when: 'Day 76', text: 'Transfer-learning pipelines with feature extraction and fine-tuning on a custom dataset.' },
      { title: 'Real-Time Helmet Detection / Plant Disease', when: 'Day 80', text: 'YOLO for detection and localisation with a transfer-learning backbone.' },
      { title: 'Autoencoder Reconstruction', when: 'Day 87', text: 'Compress and reconstruct MNIST images with an encoder–decoder network.' },
      { title: 'BERT Sentiment Analysis', when: 'Day 90', text: 'Fine-tune a pre-trained BERT model for text classification and sentiment.' },
      { title: 'Text-to-Image Generator', when: 'Day 94', text: 'Generate images from textual descriptions with a multimodal GenAI API.' },
      { title: 'Gemini AI Chatbot', when: 'Day 95', text: 'Step-by-step creation of an AI-powered chatbot using the Gemini API.' },
      { title: 'RAG Application', when: 'Day 98', text: 'Retrieval-Augmented Generation with LangChain to ground answers in your own data.' },
      { title: 'GenAI Writing Assistant', when: 'Day 100', text: 'A chatbot / writing assistant deployed live with Streamlit, version-controlled on GitHub.' },
      { title: 'End-to-End Analytics System', when: 'Day 120', text: 'SQL extraction → Pandas cleaning → predictive model → Power BI dashboard with a GenAI executive summary.' },
    ],
    faqs: [
      { q: 'Do I need to know programming already?', a: 'No. Month 1 starts with what programming is, computational thinking and environment setup (Anaconda, VS Code, Google Colab, Jupyter), then builds up to OOP, NumPy and Pandas.' },
      { q: 'How much mathematics is involved?', a: 'Month 2 is dedicated to statistics and probability — descriptive statistics, distributions, sampling, confidence intervals and hypothesis testing — taught with practical data-science applications.' },
      { q: 'What deep-learning topics are covered?', a: 'Neural networks from perceptrons to backpropagation, activation functions, optimisers, regularisation, Keras and TensorFlow, OpenCV, CNN architectures from LeNet to EfficientNet, transfer learning, R-CNN and YOLO.' },
      { q: 'What will I do with Generative AI?', a: 'Prompt engineering, the OpenAI API, DALL·E image generation, Gemini chatbots, local LLaMA models, LangChain and RAG — ending with a GenAI writing assistant deployed on Streamlit.' },
      { q: 'Why are SQL and Power BI in a data-science program?', a: 'Real projects start in databases and end in dashboards. Month 6 covers SQL end to end and Power BI, culminating in a capstone that connects all six months.' },
    ],
    curriculum: normDS(load('ds')),
  },
  {
    key: 'aiml',
    slug: 'applied-ai-and-machine-learning',
    name: 'Applied AI & Machine Learning',
    short: 'Applied AI & ML',
    number: '03',
    duration: '6 Months',
    durationShort: '6 mo',
    weeks: 24,
    sessions: 120,
    level: 'Intermediate to advanced',
    format: 'Day-by-day, engineering-grade',
    accent: '#A685FF',
    accent2: '#F472D0',
    accentRgb: '166, 133, 255',
    tagline: 'Engineer intelligent systems — from first principles to production.',
    headline: 'Engineer AI end to end — from tensors to autonomous agents.',
    summary:
      'An engineering-grade, 120-session program: production Python, statistics and classical ML, deep learning and computer vision with TensorFlow, Transformers built from scratch, advanced RAG and agentic systems, fine-tuning and alignment — then DSA, SQL and MLOps with FastAPI and Docker.',
    cardBlurb: 'Production Python, ML, deep learning, Transformers, RAG, agents and MLOps.',
    startsFrom: 'Starts from Python foundations, then moves fast into engineering depth.',
    focus: 'AI engineering, LLMs, agents & MLOps',
    genai: 'Transformers from scratch, advanced RAG, LoRA/QLoRA, RLHF/DPO, LangGraph and MCP agents',
    idealFor: [
      'Developers and engineers moving into AI engineering',
      'Data scientists going deeper into deep learning and LLMs',
      'Computer-science students and graduates',
      'Technical professionals building AI products',
    ],
    outcomes: [
      'Write production-grade Python — OOP, decorators, generators, concurrency, type hints, Pydantic and pytest',
      'Master statistics, feature engineering and every major classical ML family, with SHAP and LIME interpretability',
      'Build deep networks in TensorFlow: CNNs, ResNets, YOLO detection, segmentation and Vision Transformers',
      'Implement attention and a complete Transformer from scratch, and understand GPT-style decoding',
      'Architect advanced RAG — hybrid search, reranking, GraphRAG, CRAG — and multi-agent systems with LangGraph and MCP',
      'Fine-tune LLMs with LoRA and QLoRA and align them with RLHF and DPO',
      'Ship models with MLflow, FastAPI and Docker, and prepare for DSA and SQL interviews',
    ],
    chips: ['Production Python', 'Classical ML', 'TensorFlow & Vision', 'Transformers', 'RAG & Agents', 'LoRA & RLHF', 'MLOps'],
    roles: ['Machine Learning Engineer', 'AI Engineer', 'LLM / GenAI Engineer', 'Computer Vision Engineer', 'MLOps Engineer', 'AI Product Engineer'],
    tools: ['Python', 'VS Code', 'Jupyter', 'Pydantic', 'pytest', 'Requests', 'BeautifulSoup', 'Selenium', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Plotly', 'Dash', 'ydata-profiling', 'SciPy', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'Optuna', 'SHAP', 'LIME', 'PyCaret', 'H2O.ai', 'Prophet', 'TensorFlow', 'Keras', 'Albumentations', 'YOLO (Ultralytics)', 'OpenCV', 'spaCy', 'gensim', 'Hugging Face', 'OpenAI API', 'Pinecone', 'ChromaDB', 'pgvector', 'Neo4j', 'LangChain', 'LlamaIndex', 'LangGraph', 'MCP', 'PEFT / TRL', 'CLIP', 'Streamlit', 'Gradio', 'n8n', 'Flowise', 'AWS Lambda', 'Google Cloud Run', 'Celery', 'Redis', 'RAGAS', 'DeepEval', 'LangSmith', 'GitHub Actions', 'Git', 'DVC', 'MLflow', 'FastAPI', 'Swagger UI', 'Postman', 'Docker', 'SQL'],
    projects: [
      { title: 'End-to-End Extraction Pipeline', when: 'Day 15', text: 'A multi-page scraper built with OOP, type hints and decorators, cleaned with Pandas and exported to SQLite or Parquet.' },
      { title: 'End-to-End ML Pipeline', when: 'Day 45', text: 'Target encoding, SMOTE and XGBoost in an sklearn pipeline, validated with ROC-AUC, learning curves and SHAP.' },
      { title: 'Custom Object-Detection Pipeline', when: 'Day 60', text: 'Bounding-box-aware Albumentations, a YOLOv10 model trained via transfer learning, evaluated with mAP.' },
      { title: 'Transformer NMT from Scratch', when: 'Day 75', text: 'Multi-head attention from primitive matmuls, BPE, causal masks — trained on machine translation.' },
      { title: 'Autonomous Multi-Agent Research System', when: 'Day 90', text: 'Hybrid-search RAG, LangGraph multi-agent routing, a Python REPL tool, FastAPI + Streamlit, LangSmith and RAGAS.' },
      { title: 'Final Capstone & Graduation', when: 'Days 95–98', text: 'Scope a business problem, model it, deploy it behind FastAPI with a polished UI, then defend it in a 15-minute pitch.' },
      { title: 'Production ML API', when: 'Days 114–120', text: 'MLflow experiment tracking, serialised pipelines, a validated FastAPI service and a Dockerised deployment.' },
    ],
    faqs: [
      { q: 'Is this program suitable for beginners?', a: 'It starts with Python foundations, but the pace and depth are engineering-grade — concurrency, CPython internals, Transformers from scratch and MLOps. Comfort with logical thinking and maths will help you get the most from it.' },
      { q: 'Which deep-learning framework is used?', a: 'TensorFlow and Keras — tensors, GradientTape, custom training loops, tf.data pipelines, CNNs, ResNets, transfer learning, YOLO, segmentation and Vision Transformers.' },
      { q: 'How deep does the GenAI coverage go?', a: 'Attention, QKV and positional encoding, building a Transformer from scratch, GPT-style decoding, advanced prompting and ReAct, vector databases, advanced RAG, MCP tool calling, LoRA/QLoRA fine-tuning and RLHF/DPO alignment.' },
      { q: 'Does it prepare me for interviews?', a: 'Yes. Month 6 covers data structures and algorithms — Big-O, searching, sorting, linked lists, stacks, queues, hashmaps, recursion and trees — plus SQL and ML system design frameworks.' },
      { q: 'Will I learn to deploy models?', a: 'Yes — Git and DVC, MLflow tracking, serialisation, REST APIs with FastAPI and Pydantic, testing with Swagger and Postman, and Docker containers.' },
    ],
    curriculum: normAIML(load('aiml')),
  },
  {
    key: 'aaa',
    slug: 'ai-agents-and-automation',
    name: 'AI Agents & Automation',
    short: 'AI Agents',
    number: '04',
    duration: '6 Weeks',
    durationShort: '6 wk',
    weeks: 6,
    sessions: 36,
    level: 'No heavy coding required',
    format: 'Project-led, hands-on labs',
    accent: '#F5B544',
    accent2: '#FF7A59',
    accentRgb: '245, 181, 68',
    tagline: 'Build AI agents and automations that do real work.',
    headline: 'Design, build and deploy AI agents that actually get work done.',
    summary:
      'A fast-paced 6-week, 36-session program: prompt engineering and APIs, MCP and agentic AI, no-code agents with Dify, n8n, CrewAI and Zapier, production RAG, AI UGC content factories, prompt-to-app development with Lovable, and production agents with OpenClaw.',
    cardBlurb: 'Prompting, MCP, no-code agents, RAG, AI content factories, AI apps and OpenClaw.',
    startsFrom: 'Starts from AI foundations; most builds are no-code or low-code.',
    focus: 'Agents, automation & AI-powered apps',
    genai: 'Prompt engineering, MCP, RAG assistants, AI UGC, prompt-to-app and production agents',
    idealFor: [
      'Professionals and founders who want to automate real workflows',
      'Marketers and creators scaling content with AI',
      'Operations and business teams adopting AI agents',
      'Non-coders and developers who want agentic AI fast',
    ],
    outcomes: [
      'Engineer reliable prompts and build a reusable library of 20–30 prompts',
      'Optimise tokens, cost and context, and compare models across APIs',
      'Connect AI to tools and data with APIs and the Model Context Protocol (MCP)',
      'Design agent architectures with memory, planning, tools, guardrails and human-in-the-loop control',
      'Build no-code agents and automations in Dify, n8n, CrewAI and Zapier',
      'Ship production-style RAG assistants with citations and conversation memory',
      'Create and automate AI UGC — scripts, avatars, voice and multi-platform video',
      'Build and deploy AI web apps with Lovable, wired to automation workflows via webhooks',
      'Run secure, scheduled production agents with OpenClaw, MCP and Bitwarden',
    ],
    chips: ['Prompt Engineering', 'APIs & MCP', 'No-code Agents', 'RAG', 'AI UGC', 'Prompt-to-App', 'OpenClaw'],
    roles: ['AI Automation Specialist', 'AI Agent Developer', 'No-Code / Low-Code AI Builder', 'AI Solutions Consultant', 'Marketing Automation Specialist', 'AI Content Producer'],
    tools: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Whisper Flow', 'Groq', 'OpenRouter', 'Cohere', 'Hugging Face', 'GitHub', 'LinkedIn', 'Claude Desktop', 'MCP', 'Whimsical', 'FigJam', 'Miro', 'Dify', 'n8n', 'CrewAI', 'Zapier', 'ChromaDB', 'Pinecone', 'Weaviate', 'Qdrant', 'FAISS', 'Lovable', 'Bolt', 'Replit AI', 'Emergent', 'Firebase Studio', 'v0', 'Cursor', 'Supabase', 'Firebase', 'OpenClaw', 'Telegram', 'Discord', 'AgentMail', 'Bitwarden', 'Zapier MCP'],
    projects: [
      { title: 'Reusable Prompt Library', when: 'Week 1', text: '20–30 structured prompts tested across ChatGPT, Claude, Gemini and Perplexity, with a comparison report.' },
      { title: 'Your First AI Agent Workflow', when: 'Week 2 · Mini Project 1', text: 'A no-code assistant built on Claude Desktop connected to multiple MCP servers — research, files or knowledge.' },
      { title: 'Agent Design Workshop', when: 'Week 2', text: 'A complete agent architecture: brain, planner, memory, executor, tools, guardrails and oversight strategy.' },
      { title: 'Four Platform Automations', when: 'Week 3', text: 'A Dify chatbot, an n8n AI workflow, a CrewAI multi-agent crew and a Zapier AI automation — compared.' },
      { title: 'Production-Style RAG Assistant', when: 'Week 3 · Major Project 1', text: 'Multi-document ingestion, cited answers and conversation context in Dify or n8n.' },
      { title: 'Intelligent Automation System', when: 'Week 4 · Mini Project 2', text: 'RAG + web search + APIs + workflow automation solving a real business problem.' },
      { title: 'AI UGC Content Factory', when: 'Week 4', text: 'From one product input to research, scripts, prompts, captions, thumbnails and publish-ready packages.' },
      { title: 'Your First AI Web App', when: 'Week 5 · Mini Project 3', text: 'A responsive AI-powered application built and deployed with Lovable.' },
      { title: 'AI App + Automation Integration', when: 'Week 5 · Major Project', text: 'A Lovable front end exchanging JSON with a Dify, n8n, Zapier or CrewAI workflow via webhooks.' },
      { title: 'Production AI Agent with OpenClaw', when: 'Week 6 · Final Major Project', text: 'Telegram/Discord, persistent memory, skills, browser automation, heartbeats, Bitwarden and Zapier MCP.' },
    ],
    faqs: [
      { q: 'Do I need to know how to code?', a: 'No heavy coding is required. Most builds use no-code and low-code platforms such as Claude Desktop with MCP, Dify, n8n, CrewAI, Zapier and Lovable, with JSON, APIs and webhooks explained from first principles.' },
      { q: 'What will I have built by the end?', a: 'A prompt library, an MCP-powered agent workflow, four platform automations, a production-style RAG assistant, an intelligent automation system, an AI UGC content factory, an AI web app, an app-plus-automation integration and a production OpenClaw agent.' },
      { q: 'What is MCP and why does it matter?', a: 'The Model Context Protocol standardises how AI systems connect to tools and data. You will learn its architecture — clients, servers, tools, resources, prompts and transports — and use it with Claude Desktop and OpenClaw.' },
      { q: 'Is AI-generated content covered responsibly?', a: 'Yes. The UGC weeks include ethics, AI disclosure, copyright and commercial rights, and every agent build covers guardrails, validation and human oversight.' },
      { q: 'Is it suitable for business owners?', a: 'Absolutely — every project is framed around real business use cases: customer support, research, lead qualification, internal knowledge, content and operations.' },
    ],
    curriculum: normAAA(load('aaa')),
  },
];

/* ---------- derived numbers (all computed from the curricula above) ---------- */
for (const p of PROGRAMS) {
  p.url = `programs/${p.slug}.html`;
  p.brochure = `brochures/NeuralVarsity-${p.name.replace(/&/g, 'and').replace(/[^A-Za-z0-9]+/g, '-').replace(/-+$/, '')}-Brochure.pdf`;
  p.applyUrl = `apply.html?program=${p.slug}`;
  p.unitCount = p.curriculum.units.length;
  p.dayCount = p.curriculum.units.reduce((s, u) => s + u.count, 0);
}

export const STATS = {
  programs: PROGRAMS.length,
  sessions: PROGRAMS.reduce((s, p) => s + p.dayCount, 0),
  projects: PROGRAMS.reduce((s, p) => s + p.projects.length, 0),
  tools: new Set(PROGRAMS.flatMap((p) => p.tools)).size,
};

export const bySlug = Object.fromEntries(PROGRAMS.map((p) => [p.slug, p]));
export const byKey = Object.fromEntries(PROGRAMS.map((p) => [p.key, p]));
