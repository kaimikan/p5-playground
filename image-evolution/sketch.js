/*
 * Image Evolution — evolving a picture out of translucent triangles.
 *
 * This is the classic "evolve the Mona Lisa" demo (Roger Alsing, 2008), here
 * approximating a built-in target image. It's a 1+1 evolution strategy — a
 * population of one. Each generation it copies the current best set of
 * triangles, randomly mutates ONE thing (a vertex, a colour, an opacity), and
 * renders it. If the new version is closer to the target it's kept; otherwise
 * it's thrown away. Keep only what helps, forever, and a recognizable image
 * slowly precipitates out of noise — learning by nothing but trial and error.
 *
 * Left: the target. Right: the best the evolver has found so far. The chart
 * tracks similarity climbing.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = restart
 */

const N_TRIS = 110; // triangles in the genome
const CW = 100; // comparison resolution (small = fast pixel diff)
const CH = 100;
const DS = 300; // on-screen panel size
const TRIALS = 14; // mutation attempts per frame

let gScratch, gTarget, gBestDisp, gTargetDisp;
let targetPix;
let maxSse;

let best, bestSse;
let generation, accepted;
let history = [];
let stepsPerFrame = 1; // multiplies TRIALS
let paused = false;

let panelX1, panelX2, panelY;
const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));
  pixelDensity(1);

  gScratch = createGraphics(CW, CH);
  gTarget = createGraphics(CW, CH);
  gBestDisp = createGraphics(DS, DS);
  gTargetDisp = createGraphics(DS, DS);

  drawTarget(gTarget);
  drawTarget(gTargetDisp);
  gTarget.loadPixels();
  targetPix = gTarget.pixels;
  maxSse = CW * CH * 3 * 255 * 255;

  panelY = 104;
  panelX1 = (width - (DS * 2 + 24)) / 2;
  panelX2 = panelX1 + DS + 24;

  restart();
}

function restart() {
  best = [];
  for (let i = 0; i < N_TRIS; i++) best.push(randomTri());
  renderTo(gScratch, best);
  bestSse = fitness(gScratch);
  generation = 0;
  accepted = 0;
  history = [];
}

// The target image — a built-in sunset scene. Swap this function to evolve
// toward anything you can draw (or an image loaded into the buffer).
function drawTarget(g) {
  g.push();
  for (let y = 0; y < g.height; y++) {
    const t = y / g.height;
    const c = lerpColor(color(28, 22, 64), color(255, 138, 70), t);
    g.stroke(c);
    g.line(0, y, g.width, y);
  }
  g.noStroke();
  g.fill(255, 226, 120);
  g.circle(g.width * 0.52, g.height * 0.42, g.width * 0.3);
  g.fill(214, 92, 64, 120); // haze over the sun
  g.circle(g.width * 0.52, g.height * 0.42, g.width * 0.46);
  g.fill(26, 18, 38);
  g.triangle(-2, g.height, g.width * 0.34, g.height * 0.54, g.width * 0.72, g.height);
  g.fill(16, 10, 26);
  g.triangle(g.width * 0.46, g.height, g.width * 0.82, g.height * 0.62, g.width + 2, g.height);
  g.pop();
}

function randomTri() {
  return {
    x1: random(),
    y1: random(),
    x2: random(),
    y2: random(),
    x3: random(),
    y3: random(),
    r: random(255),
    g: random(255),
    b: random(255),
    a: random(20, 110),
  };
}

function mutate(src) {
  const genome = src.map((t) => ({ ...t }));
  const i = floor(random(genome.length));
  const t = genome[i];
  const roll = random();
  if (roll < 0.4) {
    // nudge one vertex
    const v = floor(random(3));
    const key = (random() < 0.5 ? 'x' : 'y') + (v + 1);
    t[key] = constrain(t[key] + randomGaussian() * 0.08, -0.1, 1.1);
  } else if (roll < 0.7) {
    // nudge one colour channel
    const ch = ['r', 'g', 'b'][floor(random(3))];
    t[ch] = constrain(t[ch] + randomGaussian() * 28, 0, 255);
  } else if (roll < 0.85) {
    // nudge opacity
    t.a = constrain(t.a + randomGaussian() * 18, 8, 150);
  } else {
    // replace the triangle entirely (lets it escape dead ends)
    genome[i] = randomTri();
  }
  return genome;
}

