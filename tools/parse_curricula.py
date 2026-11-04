"""Parse the four NeuralVarsity curriculum .docx files into structured JSON.

Usage: python3 -I tools/parse_curricula.py <uploads_dir> <out_dir>
Every week/day/topic/detail from the source documents is preserved.
"""
import docx, re, json, sys, html
from docx.table import Table
from docx.text.paragraph import Paragraph

import glob, os
SRC, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2]
# Files are matched by keyword, so renamed or updated documents still work.
PATTERNS = {'da': 'Data_Analyst', 'ds': 'Data_Science', 'aiml': 'AIML', 'aaa': 'AAA'}
FILES = {}
for key, kw in PATTERNS.items():
    hits = sorted(f for f in glob.glob(SRC + '*.docx') if kw.lower() in os.path.basename(f).lower())
    if not hits:
        sys.exit(f'No .docx containing "{kw}" found in {SRC}')
    FILES[key] = os.path.basename(hits[-1])

MATH = {
    r'$\alpha$': 'α', r'$\beta$': 'β', r'$\epsilon$': 'ε', r'$\sigma$': 'σ',
    r'$\hat{y} = \beta_0 + \beta_1 x_1 + \dots + \beta_n x_n$': 'ŷ = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + … + β<sub>n</sub>x<sub>n</sub>',
    r'$\hat{y} = \beta_0 + \beta_1 x_1$': 'ŷ = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub>',
    r'$\text{H}_0$': 'H<sub>0</sub>', r'$\text{H}_a$': 'H<sub>a</sub>',
    r'$O(1)$': 'O(1)', r'$O(N \log N)$': 'O(N log N)', r'$O(N)$': 'O(N)', r'$O(N^2)$': 'O(N<sup>2</sup>)',
    r'$O(\log N)$': 'O(log N)', r'$O(\log n)$': 'O(log n)', r'$O(n)$': 'O(n)', r'$O(n^2)$': 'O(n<sup>2</sup>)',
    r'$Q1 - 1.5 \text{ IQR}$': 'Q1 − 1.5 × IQR', r'$Q3 + 1.5 \text{ IQR}$': 'Q3 + 1.5 × IQR',
    r'$QK^T$': 'QK<sup>T</sup>', r'$R^2$': 'R<sup>2</sup>', r'$SE = \sigma/\sqrt{n}$': 'SE = σ/√n',
    r'$\hat{y} = \sigma(w^T x + b)$': 'ŷ = σ(w<sup>T</sup>x + b)',
    r'$\lfloor (W - K + 2P) / S \rfloor + 1$': '⌊(W − K + 2P) / S⌋ + 1',
    r'$\mathcal{O}(n \cdot p)$': 'O(n · p)', r'$\sigma(z) = 1/(1 + e^{-z})$': 'σ(z) = 1/(1 + e<sup>−z</sup>)',
    r'$\text{Attention}(Q, K, V) = \text{softmax}(QK^T / \sqrt{d_k})V$': 'Attention(Q, K, V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>)V',
    r'$f_t$': 'f<sub>t</sub>',
}

def esc(s):
    return html.escape(s, quote=False)

def fix(s):
    """Escape for HTML and convert inline math."""
    s = esc(s)
    for k, v in MATH.items():
        s = s.replace(esc(k), v)
    s = s.replace(' ', ' ')
    return re.sub(r'[ \t]+', ' ', s).strip()

def runs_html(p):
    """Paragraph runs -> HTML, preserving bold emphasis."""
    out, buf, bold = [], '', None
    for r in p.runs:
        b = bool(r.bold)
        if bold is None: bold = b
        if b != bold:
            out.append((bold, buf)); buf = ''; bold = b
        buf += r.text
    if buf: out.append((bold, buf))
    raw = ''
    for b, t in out:
        # keep math markers intact across bold boundaries
        raw += ('\u0001' + t + '\u0002') if b else t
    s = fix(raw)
    s = s.replace('\u0001', '<strong>').replace('\u0002', '</strong>')
    s = re.sub(r'<strong>\s*</strong>', '', s)
    s = re.sub(r'</strong>(\s*)<strong>', r'\1', s)
    return s

