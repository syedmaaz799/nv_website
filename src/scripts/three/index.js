/* NeuralVarsity 3D scenes (Three.js). Exposes window.NV3D. Loaded only on pages that need WebGL. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, Points, ShaderMaterial,
  AdditiveBlending, NormalBlending, Color, Vector2, Vector3, Group, Raycaster, Plane, LineSegments, LineBasicMaterial,
  Line, Mesh, PlaneGeometry, SphereGeometry, MeshBasicMaterial, Fog, DoubleSide,
} from 'three';

const DPR = () => Math.min(window.devicePixelRatio || 1, 1.75);
const isSmall = () => window.innerWidth < 760;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const hex = (h) => new Color(h);

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}

/* ================================================================== */
/*  Base stage: renderer + camera + resize + visibility-aware loop     */
/* ================================================================== */
class Stage {
  constructor(container, { fov = 42, z = 8, alpha = true } = {}) {
    this.container = container;
    this.renderer = new WebGLRenderer({ antialias: false, alpha, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(DPR());
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(this.canvas);
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, z);
    this.mouse = new Vector2(0, 0);
    this.mouseS = new Vector2(0, 0);
    this.visible = true;
    this.running = false;
    this.t = 0;
    this._last = performance.now();
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    window.addEventListener('pointermove', (e) => {
      this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this.pointerActive = true;
    }, { passive: true });
    this.io = new IntersectionObserver((ents) => { this.visible = ents[0].isIntersecting; if (this.visible) this.start(); }, { rootMargin: '120px' });
    this.io.observe(container);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.start(); });
  }
  resize() {
    const w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight;
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%'; this.canvas.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.onResize && this.onResize(w, h);
  }
  start() { if (!this.running) { this.running = true; this._last = performance.now(); requestAnimationFrame(this.loop); } }
  loop(now) {
    if (!this.visible || document.hidden) { this.running = false; return; }
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now; this.t += dt;
    this.mouseS.lerp(this.mouse, 1 - Math.pow(0.001, dt));
    this.update && this.update(dt, this.t);
    if (this.halt) { this.halt = false; this.running = false; return; }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }
}

