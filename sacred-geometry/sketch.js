/*
 * Sacred Geometry — a compass-and-straightedge construction, animated.
 *
 * The show is the CONSTRUCTION, not the finished figure: a compass arm
 * sweeps each circle into place, stage by stage —
 *   I  the first circle       IV  flower of life (19 circles + ring)
 *   II vesica piscis           V  fruit of life (13 tangent circles)
 *   III seed of life           VI  Metatron's cube (all 78 chords)
 * Every petal circle is centred on an intersection of the ones before it,
 * and each sweep starts from the point nearest the shared centre — exactly
 * how you would draw it on paper. Finished stages dim so the new one reads.
 *
 * Space pause · R restart · ←/→ (or click) jump between stages. Loops.
 */

let R, CX, CY; // unit radius in px, canvas centre
let ops = []; // the construction timeline
let stageStarts = []; // start time (s) of each stage
let TOTAL = 0; // when the drawing is complete
let t = 0;
let paused = false;

const HOLD = 8; // seconds to hold the finished figure
const FADE = 1.4; // fade to black before looping

const STAGE_NAMES = [
  'I · THE FIRST CIRCLE',
  'II · VESICA PISCIS',
  'III · SEED OF LIFE',
  'IV · FLOWER OF LIFE',
  'V · FRUIT OF LIFE',
  "VI · METATRON'S CUBE",
];

function setup() {
  const s = constrain(min(windowWidth, windowHeight) - 30, 420, 760);
  const c = createCanvas(s, s);
  c.parent(document.querySelector('main'));
  colorMode(HSB, 360, 100, 100, 1);
  strokeCap(ROUND);
  computeScale();
  buildTimeline();
}

function windowResized() {
  const s = constrain(min(windowWidth, windowHeight) - 30, 420, 760);
  resizeCanvas(s, s);
  computeScale();
}

function computeScale() {
  R = width / 7.2; // flower spans 3R; leaves room for the caption
  CX = width / 2;
  CY = height / 2;
}

// ---------------------------------------------------------------------------
// Timeline: geometry is stored in units of R so resize costs nothing
// ---------------------------------------------------------------------------
function buildTimeline() {
  ops = [];
  stageStarts = [];
  let clock = 0;
  let stage = -1;

  const push = (op) => {
    op.start = clock;
    clock += op.dur;
    ops.push(op);
  };
  const beginStage = () => {
    stage++;
    stageStarts.push(clock);
  };
  const breath = (d) => push({ type: 'pause', dur: d });

  // hex-lattice centres (vesica sprouts from the top)
  const ring1 = [], ring2 = [], ringMid = [];
  for (let k = 0; k < 6; k++) {
    const a = -HALF_PI + (k * TWO_PI) / 6;
    ring1.push({ x: cos(a), y: sin(a) });
    ring2.push({ x: 2 * cos(a), y: 2 * sin(a) });
    const b = a + PI / 6;
    ringMid.push({ x: sqrt(3) * cos(b), y: sqrt(3) * sin(b) });
  }

  const circleOp = (cx, cy, r, dur) =>
    push({
      type: 'circle', cx, cy, r, dur, stage,
      // the pen starts on the point of the circle nearest the shared centre
      a0: cx === 0 && cy === 0 ? -HALF_PI : atan2(-cy, -cx),
      dir: ops.length % 2 ? -1 : 1,
    });

  // I — the first circle
  beginStage();
  circleOp(0, 0, 1, 1.7);
  breath(0.5);

  // II — vesica piscis: same radius, centred on the first circle's rim
  beginStage();
  circleOp(ring1[0].x, ring1[0].y, 1, 1.5);
  breath(0.6);

  // III — seed of life: walk the remaining intersections around the rim
  beginStage();
  for (let k = 1; k < 6; k++) circleOp(ring1[k].x, ring1[k].y, 1, 1.25 - k * 0.09);
  breath(0.6);

  // IV — flower of life: the two outer rings, interleaved walking around,
  // then the enclosing ring
  beginStage();
  const outer = [];
  for (let k = 0; k < 6; k++) {
    outer.push(ringMid[k]);
    outer.push(ring2[(k + 1) % 6]);
  }
  outer.forEach((p, i) => circleOp(p.x, p.y, 1, max(0.42, 0.8 - i * 0.035)));
  circleOp(0, 0, 3, 2.4);
  breath(0.8);

  // V — fruit of life: 13 tangent circles on the flower's own centres
  beginStage();
  const fruit = [{ x: 0, y: 0 }, ...ring1, ...ring2];
  fruit.forEach((p, i) => circleOp(p.x, p.y, 0.5, max(0.3, 0.55 - i * 0.02)));
  breath(0.8);

  // VI — Metatron's cube: every chord between the 13 fruit centres (78),
  // drawn as symmetry families (same length + same distance from centre)
  // so six strokes sweep at once, from the centre outward
  beginStage();
  const fams = new Map();
  for (let i = 0; i < fruit.length; i++) {
    for (let j = i + 1; j < fruit.length; j++) {
      const A = fruit[i], B = fruit[j];
      const len = dist(A.x, A.y, B.x, B.y);
      const midR = dist(0, 0, (A.x + B.x) / 2, (A.y + B.y) / 2);
      const key = len.toFixed(3) + '|' + midR.toFixed(3);
      if (!fams.has(key)) fams.set(key, { len, midR, segs: [] });
      // each chord draws outward from its endpoint nearer the centre
      const swap = sq(A.x) + sq(A.y) > sq(B.x) + sq(B.y);
      const [P, Q] = swap ? [B, A] : [A, B];
      fams.get(key).segs.push({ ax: P.x, ay: P.y, bx: Q.x, by: Q.y });
    }
  }
  [...fams.values()]
    .sort((a, b) => a.midR - b.midR || a.len - b.len)
    .forEach((f, i) =>
      push({ type: 'lines', segs: f.segs, dur: max(0.45, 0.75 - i * 0.04), stage })
    );

  TOTAL = clock;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - pow(-2 * p + 2, 3) / 2);

