/*
 * Neural Net — learning a decision boundary by backpropagation.
 *
 * Every other sketch in the Learning wing learns by EVOLUTION or by reward.
 * This one learns the way real neural networks (and large language models) are
 * actually trained: gradient descent. Two interleaving spirals of points are
 * impossible to separate with a straight line. A small multilayer network
 * makes a guess, measures how wrong it is (the loss), and backpropagation
 * computes how to nudge every weight to be a little less wrong. Repeat a few
 * thousand times and the coloured decision boundary bends itself around the
 * spirals.
 *
 * Coloured field = what the network predicts everywhere. Dots = the training
 * points it's trying to classify. The chart = the loss falling.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = new spiral + weights
 */

// ---- architecture & training ----
const LAYERS = [5, 16, 16, 1]; // 5 = engineered features of (x, y)
const LR = 0.5; // learning rate
const POINTS_PER_CLASS = 120;
const SPIRAL_TURNS = 1.35;
const NOISE = 0.035;
const GRID = 46; // decision-field resolution

// ---- state ----
let net;
let data = [];
let epoch = 0;
let loss = 0;
let history = [];
let epochsPerFrame = 2;
let paused = false;

let plotX, plotY, plotSize;
const C0 = [70, 150, 190]; // class 0 — blue
const C1 = [237, 34, 93]; // class 1 — coral
const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));
  plotSize = 500;
  plotX = (width - plotSize) / 2;
  plotY = 110;
  reset();
}

function reset() {
  data = makeSpiral(POINTS_PER_CLASS, SPIRAL_TURNS, NOISE);
  net = makeNet(LAYERS);
  epoch = 0;
  loss = 0;
  history = [];
}

function draw() {
  background(13, 13, 15);

  if (!paused) {
    for (let e = 0; e < epochsPerFrame; e++) {
      loss = trainEpoch(net, data, LR);
      epoch++;
    }
    history.push(loss);
    if (history.length > 320) history.shift();
  }

  drawField();
  drawPoints();
  drawHud();
  drawChart();
}

// ---------------------------------------------------------------------------
// Data: two interleaving spirals
// ---------------------------------------------------------------------------
function makeSpiral(nPer, turns, noise) {
  const pts = [];
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < nPer; i++) {
      const r = i / nPer; // radius 0..1
      const t = r * turns * TWO_PI + c * PI + randomGaussian() * noise * 2;
      pts.push({
        x: r * cos(t) + randomGaussian() * noise,
        y: r * sin(t) + randomGaussian() * noise,
        label: c,
      });
    }
  }
  return pts;
}

// engineered features give the small net the nonlinearity it needs
function features(x, y) {
  return [x, y, x * y, x * x, y * y];
}

// ---------------------------------------------------------------------------
// Multilayer perceptron with backpropagation
// ---------------------------------------------------------------------------
function makeNet(sizes) {
  const W = [null];
  const b = [null];
  for (let l = 1; l < sizes.length; l++) {
    const scale = 1 / Math.sqrt(sizes[l - 1]);
    W[l] = [];
    for (let i = 0; i < sizes[l]; i++) {
      W[l][i] = [];
      for (let j = 0; j < sizes[l - 1]; j++) {
        W[l][i][j] = randomGaussian() * scale;
      }
    }
    b[l] = new Array(sizes[l]).fill(0);
  }
  return { sizes, W, b };
}

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

function forward(net, input) {
  const L = net.sizes.length - 1;
  const a = [input];
  for (let l = 1; l <= L; l++) {
    const out = [];
    for (let i = 0; i < net.sizes[l]; i++) {
      let z = net.b[l][i];
      const row = net.W[l][i];
      const prev = a[l - 1];
      for (let j = 0; j < prev.length; j++) z += row[j] * prev[j];
      out[i] = l === L ? sigmoid(z) : Math.tanh(z);
    }
    a[l] = out;
  }
  return a; // a[L] is the output layer
}

function predict(net, x, y) {
  return forward(net, features(x, y))[net.sizes.length - 1][0];
}