def plain(s):
    return re.sub(r'<[^>]+>', '', s)

def iter_blocks(d):
    for child in d.element.body.iterchildren():
        tag = child.tag.split('}')[1]
        if tag == 'p':
            yield 'p', Paragraph(child, d)
        elif tag == 'tbl':
            yield 't', Table(child, d)

def row_cells(row):
    cells, prev = [], None
    for c in row.cells:
        if c._tc is prev: continue
        prev = c._tc
        cells.append(c)
    return cells

LABEL_RE = re.compile(r'^(?:•\s*)?([^:]{2,96}?):\s+(.+)$', re.S)

def labelled(text_html):
    m = LABEL_RE.match(text_html)
    if m:
        lab = m.group(1).strip()
        if lab[0].isalpha() and '. ' not in lab and '<' not in lab and len(plain_text(lab)) <= 80:
            return {'label': lab, 'text': m.group(2).strip()}
    return {'label': None, 'text': re.sub(r'^•\s*', '', text_html).strip()}

def plain_text(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))

def num(s):
    m = re.search(r'(\d+)', s)
    return int(m.group(1)) if m else None

# ---------------- Data Analyst ----------------
def parse_da():
    d = docx.Document(SRC + FILES['da'])
    modules, current = [], {'title': 'Advanced Excel & Power Query', 'days': []}
    for kind, b in iter_blocks(d):
        if kind == 'p':
            t = b.text.strip()
            if t.startswith('Module:'):
                if current['days']: modules.append(current)
                current = {'title': t.split(':', 1)[1].strip(), 'days': []}
        else:
            for row in b.rows:
                cells = row_cells(row)
                if len(cells) < 4 or not re.match(r'^Day\s*\d+', cells[1].text.strip()): continue
                points = [labelled(fix(p.text)) for p in cells[3].paragraphs if p.text.strip()]
                current['days'].append({
                    'week': num(cells[0].text), 'day': num(cells[1].text),
                    'title': fix(cells[2].text), 'points': points,
                })
    if current['days']: modules.append(current)
    return {'modules': modules}

# ---------------- Data Science ----------------
def parse_ds():
    d = docx.Document(SRC + FILES['ds'])
    months, month, week = [], None, None
    for kind, b in iter_blocks(d):
        if kind == 'p':
            t = b.text.strip().lstrip('-').strip()
            if not t: continue
            mw = re.match(r'^Month (\d+) Week (\d+)(?: \(Week (\d+)\))?:\s*(.+)$', t)
            mm = re.match(r'^Month (\d+):\s*(.+)$', t)
            if mw:
                week = {'month': int(mw.group(1)), 'weekInMonth': int(mw.group(2)),
                        'week': int(mw.group(3) or mw.group(2)), 'title': fix(mw.group(4)), 'days': []}
                month['weeks'].append(week)
            elif mm:
                month = {'month': int(mm.group(1)), 'title': fix(mm.group(2)), 'weeks': []}
                months.append(month)
        else:
            for row in b.rows:
                cells = row_cells(row)
                if len(cells) < 3 or not re.match(r'^(\*\*)?Day\s*\d+', cells[0].text.strip()): continue
                body = ' '.join(runs_html(p) for p in cells[2].paragraphs if p.text.strip())
                week['days'].append({'day': num(cells[0].text), 'title': fix(cells[1].text), 'body': body})
    return {'months': months}

