/** AI Agents & Automation — immersive story: build agents that do real work. */
import { esc, each, icon, brand, codeLines } from '../lib.mjs';
import { chapter, win } from '../chapter.mjs';

export const three = false;

const node = (id, x, y, ic, title, sub, cls = '', m = [x, y]) => `<div class="wf__node ${cls}" data-wf-node="${id}" data-pos="${x},${y}" data-mpos="${m[0]},${m[1]}" style="left:${x}%;top:${y}%" tabindex="0" role="button" aria-label="${esc(title)} node (draggable)" data-cursor="Drag">
  <span class="wf__ic">${ic}</span><span class="wf__txt"><b>${title}</b><small>${sub}</small></span><i class="wf__port wf__port--in"></i><i class="wf__port wf__port--out"></i></div>`;

export function heroArt() {
  return `<div class="wf" data-wf>
  <div class="wf__bar"><span class="mono">workflow · support-agent</span><span class="wf__live"><i></i>Active</span></div>
  <div class="wf__canvas" data-wf-canvas>
    <svg class="wf__links" data-wf-links aria-hidden="true"></svg>
    ${node('trigger', 3, 36, brand('telegram'), 'Telegram Trigger', 'on new message', 'wf__node--trigger', [3, 5])}
    ${node('agent', 35, 32, icon('bot'), 'AI Agent', 'tools agent · reasoning', 'wf__node--agent', [28, 37])}
    ${node('reply', 72, 46, icon('send'), 'Send reply', 'Telegram · message', '', [58, 5])}
    ${node('model', 12, 72, brand('claude'), 'Chat model', 'Claude', 'wf__node--sub', [3, 74])}
    ${node('memory', 38, 76, icon('database'), 'Memory', 'session context', 'wf__node--sub')}
    ${node('rag', 64, 70, icon('book-open'), 'Knowledge base', 'RAG · cited', 'wf__node--sub', [50, 74])}
    ${node('sheets', 68, 10, brand('googlesheets'), 'Log ticket', 'Google Sheets')}
  </div>
  <p class="wf__tip mono">${icon('mouse-pointer-click')}Drag the nodes</p>
</div>`;
}

function promptStage() {
  const blocks = [
    ['ROLE', 'You are a senior customer-success analyst.', 'Senior CS analyst.'],
    ['CONTEXT', 'Our SaaS customers write in about billing, onboarding and bugs. Here is the ticket history for this account, including every previous interaction.', 'Ticket history attached.'],
    ['TASK', 'Read the new ticket carefully, then classify it and draft a helpful, empathetic reply for the customer.', 'Classify + draft reply.'],
    ['CONSTRAINTS', 'Please keep the reply under 120 words. Never promise refunds. Always cite the relevant help-centre article.', '≤120 words · no refunds · cite help article.'],
    ['EXAMPLES', 'Example 1: "I was charged twice" → billing · apologise · link /billing-faq. Example 2: …', '1 example: billing → /billing-faq.'],
    ['OUTPUT', '{ "category": "billing | onboarding | bug", "priority": 1-3, "reply": "..." }', '{category, priority, reply} JSON'],
  ];
  return `<div class="ps stage-card" data-ps>
  <div class="ps__head"><span class="ps__t">${icon('wand-sparkles')}Prompt studio</span><span class="mono ps__fmt">Markdown · JSON · XML · delimiters</span></div>
  <div class="ps__body">
    <ol class="ps__blocks">${each(blocks, ([k, long, short], i) => `<li class="ps__b" data-ps-b="${i}"><span class="ps__k mono">${k}</span><span class="ps__v"><i class="ps__long">${esc(long)}</i><i class="ps__short">${esc(short)}</i></span></li>`)}</ol>
    <aside class="ps__meter">
      <p class="stage-label">Token budget</p>
      <svg viewBox="0 0 120 70" class="ps__gauge" aria-hidden="true"><path class="ps__track" d="M10 62 A50 50 0 0 1 110 62"/><path class="ps__fill" data-ps-fill d="M10 62 A50 50 0 0 1 110 62" pathLength="100"/></svg>
      <b class="ps__tokens mono" data-ps-tokens>0</b><span class="mono ps__unit">tokens</span>
      <span class="ps__save mono" data-ps-save>−59% after optimisation</span>
      <p class="stage-label">Cross-model check</p>
      <ul class="ps__models">${each([['ChatGPT', ''], ['Claude', 'claude'], ['Gemini', 'googlegemini'], ['Perplexity', 'perplexity']], ([n, s]) => `<li data-ps-model>${s ? brand(s) : `<span class="ps__gpt mono">GP</span>`}<span>${n}</span>${icon('check')}</li>`)}</ul>
    </aside>
  </div>
</div>`;
}

