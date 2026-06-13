/*
 * Evolving Walkers — a genetic algorithm that learns an obstacle course.
 *
 * Each walker carries a "genome": a fixed list of steering forces, one per
 * step of its life. A whole generation lives out its genome at once. Then the
 * ones that got closest to the goal (and didn't crash) are more likely to
 * become parents of the next generation — their genomes are crossed over and
 * lightly mutated. No walker is ever told the route; the route is discovered
 * by selection alone. The fitness chart in the corner is the point: watch it
 * climb, generation by generation. Software that learns from its mistakes —
 * the spiritual ancestor of the models you're talking to.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = reset
 */

// ---- tunables ----
const POP_SIZE = 80;
const LIFESPAN = 340; // steps a generation gets to live
const MAX_FORCE = 0.3;
const MAX_SPEED = 4;
const MUTATION_RATE = 0.012;

// ---- state ----
let population = [];
let start, goal;
let walls = [];
let maxDist; // longest possible distance, for normalising fitness

let step = 0;
let generation = 1;
let stepsPerFrame = 1;
let paused = false;

let totalFitness = 0;
let history = []; // { best, avg } per generation
let bestEver = 0;
let bestEverPath = null; // champion trail, for the ghost
let championGenes = null; // best genome, carried forward (elitism)

const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));

  start = createVector(width / 2, height - 28);
  goal = createVector(width / 2, 56);
  maxDist = dist(0, 0, width, height);

  buildCourse();
  reset();
}

// A slalom: two staggered walls with opposite gaps force a weave.
// Each gap is the only way to gain height past its wall, so the
// vertical-progress fitness (see calcFitness) pulls evolution through them.
function buildCourse() {
  walls = [
    { x: 0, y: 430, w: 470, h: 16 }, // gap on the right
    { x: 230, y: 230, w: 470, h: 16 }, // gap on the left
  ];
}

function reset() {
  population = [];
  for (let i = 0; i < POP_SIZE; i++) population.push(new Walker());
  step = 0;
  generation = 1;
  history = [];
  bestEver = 0;
  bestEverPath = null;
  championGenes = null;
}

function draw() {
  background(13, 13, 15);

  if (!paused) {
    for (let s = 0; s < stepsPerFrame; s++) {
      advanceOneStep();
      if (step >= LIFESPAN || allSettled()) {
        nextGeneration();
        break;
      }
    }
  }

  drawCourse();
  drawGhost();
  for (const w of population) w.show();
  drawGoal();
  drawHud();
  drawChart();
}

function advanceOneStep() {
  for (const w of population) w.update();
  step++;
}

// Everyone has either crashed or reached the goal — no point waiting.
function allSettled() {
  for (const w of population) if (!w.dead && !w.reached) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Evolution
// ---------------------------------------------------------------------------
function nextGeneration() {
  // 1. Score everyone.
  let best = null;
  let sum = 0;
  totalFitness = 0;
  for (const w of population) {
    w.calcFitness();
    totalFitness += w.fitness;
    sum += w.fitness;
    if (!best || w.fitness > best.fitness) best = w;
  }
  const avg = sum / population.length;

  // 2. Record progress for the chart and the ghost trail.
  history.push({ best: best.fitness, avg });
  if (best.fitness >= bestEver) {
    bestEver = best.fitness;
    bestEverPath = best.path.slice();
    championGenes = best.genes.map((g) => g.copy());
  }

  // 3. Breed the next generation. The best genome survives untouched
  //    (elitism) so improvement never goes backwards; the rest are children
  //    of fitness-weighted parents, with a little mutation.
  const next = [];
  next.push(new Walker(championGenes.map((g) => g.copy())));
  for (let i = 1; i < POP_SIZE; i++) {
    const a = pickParent();
    const b = pickParent();
    next.push(new Walker(crossover(a.genes, b.genes)));
  }

  population = next;
  step = 0;
  generation++;
}

// Roulette-wheel selection: fitter walkers occupy more of the wheel.
function pickParent() {
  let r = random(totalFitness);
  let acc = 0;
  for (const w of population) {
    acc += w.fitness;
    if (acc >= r) return w;
  }
  return population[population.length - 1];
}

function crossover(genesA, genesB) {
  const child = [];
  const mid = floor(random(genesA.length));
  for (let i = 0; i < genesA.length; i++) {
    let g = i < mid ? genesA[i].copy() : genesB[i].copy();
    if (random() < MUTATION_RATE) {
      g = p5.Vector.random2D().setMag(MAX_FORCE);
    }
    child.push(g);
  }
  return child;
}

// ---------------------------------------------------------------------------
// Walker
// ---------------------------------------------------------------------------
function Walker(genes) {
  this.pos = start.copy();
  this.vel = createVector();
  this.acc = createVector();
  this.dead = false; // crashed
  this.reached = false;
  this.finishStep = LIFESPAN;
  this.fitness = 0;
  this.bestY = start.y; // highest point reached (smallest y)
  this.path = [start.copy()];

  // Random genome unless one was supplied by breeding.
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];
    for (let i = 0; i < LIFESPAN; i++) {
      this.genes.push(p5.Vector.random2D().setMag(MAX_FORCE));
    }
  }

  this.update = function () {
    if (this.dead || this.reached) return;

    if (step < this.genes.length) this.acc.add(this.genes[step]);
    this.vel.add(this.acc).limit(MAX_SPEED);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.bestY = min(this.bestY, this.pos.y);
    this.path.push(this.pos.copy());

    // Reached the goal?
    if (dist(this.pos.x, this.pos.y, goal.x, goal.y) < 14) {
      this.reached = true;
      this.finishStep = step;
      return;
    }
    // Off the edges?
    if (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    ) {
      this.dead = true;
      return;
    }
    // Into a wall?
    for (const wall of walls) {
      if (
        this.pos.x > wall.x &&
        this.pos.x < wall.x + wall.w &&
        this.pos.y > wall.y &&
        this.pos.y < wall.y + wall.h
      ) {
        this.dead = true;
        return;
      }
    }
  };

  // Fitness is driven by VERTICAL PROGRESS — the highest point the walker
  // reached — because a gap is the only way past its wall. That turns
  // "find the gap" into a smooth, climbable gradient, where a pure
  // distance-to-goal score would instead trap walkers against the wall
  // directly below the target. A small horizontal-closeness term aims the
  // final approach; arriving fast pays a bonus; crashing is penalised
  // (but a walker that climbed high before crashing still beats one that
  // never left the floor).
  this.calcFitness = function () {
    let prog = (start.y - this.bestY) / (start.y - goal.y);
    prog = constrain(prog, 0, 1);
    let f = prog * prog;

    const dx = abs(this.pos.x - goal.x) / width;
    f *= 1 - 0.25 * dx;

    if (this.reached) {
      f += 1 + (LIFESPAN - this.finishStep) / LIFESPAN;
    }
    if (this.dead) {
      f *= 0.7;
    }
    this.fitness = max(f, 0.0001);
  };

  this.show = function () {
    if (this.dead) return; // keep the swarm legible — only show the living
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    if (this.reached) {
      fill(237, 34, 93, 230); // arrived — coral
    } else {
      fill(230, 230, 234, 60); // travelling — faint white
    }
    triangle(6, 0, -4, 3, -4, -3);
    pop();
  };
}