// completed stages dim once a later stage begins, so the new work reads
function dimAfter(t0, target) {
  const p = constrain((t - t0) / 1.2, 0, 1);
  return lerp(1, target, ease(p));
}

function stageAlpha(s) {
  let a = 1;
  if (s <= 3) {
    a *= dimAfter(stageStarts[4], 0.25);
    a *= dimAfter(stageStarts[5], 0.55);
  } else if (s === 4) {
    a *= dimAfter(stageStarts[5], 0.6);
  }
  return a;
}

function draw() {
  if (!paused) t += min(deltaTime, 50) / 1000;
  if (t >= TOTAL + HOLD + FADE) t = 0;

  background(252, 45, 7);
  const g = drawingContext.createRadialGradient(CX, CY, 0, CX, CY, width * 0.55);
  g.addColorStop(0, 'rgba(64, 58, 110, 0.30)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, width, height);

  let activeCircle = null;
  for (const op of ops) {
    if (t < op.start) break;
    if (op.type === 'pause') continue;
    const p = min(1, (t - op.start) / op.dur);
    if (op.type === 'circle') {
      drawCircleOp(op, p);
      if (p < 1) activeCircle = { op, p };
    } else {
      drawLinesOp(op, p);
    }
  }
  if (activeCircle) drawCompass(activeCircle.op, activeCircle.p);

  drawCaption();

  // fade out before looping
  if (t > TOTAL + HOLD) {
    const p = ease(constrain((t - TOTAL - HOLD) / FADE, 0, 1));
    noStroke();
    fill(252, 45, 7, p);
    rect(0, 0, width, height);
  }
}

function drawCircleOp(op, p) {
  const px = CX + op.cx * R;
  const py = CY + op.cy * R;
  const d = op.r * R * 2;
  const a = stageAlpha(op.stage);
  const sweep = TWO_PI * ease(p);
  if (sweep < 0.001) return;

  noFill();
  for (const [w, al] of [[4.5, 0.09], [1.3, 0.8]]) {
    stroke(46, 40, 96, al * a);
    strokeWeight(w);
    if (p >= 1) circle(px, py, d);
    else if (op.dir > 0) arc(px, py, d, d, op.a0, op.a0 + sweep);
    else arc(px, py, d, d, op.a0 - sweep, op.a0);
  }
}

function drawCompass(op, p) {
  const px = CX + op.cx * R;
  const py = CY + op.cy * R;
  const rad = op.r * R;
  const ang = op.a0 + op.dir * TWO_PI * ease(p);
  const tx = px + rad * cos(ang);
  const ty = py + rad * sin(ang);

  stroke(46, 30, 100, 0.18); // the compass arm, pivot → pen
  strokeWeight(1);
  line(px, py, tx, ty);
  noStroke();
  fill(46, 40, 100, 0.5);
  circle(px, py, 4);
  fill(46, 15, 100, 0.25); // pen halo + tip
  circle(tx, ty, 14);
  fill(46, 10, 100, 1);
  circle(tx, ty, 5);
}

function drawLinesOp(op, p) {
  const a = stageAlpha(op.stage);
  const ep = ease(p);
  strokeWeight(1.1);
  stroke(46, 22, 100, 0.65 * a);
  for (const s of op.segs) {
    const x1 = CX + s.ax * R, y1 = CY + s.ay * R;
    const x2 = CX + lerp(s.ax, s.bx, ep) * R, y2 = CY + lerp(s.ay, s.by, ep) * R;
    line(x1, y1, x2, y2);
    if (p < 1) {
      noStroke();
      fill(46, 10, 100, 0.9);
      circle(x2, y2, 3.5);
      stroke(46, 22, 100, 0.65 * a);
      strokeWeight(1.1);
    }
  }
}

function drawCaption() {
  let s = 0;
  for (let i = 0; i < stageStarts.length; i++) if (t >= stageStarts[i]) s = i;
  const fadeIn = ease(constrain((t - stageStarts[s]) / 0.7, 0, 1));

  textFont('monospace');
  textAlign(CENTER, BOTTOM);
  noStroke();
  try { drawingContext.letterSpacing = '0.22em'; } catch (e) {}
  textSize(13);
  fill(46, 25, 95, 0.55 * fadeIn);
  text(STAGE_NAMES[s], CX, height - 34);
  try { drawingContext.letterSpacing = '0.08em'; } catch (e) {}
  textSize(10);
  fill(46, 10, 90, 0.25);
  text('space pause · r restart · ← → stages', CX, height - 14);
  try { drawingContext.letterSpacing = '0px'; } catch (e) {}
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function jumpStage(d) {
  let s = 0;
  for (let i = 0; i < stageStarts.length; i++) if (t >= stageStarts[i]) s = i;
  if (d > 0) t = s + 1 < stageStarts.length ? stageStarts[s + 1] : TOTAL;
  else t = t - stageStarts[s] > 0.8 || s === 0 ? stageStarts[s] : stageStarts[s - 1];
}

function keyPressed() {
  if (key === ' ') {
    paused = !paused;
    return false;
  }
  if (key === 'r' || key === 'R') {
    t = 0;
    paused = false;
  }
  if (keyCode === RIGHT_ARROW) jumpStage(1);
  if (keyCode === LEFT_ARROW) jumpStage(-1);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) jumpStage(1);
}
