/*
 * Flappy Evolution — neuroevolution.
 *
 * Each bird has a tiny neural network for a brain: it looks at where it is and
 * where the next gap is, and decides whether to flap. No bird is taught the
 * rules. A whole flock plays at once; when they all die, the ones that lasted
 * longest become the parents of the next flock — their network weights are
 * crossed over and lightly mutated. Generation by generation the flock learns
 * to thread the pipes. Watch the best-score chart climb.
 *
 * This is the step from the genetic-algorithm sketches (Smart Rockets,
 * Evolving Walkers) into neural networks — the same idea that, scaled up
 * massively, underlies modern AI.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = reset
 */

// ---- tunables ----
const POP_SIZE = 200;
const GRAVITY = 0.5;
const FLAP = -8;
const BIRD_X = 160;
const PIPE_GAP = 160;
const PIPE_SPACING = 240;
const PIPE_SPEED = 3.2;
const PIPE_W = 60;
const MUTATION_RATE = 0.06;
const H_NODES = 6; // hidden-layer size

// ---- state ----
let birds = [];
let pipes = [];
let generation = 1;
let frames = 0;
let stepsPerFrame = 1;
let paused = false;

let bestScoreEver = 0;
let history = []; // best pipe-score per generation
let groundY;

const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));
  groundY = height - 30;
  reset();
}

function reset() {
  birds = [];
  for (let i = 0; i < POP_SIZE; i++) birds.push(new Bird());
  resetWorld();
  generation = 1;
  bestScoreEver = 0;
  history = [];
}

function resetWorld() {
  pipes = [new Pipe(width + 200), new Pipe(width + 200 + PIPE_SPACING)];
  frames = 0;
  for (const b of birds) {
    b.y = height / 2;
    b.vy = 0;
    b.alive = true;
    b.score = 0; // pipes passed
    b.fitness = 0; // frames survived
  }
}

function draw() {
  background(13, 13, 15);

  if (!paused) {
    for (let s = 0; s < stepsPerFrame; s++) {
      step();
      if (livingCount() === 0) {
        nextGeneration();
        break;
      }
    }
  }

  drawScene();
  drawHud();
  drawChart();
}

function step() {
  // advance pipes
  for (const p of pipes) p.update();
  if (pipes[pipes.length - 1].x < width - PIPE_SPACING) {
    pipes.push(new Pipe(pipes[pipes.length - 1].x + PIPE_SPACING));
  }
  pipes = pipes.filter((p) => p.x + PIPE_W > 0);

  const next = nextPipe();
  for (const b of birds) {
    if (!b.alive) continue;
    b.think(next);
    b.update();
    if (b.collides(next)) {
      b.alive = false;
    } else {
      b.fitness++;
    }
  }
  // score: each pipe counts once, the moment it passes the bird's column
  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_W < BIRD_X) {
      p.scored = true;
      for (const b of birds) if (b.alive) b.score++;
    }
  }
  frames++;
}

function nextPipe() {
  // first pipe whose right edge is still ahead of the bird
  for (const p of pipes) {
    if (p.x + PIPE_W >= BIRD_X) return p;
  }
  return pipes[0];
}

function livingCount() {
  let n = 0;
  for (const b of birds) if (b.alive) n++;
  return n;
}

// ---------------------------------------------------------------------------
// Evolution
// ---------------------------------------------------------------------------
function nextGeneration() {
  let best = birds[0];
  let total = 0;
  for (const b of birds) {
    total += b.fitness;
    if (b.fitness > best.fitness) best = b;
  }
  history.push(best.score);
  bestScoreEver = max(bestScoreEver, best.score);

  const next = [];
  next.push(new Bird(best.brain.copy())); // elitism: keep the champion
  for (let i = 1; i < POP_SIZE; i++) {
    const a = pickParent(total);
    const b = pickParent(total);
    const child = a.brain.crossover(b.brain);
    child.mutate(MUTATION_RATE);
    next.push(new Bird(child));
  }
  birds = next;
  resetWorld();
  generation++;
}