/* ================================================================== */
/*  Shape library for the particle morph (all fit in radius ≈ 2.4)     */
/* ================================================================== */
const PAL = {
  brand: ['#3fd5e0', '#8de6c4', '#f5b544'],
  da: ['#3ee08f', '#3fd5e0', '#b6f37a'],
  ds: ['#4aa8ff', '#8b7cff', '#5fe1e8', '#c7b8ff'],
  aiml: ['#a685ff', '#f472d0', '#7c8cff'],
  aaa: ['#f5b544', '#ff7a59', '#ffd98a'],
};
function colorize(N, col, fn) { const c = new Color(); for (let i = 0; i < N; i++) { fn(i, c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } }
const lerpCol = (a, b, t, out) => out.copy(hex(a)).lerp(hex(b), t);

export const SHAPES = {
  sphere(N, pal = PAL.brand) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const inner = i % 7 === 0;
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
      const R = inner ? rand(0.4, 1.7) : 2.05 + 0.12 * Math.sin(th * 3.1 + y * 7) + gauss() * 0.03;
      pos[i * 3] = Math.cos(th) * r * R; pos[i * 3 + 1] = y * R; pos[i * 3 + 2] = Math.sin(th) * r * R;
    }
    colorize(N, col, (i, c) => { const t = (pos[i * 3 + 1] / 2.2 + 1) / 2; t < 0.5 ? lerpCol(pal[0], pal[1], t * 2, c) : lerpCol(pal[1], pal[2], (t - 0.5) * 2, c); });
    return { pos, col };
  },
  cloud(N, pal = PAL.ds) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = gauss() * 1.6; pos[i * 3 + 1] = gauss() * 1.1; pos[i * 3 + 2] = gauss() * 1.2; }
    colorize(N, col, (i, c) => lerpCol(pal[0], pal[1], Math.random(), c));
    return { pos, col };
  },
  bars(N, pal = PAL.da) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const cols = 7, rows = 4, H = [0.9, 1.5, 1.2, 2.2, 1.8, 2.8, 3.3, 0.7, 1.1, 1.6, 1.4, 2.4, 2.0, 2.6, 0.5, 0.9, 1.3, 1.0, 1.7, 1.5, 2.1, 0.4, 0.6, 0.8, 0.7, 1.2, 1.1, 1.4];
    for (let i = 0; i < N; i++) {
      const b = i % (cols * rows), cx = b % cols, cz = Math.floor(b / cols), h = H[b] * 0.95;
      const x0 = (cx - (cols - 1) / 2) * 0.62, z0 = (cz - (rows - 1) / 2) * 0.62, w = 0.21;
      const face = Math.floor(Math.random() * 5), u = rand(-w, w), v = Math.random();
      let x = x0, y = -1.6 + v * h, z = z0;
      if (face === 0) { x += -w; z += u; } else if (face === 1) { x += w; z += u; } else if (face === 2) { z += -w; x += u; } else if (face === 3) { z += w; x += u; } else { y = -1.6 + h; x += u; z += rand(-w, w); }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    colorize(N, col, (i, c) => { const t = Math.min(1, (pos[i * 3 + 1] + 1.6) / 3); lerpCol(pal[1], pal[0], t, c); if (t > 0.85) c.lerp(hex(pal[2]), 0.5); });
    return { pos, col };
  },
  table(N, pal = PAL.ds) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const R = 9, C = 6;
    for (let i = 0; i < N; i++) {
      const r = Math.floor(Math.random() * R), c = Math.floor(Math.random() * C);
      const edge = Math.random() < 0.55;
      let x = (c - (C - 1) / 2) * 0.72, y = ((R - 1) / 2 - r) * 0.38;
      if (edge) { if (Math.random() < 0.5) { x += rand(-0.36, 0.36); y += 0.19 * (Math.random() < 0.5 ? -1 : 1); } else { x += 0.36 * (Math.random() < 0.5 ? -1 : 1); y += rand(-0.19, 0.19); } }
      else { x += rand(-0.22, 0.22); y += rand(-0.05, 0.05); }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = gauss() * 0.04 + (r === 0 ? 0.15 : 0);
    }
    colorize(N, col, (i, c) => { const header = pos[i * 3 + 1] > 1.35; lerpCol(pal[0], header ? pal[3] : pal[2], header ? 1 : Math.random() * 0.6, c); });
    return { pos, col };
  },
  bell(N, pal = PAL.ds) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const x = rand(-2.6, 2.6), z = rand(-2.0, 2.0);
      const y = 2.6 * Math.exp(-(x * x) / (2 * 0.75 * 0.75)) * Math.exp(-(z * z) / (2 * 1.1 * 1.1)) - 1.3;
      pos[i * 3] = x; pos[i * 3 + 1] = y + gauss() * 0.02; pos[i * 3 + 2] = z;
    }
    colorize(N, col, (i, c) => lerpCol(pal[1], pal[2], Math.min(1, (pos[i * 3 + 1] + 1.3) / 2.6), c));
    return { pos, col };
  },
  clusters(N, pal = PAL.ds) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const C = [[-1.5, 0.8, 0.3], [1.4, 1.0, -0.4], [-0.6, -1.2, -0.5], [1.3, -0.9, 0.6]];
    const k = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const j = i % 4; k[i] = j; const s = j === 2 ? 0.5 : 0.42;
      pos[i * 3] = C[j][0] + gauss() * s; pos[i * 3 + 1] = C[j][1] + gauss() * s; pos[i * 3 + 2] = C[j][2] + gauss() * s;
    }
    colorize(N, col, (i, c) => c.copy(hex(pal[k[i] % pal.length])));
    return { pos, col };
  },
  network(N, pal = PAL.aiml) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const L = [5, 8, 10, 8, 4], nodes = [];
    L.forEach((n, l) => { for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2, rr = 0.35 + n * 0.12; nodes.push({ l, x: (l - 2) * 1.15, y: Math.cos(a) * rr, z: Math.sin(a) * rr }); } });
    const byL = L.map((_, l) => nodes.filter((n) => n.l === l));
    for (let i = 0; i < N; i++) {
      if (Math.random() < 0.42) { const n = nodes[Math.floor(Math.random() * nodes.length)]; pos[i * 3] = n.x + gauss() * 0.06; pos[i * 3 + 1] = n.y + gauss() * 0.06; pos[i * 3 + 2] = n.z + gauss() * 0.06; }
      else { const l = Math.floor(Math.random() * (L.length - 1)); const a = byL[l][Math.floor(Math.random() * byL[l].length)], b = byL[l + 1][Math.floor(Math.random() * byL[l + 1].length)]; const t = Math.random(); pos[i * 3] = a.x + (b.x - a.x) * t; pos[i * 3 + 1] = a.y + (b.y - a.y) * t; pos[i * 3 + 2] = a.z + (b.z - a.z) * t; }
    }
    colorize(N, col, (i, c) => lerpCol(pal[0], pal[1], (pos[i * 3] + 2.4) / 4.8, c));
    return { pos, col };
  },
  orbits(N, pal = PAL.aaa) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const rings = [{ r: 1.35, tx: 1.1, tz: 0.2 }, { r: 1.9, tx: -0.6, tz: 0.9 }, { r: 2.4, tx: 0.25, tz: -0.7 }];
    const tag = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const m = Math.random(); let x, y, z;
      if (m < 0.28) { const v = new Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(Math.cbrt(Math.random()) * 0.6); x = v.x; y = v.y; z = v.z; tag[i] = 0; }
      else {
        const R = rings[Math.floor(Math.random() * 3)], a = Math.random() < 0.35 ? Math.floor(Math.random() * 5) * (Math.PI * 2 / 5) + gauss() * 0.05 : Math.random() * Math.PI * 2;
        const node = Math.random() < 0.35;
        let px = Math.cos(a) * R.r, py = 0, pz = Math.sin(a) * R.r;
        if (node) { px += gauss() * 0.07; py += gauss() * 0.07; pz += gauss() * 0.07; }
        const cy = Math.cos(R.tx), sy = Math.sin(R.tx), cz = Math.cos(R.tz), sz = Math.sin(R.tz);
        let y1 = py * cy - pz * sy, z1 = py * sy + pz * cy; let x2 = px * cz - y1 * sz, y2 = px * sz + y1 * cz;
        x = x2; y = y2; z = z1; tag[i] = node ? 2 : 1;
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    colorize(N, col, (i, c) => c.copy(hex(tag[i] === 0 ? pal[2] : tag[i] === 2 ? pal[0] : pal[1])));
    return { pos, col };
  },
  text(N, pal = PAL.ds, word = 'GenAI') {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 220;
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.font = '700 170px Sora, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 320, 118);
    const data = g.getImageData(0, 0, 640, 220).data, pts = [];
    for (let y = 0; y < 220; y += 2) for (let x = 0; x < 640; x += 2) if (data[(y * 640 + x) * 4 + 3] > 140) pts.push([x, y]);
    for (let i = 0; i < N; i++) { const p = pts[Math.floor(Math.random() * pts.length)] || [320, 110]; pos[i * 3] = (p[0] - 320) / 120 + rand(-0.01, 0.01); pos[i * 3 + 1] = -(p[1] - 110) / 120; pos[i * 3 + 2] = gauss() * 0.08; }
    colorize(N, col, (i, c) => lerpCol(pal[0], pal[1], (pos[i * 3] + 2.6) / 5.2, c));
    return { pos, col };
  },
};