function mcpStage() {
  const servers = [['Filesystem', 'folder', ['read_file', 'list_dir']], ['GitHub', 'git-branch', ['create_issue', 'search_code']], ['Brave Search', 'search', ['web_search']], ['SQLite', 'database', ['query', 'schema']]];
  return `<div class="mcp stage-card" data-mcp>
  <div class="mcp__row">
    <div class="mcp__host" data-mcp-host>
      <p class="stage-label">Host</p>
      <b class="mcp__hname">${brand('claude')}Claude Desktop</b>
      <span class="mcp__client mono">MCP client</span>
    </div>
    <div class="mcp__wire" aria-hidden="true">
      <span class="mono mcp__tr">STDIO · HTTP</span>
      <div class="mcp__line"><i class="mcp__pk mcp__pk--req" data-mcp-req></i><i class="mcp__pk mcp__pk--res" data-mcp-res></i></div>
      <code class="mcp__json mono" data-mcp-json>{"method":"tools/call","params":{"name":"search_code"}}</code>
    </div>
    <div class="mcp__servers">${each(servers, ([n, ic, tools], i) => `<div class="mcp__srv" data-mcp-srv="${i}"><span class="mcp__sic">${icon(ic)}</span><span><b>${n}</b><small class="mono">${tools.join(' · ')}</small></span><span class="mcp__caps mono"><i>T</i><i>R</i><i>P</i></span></div>`)}</div>
  </div>
  <div class="mcp__loop">
    <div class="loop" data-loop aria-hidden="true">
      <svg viewBox="0 0 200 200"><circle class="loop__track" cx="100" cy="100" r="74"/><circle class="loop__arc" data-loop-arc cx="100" cy="100" r="74" pathLength="100"/></svg>
      ${each(['Observe', 'Think', 'Plan', 'Act', 'Reflect'], (s, i) => `<span class="loop__s" data-loop-s="${i}" style="--a:${i * 72 - 90}deg">${s}</span>`)}
      <b class="loop__c mono">agent<br>loop</b>
    </div>
    <div class="mcp__autonomy"><p class="stage-label">Human oversight</p>${each([['HITL', 'Human-in-the-loop', 'approves actions'], ['HOTL', 'Human-on-the-loop', 'monitors & intervenes'], ['HOOTL', 'Human-out-of-the-loop', 'fully autonomous']], ([k, l, d], i) => `<div class="mcp__au" data-au="${i}"><b class="mono">${k}</b><span>${l}<small>${d}</small></span></div>`)}</div>
  </div>
</div>`;
}

const DOC = 'Refunds for annual plans are pro-rated from the date of cancellation. Monthly plans can be cancelled at any time and remain active until the end of the billing period. Digital add-ons are refundable within 14 days if unused. To request a refund, open a ticket from the billing page and include your invoice number. Enterprise contracts follow the terms in your order form.';
function ragStage() {
  const plats = [['dify', 'Dify', 'dify', 'Chatflow · knowledge base'], ['n8n', 'n8n', 'n8n', 'Nodes · triggers · webhooks'], ['crewai', 'CrewAI', 'crewai', 'Role-based agent crews'], ['zapier', 'Zapier', 'zapier', 'Zaps · AI actions']];
  return `<div class="rgl stage-card" data-rgl>
  <div class="rgl__plats"><div class="seg" role="group" aria-label="No-code platform" data-plat>${each(plats, ([k, n, s], i) => `<button type="button" aria-pressed="${i === 0}" data-p="${k}">${brand(s)}${n}</button>`)}</div>
    <span class="mono rgl__pdesc" data-plat-desc>${plats[0][3]}</span>
    <script type="application/json" data-plat-json>${JSON.stringify(Object.fromEntries(plats.map((p) => [p[0], p[3]])))}</script></div>
  <div class="rgl__lab">
    <div class="rgl__doc"><p class="stage-label">refund-policy.pdf · chunked</p><p class="rgl__text" data-rgl-text>${esc(DOC)}</p></div>
    <div class="rgl__ctrl">
      <div class="ctrl"><div class="ctrl__top"><label for="rgl-size">Chunk size</label><span class="ctrl__val" data-rgl-sv>140 chars</span></div><input id="rgl-size" class="range" type="range" min="60" max="320" step="10" value="140" data-rgl-size></div>
      <div class="ctrl"><div class="ctrl__top"><label for="rgl-ov">Overlap</label><span class="ctrl__val" data-rgl-ov>30 chars</span></div><input id="rgl-ov" class="range" type="range" min="0" max="80" step="5" value="30" data-rgl-overlap></div>
      <p class="mono rgl__count"><b data-rgl-n>0</b> chunks · top-k = 2</p>
    </div>
  </div>
  <div class="rgl__qa">
    <p class="rgl__q">${icon('search')}<span>“Can I get a refund on an add-on?”</span></p>
    <p class="rgl__a" data-rgl-a>Yes — digital add-ons are refundable within 14 days if unused. Open a ticket from the billing page with your invoice number. <sup>[1]</sup><sup>[2]</sup></p>
  </div>
</div>`;
}