// ---------------------------------------------------------------------------
// Scenery
// ---------------------------------------------------------------------------
function drawCourse() {
  noStroke();
  for (const wall of walls) {
    fill(38, 38, 46);
    rect(wall.x, wall.y, wall.w, wall.h, 3);
    fill(237, 34, 93, 70); // thin coral lip = "danger"
    rect(wall.x, wall.y, wall.w, 2, 3);
  }
  // start marker
  noFill();
  stroke(120, 120, 130);
  strokeWeight(1);
  circle(start.x, start.y, 16);
}

function drawGoal() {
  const pulse = 16 + 4 * sin(frameCount * 0.08);
  noFill();
  stroke(237, 34, 93, 120);
  strokeWeight(1.5);
  circle(goal.x, goal.y, pulse + 14);
  noStroke();
  fill(ACCENT);
  circle(goal.x, goal.y, pulse);
}

// The best trail discovered so far, drawn faintly so you can see the
// learned route persist even as the swarm keeps searching.
function drawGhost() {
  if (!bestEverPath || bestEverPath.length < 2) return;
  noFill();
  stroke(237, 34, 93, 90);
  strokeWeight(1.5);
  beginShape();
  for (const p of bestEverPath) vertex(p.x, p.y);
  endShape();
}

// ---------------------------------------------------------------------------
// HUD + fitness chart
// ---------------------------------------------------------------------------
function drawHud() {
  let alive = 0;
  let reached = 0;
  for (const w of population) {
    if (w.reached) reached++;
    else if (!w.dead) alive++;
  }

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
    text(val, x + 96, y);
    y += 19;
  };

  // backing panel
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 196, 118, 6);

  line('generation', generation, ACCENT);
  line('step', step + ' / ' + LIFESPAN);
  line('travelling', alive);
  line('reached', reached, reached > 0 ? '#5fd38d' : 230);
  line('best fitness', nf(bestEver, 0, 2));

  // controls hint, bottom-left
  textSize(11);
  fill(110, 110, 120);
  text(
    (paused ? '[paused] ' : '') +
      'F fast-forward  ·  Space pause  ·  R reset' +
      (stepsPerFrame > 1 ? '   ▸▸ ×' + stepsPerFrame : ''),
    14,
    height - 14
  );
  pop();
}

function drawChart() {
  if (history.length < 1) return;

  const cw = 210;
  const ch = 96;
  const cx = width - cw - 14;
  const cy = 14;

  push();
  // panel
  noStroke();
  fill(22, 22, 26, 200);
  rect(cx, cy, cw, ch, 6);

  // label
  fill(138, 138, 149);
  textFont('monospace');
  textSize(11);
  textAlign(LEFT, TOP);
  text('best fitness ▸ generation', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;

  const yMax = max(bestEver, 0.01);
  const n = history.length;
  const sx = n > 1 ? pw / (n - 1) : 0;

  const plot = (key, col, weight) => {
    stroke(col);
    strokeWeight(weight);
    noFill();
    beginShape();
    for (let i = 0; i < n; i++) {
      const vx = px + (n > 1 ? i * sx : pw / 2);
      const vy = py + ph - (history[i][key] / yMax) * ph;
      vertex(vx, constrain(vy, py, py + ph));
    }
    endShape();
  };

  plot('avg', color(138, 138, 149, 160), 1); // average — grey
  plot('best', color(237, 34, 93), 1.8); // best — coral

  // marker on the latest best point
  const last = history[n - 1];
  const lx = px + (n > 1 ? (n - 1) * sx : pw / 2);
  const ly = py + ph - (last.best / yMax) * ph;
  noStroke();
  fill(ACCENT);
  circle(lx, constrain(ly, py, py + ph), 4);
  pop();
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function keyPressed() {
  if (key === 'f' || key === 'F') {
    stepsPerFrame = stepsPerFrame > 1 ? 1 : 12;
  } else if (key === 'r' || key === 'R') {
    reset();
  } else if (key === ' ') {
    paused = !paused;
    return false; // don't scroll the page
  }
}