/* ================================================================== */
/*  ParticleMorph                                                      */
/* ================================================================== */
const morphVert = /* glsl */`
  uniform float uTime, uMorph, uSize, uPR, uMouseF, uSwirl;
  uniform vec3 uMouse;
  attribute vec3 aFrom, aTo, aColFrom, aColTo;
  attribute vec4 aRand;
  varying vec3 vColor; varying float vAlpha;
  float ease(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
  void main(){
    float d = aRand.x * .38;
    float t = ease(clamp((uMorph - d) / .62, 0., 1.));
    vec3 p = mix(aFrom, aTo, t);
    float mid = sin(t * 3.14159265);
    vec3 dir = normalize(p + vec3(.0001, .0002, .0003));
    p += dir * mid * uSwirl * (.4 + aRand.z);
    p.xz += vec2(-p.z, p.x) * mid * .18 * uSwirl;
    p += vec3(sin(uTime * .7 + aRand.z * 31.), cos(uTime * .6 + aRand.w * 27.), sin(uTime * .5 + aRand.w * 19.)) * .022;
    vec3 tm = p - uMouse; float dist = length(tm);
    p += normalize(tm + vec3(.0001)) * smoothstep(1.1, 0., dist) * uMouseF * .55;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (.55 + aRand.y * .9) * uPR / -mv.z;
    vColor = mix(aColFrom, aColTo, t);
    vAlpha = .45 + .55 * aRand.y;
  }`;