function ugcStage() {
  const nodes = [['telescope', 'Research'], ['file-text', 'Script'], ['image', 'Image prompts'], ['video', 'Video prompts'], ['hash', 'Captions'], ['layout-dashboard', 'Thumbnail']];
  const scripts = { PAS: ['Problem: “My desk is a cave by 6pm.”', 'Agitate: Eye strain. Headaches. Zero focus.', 'Solve: Lumen — daylight-tuned light in one tap.'], AIDA: ['Attention: “This lamp changed my evenings.”', 'Interest & desire: Warm-to-daylight in one tap.', 'Action: Link in bio — 20% off this week.'], BAB: ['Before: Squinting at screens all night.', 'After: Calm, bright, focused workspace.', 'Bridge: Lumen Desk Lamp. That’s it.'] };
  const phones = [['instagram', 'Reels'], ['tiktok', 'TikTok'], ['youtubeshorts', 'Shorts'], ['', 'LinkedIn']];
  return `<div class="ugc stage-card" data-ugc>
  <div class="ugc__in" data-ugc-in><p class="stage-label">Single product input</p><b>Lumen Desk Lamp</b><span class="mono">audience: remote workers · goal: conversions</span></div>
  <div class="ugc__mid">
    <div class="ugc__nodes">${each(nodes, ([ic, t], i) => `<span class="ugc__n" data-ugc-n="${i}">${icon(ic)}${t}</span>`)}</div>
    <div class="ugc__script">
      <div class="seg" role="group" aria-label="Script framework" data-fw>${each(Object.keys(scripts), (k, i) => `<button type="button" aria-pressed="${i === 0}" data-fw-k="${k}">${k}</button>`)}</div>
      <ol class="ugc__lines" data-fw-lines>${each(scripts.PAS, (l) => `<li>${esc(l)}</li>`)}</ol>
      <script type="application/json" data-fw-json>${JSON.stringify(scripts)}</script>
    </div>
  </div>
  <div class="ugc__phones">${each(phones, ([s, n], i) => `<div class="ugc__ph" data-ugc-ph="${i}"><div class="ugc__scr"><span class="ugc__plat">${s ? brand(s) : '<b class="ugc__in-glyph">in</b>'}${n}</span><i class="ugc__img"></i><i class="ugc__ln"></i><i class="ugc__ln ugc__ln--s"></i><span class="ugc__ai mono">AI-generated</span></div></div>`)}</div>
</div>`;
}