# ---------------- Applied AI & ML ----------------
def parse_aiml():
    d = docx.Document(SRC + FILES['aiml'])
    months, month = [], None
    for kind, b in iter_blocks(d):
        if kind == 'p':
            t = b.text.strip()
            mm = re.match(r'^Month (\d+):\s*(.+?)\s*\(Days (\d+)\D+(\d+)\)\s*$', t)
            if mm:
                month = {'month': int(mm.group(1)), 'title': fix(mm.group(2)),
                         'range': [int(mm.group(3)), int(mm.group(4))], 'days': []}
                months.append(month)
        else:
            for row in b.rows:
                cells = row_cells(row)
                if len(cells) < 3 or not re.match(r'^Day\s*\d+', cells[0].text.strip()): continue
                titles = [fix(p.text) for p in cells[1].paragraphs if p.text.strip()]
                # Editorial: source labels capstones with mismatched month numbers; keep the descriptive name.
                titles = [re.sub(r'^Month \d+ Capstone:\s*', 'Capstone: ', t) for t in titles]
                points = [labelled(fix(p.text)) for p in cells[2].paragraphs if p.text.strip()]
                month['days'].append({'day': num(cells[0].text), 'titles': titles, 'points': points})
    return {'months': months}

# ---------------- AI Agents & Automation ----------------
SEG_SPLIT = re.compile(r'(?<=[.)])\s+(?=[A-Z][A-Za-z0-9&;()’\'\-/ ,–—+]{2,90}?:\s)')

def segments(text_html):
    parts = [p.strip() for p in SEG_SPLIT.split(text_html) if p.strip()]
    return [labelled(p) for p in parts]

def parse_aaa():
    d = docx.Document(SRC + FILES['aaa'])
    weeks, week = [], None
    for kind, b in iter_blocks(d):
        if kind == 'p':
            t = b.text.strip()
            mw = re.match(r'^WEEK (\d+)\s*[—-]\s*(.+)$', t)
            if mw:
                week = {'week': int(mw.group(1)), 'title': fix(mw.group(2)), 'days': []}
                weeks.append(week)
        else:
            for row in b.rows:
                cells = row_cells(row)
                if len(cells) < 4 or not re.match(r'^Day\s*\d+', cells[0].text.strip()): continue
                topics = fix(' '.join(p.text.strip() for p in cells[1].paragraphs if p.text.strip()))
                project = fix(' '.join(p.text.strip() for p in cells[2].paragraphs if p.text.strip()))
                dl = fix(' '.join(p.text.strip() for p in cells[3].paragraphs if p.text.strip()))
                m = re.match(r'^Deliverables?:\s*(.+?)\s*Assessment:\s*(.+)$', dl, re.S)
                deliverables, assessment = (m.group(1), m.group(2)) if m else (dl, '')
                # Project title: text before the first colon if it is a short heading
                pm = re.match(r'^([^:]{3,90}):\s*(.+)$', project, re.S)
                ptitle, pbody = (pm.group(1).strip(), pm.group(2).strip()) if pm else ('', project)
                dn = num(cells[0].text)
                week['days'].append({
                    'day': dn, 'session': (week['week'] - 1) * 6 + dn,
                    'topics': segments(topics), 'topicsRaw': topics,
                    'project': {'title': ptitle, 'text': pbody},
                    'deliverables': [x.strip().rstrip('.') for x in re.split(r',\s*(?![^()]*\))', deliverables.rstrip('.')) if x.strip()],
                    'assessment': assessment.rstrip('.'),
                })
    return {'weeks': weeks}

data = {'da': parse_da(), 'ds': parse_ds(), 'aiml': parse_aiml(), 'aaa': parse_aaa()}
for k, v in data.items():
    with open(f'{OUT}/{k}.json', 'w', encoding='utf-8') as f:
        json.dump(v, f, ensure_ascii=False, indent=1)

# ---- Report ----
da = data['da']['modules']; print('DA modules', len(da), [ (m['title'], len(m['days'])) for m in da ], 'days', sum(len(m['days']) for m in da))
ds = data['ds']['months']; print('DS months', len(ds), [ (m['title'][:30], sum(len(w['days']) for w in m['weeks'])) for m in ds ])
ai = data['aiml']['months']; print('AIML months', len(ai), [ (m['title'][:30], len(m['days'])) for m in ai ])
aa = data['aaa']['weeks']; print('AAA weeks', len(aa), [ (w['title'][:30], len(w['days'])) for w in aa ])
import itertools
alltext = json.dumps(data, ensure_ascii=False)
print('leftover $:', alltext.count('$'))