const morphFrag = /* glsl */`
  uniform float uOpacity;
  varying vec3 vColor; varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - .5);
    float a = smoothstep(.5, .05, d);
    gl_FragColor = vec4(vColor * (1. + .6 * smoothstep(.22, 0., d)), a * a * vAlpha * uOpacity);
  }`;

export class ParticleMorph extends Stage {
  /** @param shapes Array<{pos,col}> */
  constructor(container, { shapes, count, size = 34, mouse = true, layouts } = {}) {
    super(container, { fov: 40, z: 9 });
    this.N = count || (isSmall() ? 5200 : 12000);
    this.shapeFns = shapes;
    this.shapes = shapes.map((fn) => fn(this.N));
    this.layouts = layouts; // optional [{x,y,s}] per shape
    const geo = new BufferGeometry();
    const r = new Float32Array(this.N * 4);
    for (let i = 0; i < this.N * 4; i++) r[i] = Math.random();
    this.aFrom = new BufferAttribute(this.shapes[0].pos.slice(), 3);
    this.aTo = new BufferAttribute(this.shapes[Math.min(1, this.shapes.length - 1)].pos.slice(), 3);
    this.cFrom = new BufferAttribute(this.shapes[0].col.slice(), 3);
    this.cTo = new BufferAttribute(this.shapes[Math.min(1, this.shapes.length - 1)].col.slice(), 3);
    geo.setAttribute('position', new BufferAttribute(this.shapes[0].pos.slice(), 3));
    geo.setAttribute('aFrom', this.aFrom); geo.setAttribute('aTo', this.aTo);
    geo.setAttribute('aColFrom', this.cFrom); geo.setAttribute('aColTo', this.cTo);
    geo.setAttribute('aRand', new BufferAttribute(r, 4));
    this.uniforms = {
      uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: size }, uPR: { value: DPR() }, uOpacity: { value: 0 },
      uMouse: { value: new Vector3(99, 99, 0) }, uMouseF: { value: mouse ? 1 : 0 }, uSwirl: { value: 0.6 },
    };
    this.mat = new ShaderMaterial({ vertexShader: morphVert, fragmentShader: morphFrag, uniforms: this.uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.points = new Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.group = new Group();
    this.group.add(this.points);
    this.scene.add(this.group);
    this.seg = 0; this.target = 0; this.progress = 0;
    this.layout = { x: 0, y: 0, s: 1 };
    this.layoutTarget = { x: 0, y: 0, s: 1 };
    this.ray = new Raycaster(); this.plane = new Plane(new Vector3(0, 0, 1), 0); this.hit = new Vector3();
    this.fade = 0; this.fadeTarget = 1;
    this.start();
  }
  /** p ∈ [0, shapes-1] */
  setProgress(p) { this.target = Math.max(0, Math.min(this.shapes.length - 1, p)); }
  setLayout(l) { Object.assign(this.layoutTarget, l); }
  setOpacity(o) {
    this.fadeTarget = o;
    if (o > 0) { this.canvas.style.visibility = ''; this.start(); }
  }
  _applySeg(i) {
    const a = this.shapes[i], b = this.shapes[Math.min(i + 1, this.shapes.length - 1)];
    this.aFrom.array.set(a.pos); this.aTo.array.set(b.pos); this.cFrom.array.set(a.col); this.cTo.array.set(b.col);
    this.aFrom.needsUpdate = this.aTo.needsUpdate = this.cFrom.needsUpdate = this.cTo.needsUpdate = true;
    this.seg = i;
  }
  update(dt, t) {
    this.progress += (this.target - this.progress) * (1 - Math.pow(0.0008, dt));
    if (Math.abs(this.target - this.progress) < 0.0005) this.progress = this.target;
    let i = Math.min(Math.floor(this.progress), this.shapes.length - 2);
    if (i < 0) i = 0;
    if (i !== this.seg) this._applySeg(i);
    const local = this.shapes.length > 1 ? this.progress - i : 0;
    this.uniforms.uMorph.value = local;
    this.uniforms.uTime.value = t;
    this.fade += (this.fadeTarget - this.fade) * (1 - Math.pow(0.02, dt));
    this.uniforms.uOpacity.value = this.fade;
    // Fully faded out: hide the canvas and stop the render loop until needed again.
    if (this.fadeTarget === 0 && this.fade < 0.004) { this.fade = 0; this.canvas.style.visibility = 'hidden'; this.halt = true; }
    // layout per shape (interpolated)
    if (this.layouts) {
      const A = this.layouts[i] || this.layouts[0], B = this.layouts[Math.min(i + 1, this.layouts.length - 1)] || A;
      const e = local * local * (3 - 2 * local);
      this.layoutTarget = { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e, s: A.s + (B.s - A.s) * e };
    }
    const k = 1 - Math.pow(0.002, dt);
    this.layout.x += (this.layoutTarget.x - this.layout.x) * k;
    this.layout.y += (this.layoutTarget.y - this.layout.y) * k;
    this.layout.s += (this.layoutTarget.s - this.layout.s) * k;
    this.group.position.set(this.layout.x, this.layout.y, 0);
    this.group.scale.setScalar(this.layout.s);
    this.group.rotation.y += dt * 0.08;
    this.group.rotation.x += ((this.mouseS.y * 0.25) - this.group.rotation.x) * 0.04;
    this.points.rotation.z += ((-this.mouseS.x * 0.12) - this.points.rotation.z) * 0.04;
    // mouse in object space
    if (this.pointerActive) {
      this.ray.setFromCamera(this.mouseS, this.camera);
      if (this.ray.ray.intersectPlane(this.plane, this.hit)) this.uniforms.uMouse.value.copy(this.points.worldToLocal(this.hit.clone()));
    }
  }
}

/* ================================================================== */
/*  NeuralNet3D — glowing layered network with forward-pass pulses     */
/* ================================================================== */
const glowVert = /* glsl */`
  uniform float uSize, uPR, uTime; attribute vec3 color; attribute float aSize; varying vec3 vC;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aSize * uPR / -mv.z; vC = color; }`;
const glowFrag = /* glsl */`
  varying vec3 vC; void main(){ float d = length(gl_PointCoord - .5); float core = smoothstep(.18, .0, d); float halo = smoothstep(.5, .0, d) * .55; gl_FragColor = vec4(vC * (core * 1.6 + halo), (core + halo * halo)); }`;

export class NeuralNet3D extends Stage {
  constructor(container, { layers = [6, 10, 12, 10, 5], colors = ['#a685ff', '#f472d0'], pulses = 140 } = {}) {
    super(container, { fov: 38, z: 10 });
    this.group = new Group(); this.scene.add(this.group);
    const cA = hex(colors[0]), cB = hex(colors[1]);
    const nodes = [];
    layers.forEach((n, l) => {
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2 + l * 0.4, rr = 0.55 + n * 0.16;
        nodes.push({ l, j, p: new Vector3((l - (layers.length - 1) / 2) * 1.7, Math.cos(a) * rr, Math.sin(a) * rr) });
      }
    });
    this.nodes = nodes; this.layers = layers;
    this.byL = layers.map((_, l) => nodes.filter((n) => n.l === l));
    // nodes
    const np = new Float32Array(nodes.length * 3), nc = new Float32Array(nodes.length * 3), ns = new Float32Array(nodes.length);
    nodes.forEach((n, i) => { np.set([n.p.x, n.p.y, n.p.z], i * 3); const c = cA.clone().lerp(cB, n.l / (layers.length - 1)); nc.set([c.r, c.g, c.b], i * 3); ns[i] = 1; });
    const ng = new BufferGeometry(); ng.setAttribute('position', new BufferAttribute(np, 3)); ng.setAttribute('color', new BufferAttribute(nc, 3)); ng.setAttribute('aSize', new BufferAttribute(ns, 1));
    this.nodeSizes = ng.attributes.aSize;
    this.nodeMat = new ShaderMaterial({ vertexShader: glowVert, fragmentShader: glowFrag, uniforms: { uSize: { value: 150 }, uPR: { value: DPR() }, uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.group.add(new Points(ng, this.nodeMat));
    // edges
    const edges = [];
    for (let l = 0; l < layers.length - 1; l++) for (const a of this.byL[l]) for (const b of this.byL[l + 1]) edges.push([a, b]);
    this.edges = edges;
    const ep = new Float32Array(edges.length * 6), ec = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => { ep.set([a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z], i * 6); const ca = cA.clone().lerp(cB, a.l / (layers.length - 1)), cb = cA.clone().lerp(cB, b.l / (layers.length - 1)); ec.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], i * 6); });
    const eg = new BufferGeometry(); eg.setAttribute('position', new BufferAttribute(ep, 3)); eg.setAttribute('color', new BufferAttribute(ec, 3));
    this.edgeMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.13, blending: AdditiveBlending, depthWrite: false });
    this.group.add(new LineSegments(eg, this.edgeMat));
    // pulses
    this.P = pulses;
    this.pulses = Array.from({ length: pulses }, () => this._newPulse(true));
    const pp = new Float32Array(pulses * 3), pc = new Float32Array(pulses * 3), ps = new Float32Array(pulses).fill(0.55);
    const pg = new BufferGeometry(); pg.setAttribute('position', new BufferAttribute(pp, 3)); pg.setAttribute('color', new BufferAttribute(pc, 3)); pg.setAttribute('aSize', new BufferAttribute(ps, 1));
    this.pulseGeo = pg;
    this.group.add(new Points(pg, new ShaderMaterial({ vertexShader: glowVert, fragmentShader: glowFrag, uniforms: { uSize: { value: 90 }, uPR: { value: DPR() }, uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: AdditiveBlending })));
    this.cA = cA; this.cB = cB;
    this.zoom = 0; this.zoomT = 0;
    this.heat = new Float32Array(nodes.length);
    container.addEventListener('pointerdown', () => this.burst());
    this.start();
  }
  _newPulse(randomStart = false) {
    const l = randomStart ? Math.floor(Math.random() * (this.layers.length - 1)) : 0;
    const from = this.byL[l][Math.floor(Math.random() * this.byL[l].length)];
    const to = this.byL[l + 1][Math.floor(Math.random() * this.byL[l + 1].length)];
    return { from, to, t: randomStart ? Math.random() : 0, v: rand(0.45, 0.9) };
  }
  burst() { for (let i = 0; i < 40; i++) this.pulses[Math.floor(Math.random() * this.P)] = this._newPulse(false); }
  setProgress(p) { this.zoomT = p; }
  update(dt, t) {
    const pos = this.pulseGeo.attributes.position.array, col = this.pulseGeo.attributes.color.array;
    const c = new Color();
    this.pulses.forEach((pu, i) => {
      pu.t += dt * pu.v;
      if (pu.t >= 1) {
        const idx = this.nodes.indexOf(pu.to); if (idx >= 0) this.heat[idx] = 1;
        if (pu.to.l < this.layers.length - 1) { const nl = this.byL[pu.to.l + 1]; this.pulses[i] = { from: pu.to, to: nl[Math.floor(Math.random() * nl.length)], t: 0, v: pu.v }; }
        else this.pulses[i] = this._newPulse(false);
        pu = this.pulses[i];
      }
      const p = pu.from.p.clone().lerp(pu.to.p, pu.t);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      c.copy(this.cA).lerp(this.cB, (pu.from.l + pu.t) / (this.layers.length - 1)).multiplyScalar(1.2);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    });
    this.pulseGeo.attributes.position.needsUpdate = true; this.pulseGeo.attributes.color.needsUpdate = true;
    for (let i = 0; i < this.heat.length; i++) { this.heat[i] *= Math.pow(0.04, dt); this.nodeSizes.array[i] = 1 + this.heat[i] * 0.9; }
    this.nodeSizes.needsUpdate = true;
    this.zoom += (this.zoomT - this.zoom) * (1 - Math.pow(0.01, dt));
    this.group.rotation.y = t * 0.12 + this.mouseS.x * 0.45;
    this.group.rotation.x = -this.mouseS.y * 0.25 + Math.sin(t * 0.3) * 0.05;
    this.camera.position.z = 10 - this.zoom * 6.5;
    this.camera.position.x = this.zoom * 1.2;
    this.camera.lookAt(0, 0, 0);
  }
}