function pickParent(total) {
  let r = random(total);
  let acc = 0;
  for (const b of birds) {
    acc += b.fitness;
    if (acc >= r) return b;
  }
  return birds[birds.length - 1];
}

// ---------------------------------------------------------------------------
// Bird
// ---------------------------------------------------------------------------
function Bird(brain) {
  this.y = height / 2;
  this.vy = 0;
  this.alive = true;
  this.score = 0;
  this.fitness = 0;
  this.brain = brain || new NeuralNet(5, H_NODES, 1);

  this.think = function (pipe) {
    // normalised inputs: position, velocity, and the next gap
    const inputs = [
      this.y / height,
      this.vy / 10,
      pipe ? pipe.x / width : 1,
      pipe ? pipe.gapTop / height : 0.5,
      pipe ? pipe.gapBottom / height : 0.5,
    ];
    if (this.brain.predict(inputs)[0] > 0.5) this.vy = FLAP;
  };

  this.update = function () {
    this.vy += GRAVITY;
    this.y += this.vy;
  };

  this.collides = function (pipe) {
    if (this.y > groundY || this.y < 0) return true;
    if (
      pipe &&
      BIRD_X + 9 > pipe.x &&
      BIRD_X - 9 < pipe.x + PIPE_W &&
      (this.y - 9 < pipe.gapTop || this.y + 9 > pipe.gapBottom)
    ) {
      return true;
    }
    return false;
  };

  this.show = function (isBest) {
    push();
    noStroke();
    if (isBest) {
      fill(237, 34, 93, 240);
    } else {
      fill(230, 230, 234, 45);
    }
    translate(BIRD_X, this.y);
    rotate(constrain(this.vy * 0.04, -0.5, 0.6));
    triangle(9, 0, -7, 5, -7, -5);
    pop();
  };
}

function Pipe(x) {
  this.x = x;
  const margin = 60;
  const center = random(margin + PIPE_GAP / 2, groundY - margin - PIPE_GAP / 2);
  this.gapTop = center - PIPE_GAP / 2;
  this.gapBottom = center + PIPE_GAP / 2;
  this.scored = false;

  this.update = function () {
    this.x -= PIPE_SPEED;
  };

  this.show = function () {
    noStroke();
    fill(38, 38, 46);
    rect(this.x, 0, PIPE_W, this.gapTop, 0, 0, 4, 4);
    rect(this.x, this.gapBottom, PIPE_W, groundY - this.gapBottom, 4, 4, 0, 0);
    fill(237, 34, 93, 70); // coral lips on the gap edges
    rect(this.x, this.gapTop - 3, PIPE_W, 3);
    rect(this.x, this.gapBottom, PIPE_W, 3);
  };
}

// ---------------------------------------------------------------------------
// Tiny feed-forward neural net (one hidden layer)
// ---------------------------------------------------------------------------
function NeuralNet(nIn, nHid, nOut, copyFrom) {
  this.nIn = nIn;
  this.nHid = nHid;
  this.nOut = nOut;
  if (copyFrom) {
    this.w1 = copyFrom.w1.map((r) => r.slice());
    this.b1 = copyFrom.b1.slice();
    this.w2 = copyFrom.w2.map((r) => r.slice());
    this.b2 = copyFrom.b2.slice();
  } else {
    this.w1 = matrix(nHid, nIn);
    this.b1 = vector(nHid);
    this.w2 = matrix(nOut, nHid);
    this.b2 = vector(nOut);
  }

  this.predict = function (input) {
    const h = [];
    for (let i = 0; i < this.nHid; i++) {
      let sum = this.b1[i];
      for (let j = 0; j < this.nIn; j++) sum += this.w1[i][j] * input[j];
      h[i] = Math.tanh(sum);
    }
    const out = [];
    for (let i = 0; i < this.nOut; i++) {
      let sum = this.b2[i];
      for (let j = 0; j < this.nHid; j++) sum += this.w2[i][j] * h[j];
      out[i] = 1 / (1 + Math.exp(-sum));
    }
    return out;
  };

  this.copy = function () {
    return new NeuralNet(nIn, nHid, nOut, this);
  };

  this.crossover = function (other) {
    const child = this.copy();
    cross(child.w1, other.w1);
    cross(child.b1, other.b1);
    cross(child.w2, other.w2);
    cross(child.b2, other.b2);
    return child;
  };

  this.mutate = function (rate) {
    const m = (v) => (random() < rate ? v + randomGaussian() * 0.5 : v);
    this.w1 = this.w1.map((r) => r.map(m));
    this.b1 = this.b1.map(m);
    this.w2 = this.w2.map((r) => r.map(m));
    this.b2 = this.b2.map(m);
  };
}