function appStage() {
  const req = `POST /webhook/summarise
{ "user_id": "u_481", "file": "notes.pdf",
  "task": "summarise", "style": "bullets" }`;
  const res = `200 OK
{ "summary": ["3 key decisions", "2 risks", "Next steps"],
  "tokens": 612, "latency_ms": 1840 }`;
  return `<div class="app">
  <div class="app__top">
    ${win('AI app builder', `<div class="app__chat"><p class="app__msg app__msg--me" data-app-prompt>Build an AI study assistant: landing page, sign-in, and a chat that summarises uploaded PDFs.</p><p class="app__msg app__msg--ai" data-app-ai>${icon('sparkles')}Generating pages, auth and a Supabase table… done. Deploying.</p></div>`, 'stage-win app__builder')}
    <div class="app__preview stage-card" data-app-prev>
      <div class="app__url mono">${icon('lock')}study-buddy · preview<span class="app__dep" data-app-dep>${icon('rocket')}Deployed</span></div>
      <div class="app__ui">
        <div class="app__nav"><i></i><span></span><span></span><b></b></div>
        <div class="app__hero"><i class="app__h1"></i><i class="app__h2"></i><b class="app__cta"></b></div>
        <div class="app__card"><span class="app__bub"></span><span class="app__bub app__bub--r"></span><span class="app__bub"></span></div>
      </div>
    </div>
  </div>
  <div class="app__flow stage-card" data-app-flow>
    <span class="app__f">${icon('monitor-smartphone')}App</span><i class="app__arr" data-app-arr="0"></i>
    <span class="app__f">${icon('webhook')}Webhook</span><i class="app__arr" data-app-arr="1"></i>
    <span class="app__f">${brand('n8n')}n8n workflow</span><i class="app__arr" data-app-arr="2"></i>
    <span class="app__f">${icon('sparkles')}LLM</span>
    <pre class="code code--type app__json" data-app-req>${codeLines(req, 'json')}</pre>
    <pre class="code code--type app__json" data-app-res>${codeLines(res, 'json')}</pre>
  </div>
</div>`;
}

function clawStage() {
  const files = [['SOUL.md', '# Soul\nCalm, precise, proactive. Never guesses — asks.'], ['IDENTITY.md', '# Identity\nName: Atlas · Role: ops assistant for the sales team'], ['USER.md', '# User\nTimezone: UTC+4 · prefers bullet summaries'], ['AGENTS.md', '# Agents\nResearcher · Writer · Reviewer (hand-offs)'], ['TOOLS.md', '# Tools\nbrowser · gmail · sheets · zapier-mcp'], ['HEARTBEAT.md', '# Heartbeat\nEvery 30 min: check inbox, flag hot leads'], ['MEMORY.md', '# Memory\nQ3 targets · key accounts · last report']];
  return `<div class="claw" data-claw>
  <div class="claw__ws stage-card">
    <p class="stage-label">Workspace</p>
    <ul class="claw__files" role="list">${each(files, ([f], i) => `<li><button type="button" data-file="${i}" aria-pressed="${i === 0}">${icon('file-code')}${f}</button></li>`)}</ul>
    <pre class="claw__prev mono" data-file-prev>${esc(files[0][1])}</pre>
    <script type="application/json" data-files-json>${JSON.stringify(files)}</script>
  </div>
  <div class="claw__chat stage-card" data-claw-chat>
    <p class="claw__ch">${brand('telegram')}<b>Atlas</b><span class="mono">online</span></p>
    <p class="claw__m claw__m--me" data-cm="0">Send me today’s hot leads and update the CRM.</p>
    <p class="claw__m" data-cm="1">On it — checking Gmail and the lead sheet…</p>
    <p class="claw__m" data-cm="2">3 hot leads found. CRM updated, follow-ups drafted for your approval. ✅</p>
  </div>
  <div class="claw__hb stage-card" data-claw-hb>
    <p class="stage-label">Heartbeats &amp; cron</p>
    <ul class="claw__jobs mono">${each([['*/30 * * * *', 'Check inbox, flag hot leads'], ['0 9 * * 1-5', 'Daily pipeline report'], ['0 18 * * 5', 'Weekly summary to Slack']], ([c, d], i) => `<li data-job="${i}"><code>${c}</code><span>${d}</span><i></i></li>`)}</ul>
  </div>
  <div class="claw__br stage-card" data-claw-br>
    <p class="stage-label">Browser automation</p>
    <div class="claw__form"><span><i>Company</i><b data-type-a>Northwind Labs</b></span><span><i>Email</i><b data-type-b>ops@northwind.example</b></span><span class="claw__submit" data-submit>Submit</span><i class="claw__cursor" data-cursor-ptr>${icon('mouse-pointer-click')}</i></div>
    <p class="claw__sec mono">${brand('bitwarden')}secrets via Bitwarden · ${brand('zapier')}Zapier MCP</p>
  </div>
</div>`;
}