/* ================================================================== */
/*  LossLandscape — topographic surface + optimiser trajectories       */
/* ================================================================== */
export const lossF = (x, z) => 0.075 * (x * x + z * z) - 1.7 * Math.exp(-((x - 1.35) ** 2 + (z + 0.95) ** 2) / 0.95) - 0.95 * Math.exp(-((x + 1.45) ** 2 + (z - 1.15) ** 2) / 0.55) + 0.16 * Math.sin(1.7 * x) * Math.cos(1.5 * z);
const lossG = (x, z) => { const h = 1e-4; return [(lossF(x + h, z) - lossF(x - h, z)) / (2 * h), (lossF(x, z + h) - lossF(x, z - h)) / (2 * h)]; };
export function optimise(kind, steps = 240, x = -2.7, z = 2.5) {
  let vx = 0, vz = 0, mx = 0, mz = 0, sx = 0, sz = 0; const path = [[x, z]];
  for (let t = 1; t <= steps; t++) {
    const [gx, gz] = lossG(x, z);
    if (kind === 'sgd') { x -= 0.16 * gx; z -= 0.16 * gz; }
    else if (kind === 'momentum') { vx = 0.93 * vx + gx; vz = 0.93 * vz + gz; x -= 0.05 * vx; z -= 0.05 * vz; }
    else { mx = 0.9 * mx + 0.1 * gx; mz = 0.9 * mz + 0.1 * gz; sx = 0.999 * sx + 0.001 * gx * gx; sz = 0.999 * sz + 0.001 * gz * gz; const k = 0.06 / (1 - 0.9 ** t); x -= k * mx / (Math.sqrt(sx / (1 - 0.999 ** t)) + 1e-8); z -= k * mz / (Math.sqrt(sz / (1 - 0.999 ** t)) + 1e-8); }
    path.push([x, z]);
  }
  return path;
}