function matrix(rows, cols) {
  const m = [];
  for (let i = 0; i < rows; i++) {
    m[i] = [];
    for (let j = 0; j < cols; j++) m[i][j] = random(-1, 1);
  }
  return m;
}

function vector(n) {
  const v = [];
  for (let i = 0; i < n; i++) v[i] = random(-1, 1);
  return v;
}

// uniform crossover in place: each weight has a 50% chance to come from `other`
function cross(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (Array.isArray(a[i])) cross(a[i], b[i]);
    else if (random() < 0.5) a[i] = b[i];
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function drawScene() {
  for (const p of pipes) p.show();
  // ground
  stroke(40, 40, 48);
  strokeWeight(1);
  line(0, groundY, width, groundY);
  noStroke();

  // find current best living bird to highlight
  let best = null;
  for (const b of birds) {
    if (b.alive && (!best || b.fitness > best.fitness)) best = b;
  }
  for (const b of birds) if (b.alive && b !== best) b.show(false);
  if (best) best.show(true);
}

function drawHud() {
  let alive = livingCount();
  let score = 0;
  for (const b of birds) if (b.alive) score = max(score, b.score);

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
    text(val, x + 104, y);
    y += 19;
  };
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 200, 99, 6);
  line('generation', generation, ACCENT);
  line('alive', alive + ' / ' + POP_SIZE);
  line('score', score, score > 0 ? '#5fd38d' : 230);
  line('best ever', bestScoreEver);

  textSize(11);
  fill(110, 110, 120);
  text(
    (paused ? '[paused] ' : '') +
      'F fast-forward · Space pause · R reset' +
      (stepsPerFrame > 1 ? '   ▸▸ ×' + stepsPerFrame : ''),
    14,
    height - 12
  );
  pop();
}

function drawChart() {
  if (history.length < 1) return;
  const cw = 210;
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
  text('best score ▸ generation', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;
  const yMax = max(bestScoreEver, 1);
  const n = history.length;
  const sx = n > 1 ? pw / (n - 1) : 0;

  stroke(ACCENT);
  strokeWeight(1.8);
  noFill();
  beginShape();
  for (let i = 0; i < n; i++) {
    const vx = px + (n > 1 ? i * sx : pw / 2);
    const vy = py + ph - (history[i] / yMax) * ph;
    vertex(vx, constrain(vy, py, py + ph));
  }
  endShape();

  const lx = px + (n > 1 ? (n - 1) * sx : pw / 2);
  const ly = py + ph - (history[n - 1] / yMax) * ph;
  noStroke();
  fill(ACCENT);
  circle(lx, constrain(ly, py, py + ph), 4);
  pop();
}

// ---------------------------------------------------------------------------
function keyPressed() {
  if (key === 'f' || key === 'F') {
    stepsPerFrame = stepsPerFrame > 1 ? 1 : 12;
  } else if (key === 'r' || key === 'R') {
    reset();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
}