export function chapters(p) {
  const u = p.curriculum.units;
  const w = (i) => `${u[i].label} · ${u[i].meta}`;
  return [
    chapter({ id: 'prompting', scene: 'aaa-prompt', len: 240, eyebrow: w(0), title: 'Prompts are programs. Write them like one.',
      lede: 'The evolution of AI and today’s model ecosystem; your GitHub, LinkedIn and AI learning workflow; prompt anatomy, structured and reasoning prompts, APIs and sandboxes — then token, cost and context optimisation.',
      steps: ['Assemble role, context and constraints', 'Specify an exact output format', 'Compress tokens without losing quality', 'Test across ChatGPT, Claude, Gemini &amp; Perplexity'], topics: ['Zero / few-shot', 'Chain of Draft', 'Prompt injection', 'API keys & rate limits', 'Groq · OpenRouter', 'Context pruning'], stage: promptStage() }),
    chapter({ id: 'mcp', scene: 'aaa-mcp', len: 260, flip: true, eyebrow: w(1), title: 'Give your AI hands — safely.',
      lede: 'The Model Context Protocol end to end — clients, servers, tools, resources, prompts and transports — with Claude Desktop and real MCP servers; your first agent workflow; then agentic AI: the agent loop, memory, architecture, multi-agent design and guardrails.',
      steps: ['Connect a host to MCP servers', 'Call tools over JSON-RPC', 'Run the agent loop', 'Decide the level of human oversight'], topics: ['MCP vs APIs', 'MCP security', 'Assistant vs copilot vs agent', 'Working memory', 'Delegation', 'Guardrails'], stage: mcpStage() }),
    chapter({ id: 'rag', scene: 'aaa-rag', len: 260, eyebrow: w(2), title: 'Knowledge your agents can cite.',
      lede: 'Dify, n8n, CrewAI and Zapier compared and built; then RAG from first principles — ingestion, OCR, chunking, embeddings, vector databases, hybrid and top-k retrieval, grounded answers with citations — and a production-style RAG assistant.',
      steps: ['Pick the right no-code platform', 'Chunk documents with overlap', 'Retrieve the top-k chunks', 'Answer with citations'], topics: ['Triggers & nodes', 'Knowledge bases', 'ChromaDB · Pinecone · Qdrant', 'Semantic vs keyword', 'Agentic & Graph RAG', 'Major Project 1'], stage: ragStage() }),
    chapter({ id: 'ugc', scene: 'aaa-ugc', len: 260, flip: true, eyebrow: w(3), title: 'One product in. A content factory out.',
      lede: 'End-to-end intelligent automation that combines RAG, web search and APIs — then AI UGC: strategy, PAS/AIDA/BAB scripts, avatars, voice, video and editing, and an automated content factory that ships platform-ready packages.',
      steps: ['Start from a single product', 'Research and script with frameworks', 'Generate prompts, captions and thumbnails', 'Publish for every platform — responsibly'], topics: ['Lead qualification', 'Hooks & CTAs', 'Voice cloning', 'Image-to-video', 'Batch creation', 'AI disclosure'], stage: ugcStage() }),
    chapter({ id: 'app', scene: 'aaa-app', len: 240, eyebrow: w(4), title: 'From prompt to production app.',
      lede: 'AI app builders — Lovable, Bolt, Replit AI, v0, Cursor and more — app architecture, Supabase and Firebase, deployment and GitHub; then wiring an app to Dify, n8n, Zapier or CrewAI through JSON, APIs and webhooks.',
      steps: ['Describe the app in a prompt', 'Generate and deploy it', 'Send user input to a workflow', 'Return AI results to the interface'], topics: ['AI SDLC', 'Frontend · backend · auth', 'MVP planning', 'JSON requests', 'Error handling', 'Major Project'], stage: appStage() }),
    chapter({ id: 'openclaw', scene: 'aaa-claw', len: 280, flip: true, eyebrow: w(5), title: 'A production agent that never clocks off.',
      lede: 'OpenClaw from install to production: gateway, runtime and LLM providers, Telegram and Discord channels, workspace identity files, skills and browser automation, cron and heartbeats, Bitwarden secrets and Zapier MCP.',
      steps: ['Shape identity with workspace files', 'Talk to it on Telegram', 'Schedule heartbeats &amp; cron jobs', 'Automate the browser, securely'], topics: ['SOUL.md · MEMORY.md', 'Web UI vs TUI', 'Skill discovery', 'Form filling', 'Agent permissions', 'Final Major Project'], stage: clawStage() }),
  ].join('\n');
}