const landVert = /* glsl */`
  varying float vH; varying vec2 vXZ; uniform float uScale;
  void main(){ vH = position.y / uScale; vXZ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const landFrag = /* glsl */`
  varying float vH; varying vec2 vXZ; uniform vec3 uLow, uHigh, uLine;
  void main(){
    float h = clamp((vH + 1.5) / 2.6, 0., 1.);
    vec3 base = mix(uLow, uHigh, h) * .32;
    float v = vH * 7.;
    float fw = max(fwidth(v), 1e-4);
    float f = fract(v); float d = min(f, 1. - f);
    float line = 1. - smoothstep(0., fw * 1.5, d);
    vec2 gq = vXZ * 1.25;
    vec2 gd = abs(fract(gq - .5) - .5) / max(fwidth(gq), vec2(1e-4));
    float grid = 1. - min(min(gd.x, gd.y), 1.);
    float edge = smoothstep(4.2, 2.0, length(vXZ));
    vec3 col = base + mix(uLow, uLine, h) * line * 1.1 + vec3(.10) * grid;
    gl_FragColor = vec4(col, edge * (.32 + line * .6 + grid * .18));
  }`;

export class LossLandscape extends Stage {
  constructor(container, { colors = { low: '#7c8cff', high: '#f472d0', line: '#a685ff' }, steps = 240 } = {}) {
    super(container, { fov: 36, z: 9 });
    this.scale = 0.9;
    const geo = new PlaneGeometry(8.4, 8.4, 170, 170); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, lossF(p.getX(i), p.getZ(i)) * this.scale);
    geo.computeVertexNormals();
    this.land = new Mesh(geo, new ShaderMaterial({
      vertexShader: landVert, fragmentShader: landFrag, transparent: true, side: DoubleSide, depthWrite: false,
      uniforms: { uScale: { value: this.scale }, uLow: { value: hex(colors.low) }, uHigh: { value: hex(colors.high) }, uLine: { value: hex(colors.line) } },
    }));
    this.group = new Group(); this.group.add(this.land); this.scene.add(this.group);
    this.steps = steps;
    this.runs = [
      { kind: 'sgd', color: '#5fe1e8' }, { kind: 'adam', color: '#f5b544' }, { kind: 'momentum', color: '#f472d0' },
    ].map((r) => {
      const path = optimise(r.kind, steps);
      const pts = new Float32Array(path.length * 3);
      path.forEach(([x, z], i) => pts.set([x, lossF(x, z) * this.scale + 0.03, z], i * 3));
      const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pts, 3)); g.setDrawRange(0, 1);
      const line = new Line(g, new LineBasicMaterial({ color: r.color, transparent: true, opacity: 0.95 }));
      const ball = new Mesh(new SphereGeometry(0.085, 20, 14), new MeshBasicMaterial({ color: r.color }));
      const halo = new Points(new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(3), 3)).setAttribute('color', new BufferAttribute(new Float32Array(hex(r.color).toArray()), 3)).setAttribute('aSize', new BufferAttribute(new Float32Array([1]), 1)),
        new ShaderMaterial({ vertexShader: glowVert, fragmentShader: glowFrag, uniforms: { uSize: { value: 120 }, uPR: { value: DPR() }, uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: AdditiveBlending }));
      this.group.add(line, ball, halo);
      return { ...r, path, pts, g, ball, halo };
    });
    this.k = 0; this.kT = 0;
    this.group.rotation.y = -0.6;
    this.camera.position.set(0, 5.2, 7.6); this.camera.lookAt(0, -0.4, 0);
    this.start();
  }
  /** p ∈ [0,1] → optimisation step */
  setProgress(p) { this.kT = Math.max(0, Math.min(1, p)) * this.steps; }
  stepInfo() { const i = Math.round(this.k); return this.runs.map((r) => { const [x, z] = r.path[Math.min(i, r.path.length - 1)]; return { kind: r.kind, loss: lossF(x, z) }; }); }
  update(dt, t) {
    this.k += (this.kT - this.k) * (1 - Math.pow(0.003, dt));
    const i = Math.max(1, Math.round(this.k));
    for (const r of this.runs) {
      r.g.setDrawRange(0, Math.min(i + 1, r.path.length));
      const j = Math.min(i, r.path.length - 1);
      r.ball.position.set(r.pts[j * 3], r.pts[j * 3 + 1] + 0.06, r.pts[j * 3 + 2]);
      r.halo.position.copy(r.ball.position);
    }
    this.group.rotation.y = -0.6 + Math.sin(t * 0.15) * 0.25 + this.mouseS.x * 0.35;
    this.group.rotation.x = this.mouseS.y * 0.08;
    this.onStep && this.onStep(i);
  }
}

window.NV3D = { ParticleMorph, NeuralNet3D, LossLandscape, SHAPES, PAL, webglAvailable, lossF, optimise };
