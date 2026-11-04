/** Small animated SVG emblems, one per program (used on cards, menus, brochures). */
export function programViz(key) {
  switch (key) {
    case 'da': return `<svg class="pviz pviz--da" viewBox="0 0 320 180" aria-hidden="true">
      <g class="pviz__grid">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${8 + c * 38}" y="${8 + r * 28}" width="34" height="24" rx="3"/>`).join('')).join('')}</g>
      <g class="pviz__bars">${[62, 94, 78, 120, 104, 140, 128].map((h, i) => `<rect style="--i:${i}" x="${30 + i * 38}" y="${170 - h}" width="22" height="${h}" rx="4"/>`).join('')}</g>
      <path class="pviz__line" d="M41 120 L79 96 L117 108 L155 70 L193 82 L231 44 L269 56"/>
      ${[[41, 120], [79, 96], [117, 108], [155, 70], [193, 82], [231, 44], [269, 56]].map(([x, y], i) => `<circle style="--i:${i}" class="pviz__pt" cx="${x}" cy="${y}" r="4"/>`).join('')}
    </svg>`;
    case 'ds': {
      const C = [[80, 60, 0], [220, 52, 1], [150, 130, 2]];
      let dots = '', seed = 7;
      const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      C.forEach(([cx, cy, k]) => { for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 34; dots += `<circle class="pviz__d pviz__d--${k}" style="--i:${i}" cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.8).toFixed(1)}" r="3"/>`; } });
      return `<svg class="pviz pviz--ds" viewBox="0 0 320 180" aria-hidden="true">${dots}
        ${C.map(([cx, cy, k]) => `<circle class="pviz__ring pviz__ring--${k}" cx="${cx}" cy="${cy}" r="42"/><circle class="pviz__c pviz__c--${k}" cx="${cx}" cy="${cy}" r="6"/>`).join('')}
        <path class="pviz__curve" d="M10 172 C 90 172, 110 20, 160 20 S 230 172, 310 172"/></svg>`;
    }
    case 'aiml': {
      const L = [3, 5, 5, 2], xs = [40, 120, 200, 280];
      const nodes = L.map((n, l) => Array.from({ length: n }, (_, j) => [xs[l], 90 + (j - (n - 1) / 2) * 32]));
      let edges = '';
      for (let l = 0; l < L.length - 1; l++) nodes[l].forEach(([x1, y1]) => nodes[l + 1].forEach(([x2, y2]) => { edges += `<path class="pviz__e" d="M${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}"/>`; }));
      return `<svg class="pviz pviz--aiml" viewBox="0 0 320 180" aria-hidden="true"><g>${edges}</g>${nodes.flat().map(([x, y], i) => `<circle class="pviz__n" style="--i:${i}" cx="${x}" cy="${y}" r="7"/>`).join('')}</svg>`;
    }
    case 'aaa': return `<svg class="pviz pviz--aaa" viewBox="0 0 320 180" aria-hidden="true">
      <path class="pviz__w" d="M58 90 C 100 90, 100 50, 150 50"/><path class="pviz__w" d="M58 90 C 100 90, 100 130, 150 130"/>
      <path class="pviz__w" d="M190 50 C 230 50, 230 90, 262 90"/><path class="pviz__w" d="M190 130 C 230 130, 230 90, 262 90"/>
      <rect class="pviz__node pviz__node--t" x="18" y="72" width="40" height="36" rx="10"/>
      <rect class="pviz__node pviz__node--a" x="150" y="30" width="40" height="40" rx="12"/>
      <rect class="pviz__node pviz__node--k" x="150" y="110" width="40" height="40" rx="12"/>
      <rect class="pviz__node pviz__node--o" x="262" y="72" width="40" height="36" rx="10"/>
      <circle class="pviz__pk" r="4"><animateMotion dur="2.6s" repeatCount="indefinite" path="M58 90 C 100 90, 100 50, 150 50"/></circle>
      <circle class="pviz__pk" r="4"><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path="M190 130 C 230 130, 230 90, 262 90"/></circle>
      <text x="38" y="95" text-anchor="middle">⚡</text><text x="170" y="55" text-anchor="middle">✦</text><text x="170" y="135" text-anchor="middle">⌘</text><text x="282" y="95" text-anchor="middle">➜</text>
    </svg>`;
    default: return '';
  }
}