function renderTo(g, genome) {
  g.background(0);
  g.noStroke();
  for (const t of genome) {
    g.fill(t.r, t.g, t.b, t.a);
    g.triangle(
      t.x1 * g.width, t.y1 * g.height,
      t.x2 * g.width, t.y2 * g.height,
      t.x3 * g.width, t.y3 * g.height
    );
  }
}

function fitness(g) {
  g.loadPixels();
  const p = g.pixels;
  let sse = 0;
  for (let i = 0; i < p.length; i += 4) {
    const dr = p[i] - targetPix[i];
    const dg = p[i + 1] - targetPix[i + 1];
    const db = p[i + 2] - targetPix[i + 2];
    sse += dr * dr + dg * dg + db * db;
  }
  return sse;
}

function draw() {
  background(13, 13, 15);

  if (!paused) {
    const trials = TRIALS * stepsPerFrame;
    for (let k = 0; k < trials; k++) {
      const cand = mutate(best);
      renderTo(gScratch, cand);
      const sse = fitness(gScratch);
      generation++;
      if (sse < bestSse) {
        bestSse = sse;
        best = cand;
        accepted++;
      }
    }
    history.push(1 - bestSse / maxSse);
    if (history.length > 320) history.shift();
  }

  renderTo(gBestDisp, best);

  // panels
  image(gTargetDisp, panelX1, panelY, DS, DS);
  image(gBestDisp, panelX2, panelY, DS, DS);
  noFill();
  stroke(42, 42, 50);
  strokeWeight(1);
  rect(panelX1, panelY, DS, DS);
  rect(panelX2, panelY, DS, DS);

  drawLabels();
  drawHud();
  drawChart();
}

function drawLabels() {
  push();
  noStroke();
  textFont('monospace');
  textSize(12);
  fill(138, 138, 149);
  textAlign(LEFT, BOTTOM);
  text('TARGET', panelX1, panelY - 6);
  fill(ACCENT);
  text('EVOLVED', panelX2, panelY - 6);
  pop();
}

function drawHud() {
  const sim = (1 - bestSse / maxSse) * 100;
  push();
  textFont('monospace');
  textSize(13);
  const x = 14;
  let y = 24;
  const line = (label, val, col) => {
    noStroke();
    fill(138, 138, 149);
    text(label, x, y);
    fill(col || 230);
    text(val, x + 108, y);
    y += 19;
  };
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 230, 78, 6);
  line('generation', generation, ACCENT);
  line('similarity', sim.toFixed(2) + '%', '#5fd38d');
  line('kept / tried', accepted + ' / ' + generation);

  textSize(11);
  fill(110, 110, 120);
  text(
    (paused ? '[paused] ' : '') +
      'F fast-forward · Space pause · R restart' +
      (stepsPerFrame > 1 ? '   ▸▸ ×' + stepsPerFrame : ''),
    14,
    height - 12
  );
  pop();
}

function drawChart() {
  if (history.length < 2) return;
  const cw = 230;
  const ch = 92;
  const cx = width - cw - 14;
  const cy = 14;
  push();
  noStroke();
  fill(22, 22, 26, 200);
  rect(cx, cy, cw, ch, 6);
  fill(138, 138, 149);
  textFont('monospace');
  textSize(11);
  textAlign(LEFT, TOP);
  text('similarity ▸ generation', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;
  // zoom the y-range to where the curve actually lives so progress is visible
  let lo = 1;
  for (const v of history) lo = min(lo, v);
  lo = max(0, lo - 0.01);
  const hi = 1;
  const n = history.length;
  stroke(ACCENT);
  strokeWeight(1.8);
  noFill();
  beginShape();
  for (let i = 0; i < n; i++) {
    const vy = map(history[i], lo, hi, py + ph, py);
    vertex(px + (i / (n - 1)) * pw, constrain(vy, py, py + ph));
  }
  endShape();
  pop();
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    stepsPerFrame = stepsPerFrame > 1 ? 1 : 10;
  } else if (key === 'r' || key === 'R') {
    restart();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
}