// one full-batch gradient-descent step over all points; returns mean loss
function trainEpoch(net, pts, lr) {
  const L = net.sizes.length - 1;
  // gradient accumulators
  const gW = [null];
  const gB = [null];
  for (let l = 1; l <= L; l++) {
    gW[l] = net.W[l].map((row) => row.map(() => 0));
    gB[l] = net.b[l].map(() => 0);
  }

  let totalLoss = 0;
  for (const p of pts) {
    const a = forward(net, features(p.x, p.y));
    const out = a[L][0];
    const eps = 1e-7;
    totalLoss -= p.label * Math.log(out + eps) + (1 - p.label) * Math.log(1 - out + eps);

    // output delta (binary cross-entropy + sigmoid → out − label)
    let delta = [out - p.label];
    const deltas = [];
    deltas[L] = delta;
    // backprop through hidden layers (tanh derivative = 1 − a²)
    for (let l = L - 1; l >= 1; l--) {
      const d = new Array(net.sizes[l]).fill(0);
      for (let i = 0; i < net.sizes[l]; i++) {
        let sum = 0;
        for (let k = 0; k < net.sizes[l + 1]; k++) sum += net.W[l + 1][k][i] * deltas[l + 1][k];
        d[i] = sum * (1 - a[l][i] * a[l][i]);
      }
      deltas[l] = d;
    }
    // accumulate gradients
    for (let l = 1; l <= L; l++) {
      const prev = a[l - 1];
      for (let i = 0; i < net.sizes[l]; i++) {
        const dli = deltas[l][i];
        gB[l][i] += dli;
        const gwi = gW[l][i];
        for (let j = 0; j < prev.length; j++) gwi[j] += dli * prev[j];
      }
    }
  }

  // apply averaged gradients
  const n = pts.length;
  for (let l = 1; l <= L; l++) {
    for (let i = 0; i < net.sizes[l]; i++) {
      net.b[l][i] -= (lr / n) * gB[l][i];
      for (let j = 0; j < net.W[l][i].length; j++) {
        net.W[l][i][j] -= (lr / n) * gW[l][i][j];
      }
    }
  }
  return totalLoss / n;
}

function accuracy() {
  let correct = 0;
  for (const p of data) {
    const pred = predict(net, p.x, p.y) > 0.5 ? 1 : 0;
    if (pred === p.label) correct++;
  }
  return correct / data.length;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function dataToScreen(x, y) {
  return [
    plotX + ((x + 1) / 2) * plotSize,
    plotY + ((y + 1) / 2) * plotSize,
  ];
}

function drawField() {
  noStroke();
  const cellW = plotSize / GRID;
  for (let gx = 0; gx < GRID; gx++) {
    for (let gy = 0; gy < GRID; gy++) {
      const dx = (gx + 0.5) / GRID * 2 - 1;
      const dy = (gy + 0.5) / GRID * 2 - 1;
      const p = predict(net, dx, dy);
      const r = lerp(C0[0], C1[0], p);
      const g = lerp(C0[1], C1[1], p);
      const b = lerp(C0[2], C1[2], p);
      fill(r, g, b, 120);
      rect(plotX + gx * cellW, plotY + gy * cellW, cellW + 1, cellW + 1);
    }
  }
  noFill();
  stroke(42, 42, 50);
  strokeWeight(1);
  rect(plotX, plotY, plotSize, plotSize);
}

function drawPoints() {
  strokeWeight(1);
  for (const p of data) {
    const [sx, sy] = dataToScreen(p.x, p.y);
    stroke(255, 255, 255, 110);
    fill(p.label === 1 ? color(C1[0], C1[1], C1[2]) : color(C0[0], C0[1], C0[2]));
    circle(sx, sy, 8);
  }
}

function drawHud() {
  push();
  textFont('monospace');
  textAlign(LEFT, BASELINE);
  textSize(13);
  const x = 14;
  let y = 24;
  const line = (label, val, col) => {
    noStroke();
    fill(138, 138, 149);
    text(label, x, y);
    fill(col || 230);
    text(val, x + 92, y);
    y += 19;
  };
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 188, 78, 6);
  line('epoch', epoch, ACCENT);
  line('loss', loss.toFixed(4));
  const acc = accuracy();
  line('accuracy', round(acc * 100) + '%', acc > 0.9 ? '#5fd38d' : 230);

  textSize(11);
  fill(110, 110, 120);
  text(
    (paused ? '[paused] ' : '') +
      'F fast-forward · Space pause · R reset' +
      (epochsPerFrame > 2 ? '   ▸▸ ×' + epochsPerFrame : ''),
    14,
    height - 12
  );
  pop();
}

function drawChart() {
  if (history.length < 2) return;
  const cw = 200;
  const ch = 84;
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
  text('loss ▸ epoch', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;
  let hi = 0;
  for (const v of history) hi = max(hi, v);
  hi = max(hi, 1e-6);
  const n = history.length;
  stroke(ACCENT);
  strokeWeight(1.8);
  noFill();
  beginShape();
  for (let i = 0; i < n; i++) {
    vertex(px + (i / (n - 1)) * pw, py + ph - (history[i] / hi) * ph);
  }
  endShape();
  pop();
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    epochsPerFrame = epochsPerFrame > 2 ? 2 : 20;
  } else if (key === 'r' || key === 'R') {
    reset();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
}
