/*
 * Self-Driving Car — neuroevolution with distance sensors.
 *
 * Each car feels the track through five sensor rays (the same raycasting trick
 * as the 2D Raycasting sketch) and feeds those distances into a small neural
 * network that outputs steering and throttle. No car is told where the road is.
 * A whole fleet drives at once; when they've all crashed, the ones that got
 * furthest become the parents of the next fleet — their network weights crossed
 * over and mutated. Generation by generation the fleet learns to take the
 * corners. The bright car is the current leader, with its sensors drawn.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = reset
 */

// ---- tunables ----
const POP_SIZE = 70;
const MAX_FRAMES = 1800; // a generation's time limit
const MAX_SPEED = 3.4;
const TURN_RATE = 0.07;
const CAR_R = 7;
const SENSOR_RANGE = 170;
const SENSOR_ANGLES = [-1.0, -0.5, 0, 0.5, 1.0]; // radians, relative to heading
const ROAD_HALF = 50;
const MUTATION_RATE = 0.08;
const H_NODES = 6;

// ---- state ----
let center = [];
let outer = [];
let inner = [];
let walls = []; // {x1,y1,x2,y2}
let cars = [];
let generation = 1;
let frames = 0;
let stepsPerFrame = 1;
let paused = false;
let bestEver = 0;
let history = [];
let startPos, startHeading;

const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));
  buildTrack();
  reset();
}

function buildTrack() {
  // a wobbly closed loop as the centre line
  center = [];
  const n = 16;
  const cx = 350;
  const cy = 330;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO_PI;
    const radius = 198 + 52 * sin(3 * a + 0.6);
    center.push(createVector(cx + radius * cos(a) * 1.4, cy + radius * sin(a)));
  }
  // offset each centre point along its normal to get inner/outer walls
  outer = [];
  inner = [];
  for (let i = 0; i < n; i++) {
    const prev = center[(i - 1 + n) % n];
    const next = center[(i + 1) % n];
    const dir = p5.Vector.sub(next, prev).normalize();
    const normal = createVector(-dir.y, dir.x);
    outer.push(p5.Vector.add(center[i], p5.Vector.mult(normal, ROAD_HALF)));
    inner.push(p5.Vector.sub(center[i], p5.Vector.mult(normal, ROAD_HALF)));
  }
  walls = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    walls.push({ x1: outer[i].x, y1: outer[i].y, x2: outer[j].x, y2: outer[j].y });
    walls.push({ x1: inner[i].x, y1: inner[i].y, x2: inner[j].x, y2: inner[j].y });
  }
  startPos = center[0].copy();
  startHeading = p5.Vector.sub(center[1], center[0]).heading();
}

function reset() {
  cars = [];
  for (let i = 0; i < POP_SIZE; i++) cars.push(new Car());
  resetWorld();
  generation = 1;
  bestEver = 0;
  history = [];
}

function resetWorld() {
  frames = 0;
  for (const car of cars) car.respawn();
}

function draw() {
  background(13, 13, 15);
  if (!paused) {
    for (let s = 0; s < stepsPerFrame; s++) {
      step();
      if (livingCount() === 0 || frames >= MAX_FRAMES) {
        nextGeneration();
        break;
      }
    }
  }
  drawTrack();
  drawCars();
  drawHud();
  drawChart();
}

function step() {
  for (const car of cars) if (car.alive) car.update();
  frames++;
}

function livingCount() {
  let n = 0;
  for (const car of cars) if (car.alive) n++;
  return n;
}

// ---------------------------------------------------------------------------
function nextGeneration() {
  let best = cars[0];
  let total = 0;
  for (const car of cars) {
    total += car.fitness;
    if (car.fitness > best.fitness) best = car;
  }
  history.push(best.progress);
  bestEver = max(bestEver, best.progress);

  const next = [];
  next.push(new Car(best.brain.copy())); // elitism
  for (let i = 1; i < POP_SIZE; i++) {
    const a = pickParent(total);
    const b = pickParent(total);
    const child = a.brain.crossover(b.brain);
    child.mutate(MUTATION_RATE);
    next.push(new Car(child));
  }
  cars = next;
  resetWorld();
  generation++;
}

function pickParent(total) {
  let r = random(total);
  let acc = 0;
  for (const car of cars) {
    acc += car.fitness;
    if (acc >= r) return car;
  }
  return cars[cars.length - 1];
}

// ---------------------------------------------------------------------------
function Car(brain) {
  this.brain = brain || new NeuralNet(SENSOR_ANGLES.length, H_NODES, 2);

  this.respawn = function () {
    this.pos = startPos.copy();
    this.heading = startHeading;
    this.speed = 0;
    this.alive = true;
    this.progress = 0; // checkpoints passed
    this.next = 1; // next centre-line waypoint to reach
    this.fitness = 0;
    this.readings = [];
  };
  this.respawn();

  this.sense = function () {
    this.readings = [];
    for (const off of SENSOR_ANGLES) {
      const a = this.heading + off;
      this.readings.push(castRay(this.pos.x, this.pos.y, a));
    }
  };

  this.update = function () {
    this.sense();
    const inputs = this.readings.map((d) => d / SENSOR_RANGE);
    const out = this.brain.predict(inputs);
    const steer = out[0] * 2 - 1; // -1..1
    const throttle = out[1]; // 0..1

    this.heading += steer * TURN_RATE;
    this.speed = throttle * MAX_SPEED;
    this.pos.x += cos(this.heading) * this.speed;
    this.pos.y += sin(this.heading) * this.speed;

    // crash if it touches a wall
    if (nearestWall(this.pos.x, this.pos.y) < CAR_R) {
      this.alive = false;
      return;
    }
    // progress: reaching the next waypoint in order
    if (p5.Vector.dist(this.pos, center[this.next]) < ROAD_HALF * 1.3) {
      this.progress++;
      this.next = (this.next + 1) % center.length;
    }
    this.fitness = this.progress + frames * 0.0005;
  };

  this.show = function (isBest) {
    if (!this.alive) return;
    if (isBest) {
      // draw its sensors
      stroke(237, 34, 93, 70);
      strokeWeight(1);
      for (let i = 0; i < SENSOR_ANGLES.length; i++) {
        const a = this.heading + SENSOR_ANGLES[i];
        const d = this.readings[i] || SENSOR_RANGE;
        line(this.pos.x, this.pos.y, this.pos.x + cos(a) * d, this.pos.y + sin(a) * d);
      }
    }
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    noStroke();
    fill(isBest ? color(237, 34, 93) : color(230, 230, 234, 70));
    rectMode(CENTER);
    rect(0, 0, 16, 9, 2);
    pop();
  };
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
function castRay(ox, oy, angle) {
  const dx = cos(angle);
  const dy = sin(angle);
  let best = SENSOR_RANGE;
  for (const w of walls) {
    const t = raySeg(ox, oy, dx, dy, w.x1, w.y1, w.x2, w.y2);
    if (t >= 0 && t < best) best = t;
  }
  return best;
}

// distance along ray (ox,oy)+t(dx,dy) to segment, or -1 if no hit within range
function raySeg(ox, oy, dx, dy, x1, y1, x2, y2) {
  const ex = x2 - x1;
  const ey = y2 - y1;
  const denom = dx * ey - dy * ex;
  if (abs(denom) < 1e-9) return -1;
  const tx = x1 - ox;
  const ty = y1 - oy;
  const t = (tx * ey - ty * ex) / denom; // distance along ray
  const u = (tx * dy - ty * dx) / denom; // position along segment
  if (t >= 0 && u >= 0 && u <= 1) return t;
  return -1;
}

function nearestWall(px, py) {
  let best = Infinity;
  for (const w of walls) {
    const d = pointSeg(px, py, w.x1, w.y1, w.x2, w.y2);
    if (d < best) best = d;
  }
  return best;
}

function pointSeg(px, py, x1, y1, x2, y2) {
  const ex = x2 - x1;
  const ey = y2 - y1;
  const len2 = ex * ex + ey * ey || 1;
  let t = ((px - x1) * ex + (py - y1) * ey) / len2;
  t = constrain(t, 0, 1);
  const cx = x1 + t * ex;
  const cy = y1 + t * ey;
  return dist(px, py, cx, cy);
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
    this.w1 = nnMatrix(nHid, nIn);
    this.b1 = nnVector(nHid);
    this.w2 = nnMatrix(nOut, nHid);
    this.b2 = nnVector(nOut);
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
    nnCross(child.w1, other.w1);
    nnCross(child.b1, other.b1);
    nnCross(child.w2, other.w2);
    nnCross(child.b2, other.b2);
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

function nnMatrix(rows, cols) {
  const m = [];
  for (let i = 0; i < rows; i++) {
    m[i] = [];
    for (let j = 0; j < cols; j++) m[i][j] = random(-1, 1);
  }
  return m;
}

function nnVector(n) {
  const v = [];
  for (let i = 0; i < n; i++) v[i] = random(-1, 1);
  return v;
}

function nnCross(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (Array.isArray(a[i])) nnCross(a[i], b[i]);
    else if (random() < 0.5) a[i] = b[i];
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function drawTrack() {
  // filled road between the two boundaries
  noStroke();
  fill(22, 22, 27);
  beginShape();
  for (const p of outer) vertex(p.x, p.y);
  beginContour();
  for (let i = inner.length - 1; i >= 0; i--) vertex(inner[i].x, inner[i].y);
  endContour();
  endShape(CLOSE);

  // boundaries
  noFill();
  stroke(70, 70, 82);
  strokeWeight(2);
  drawLoop(outer);
  drawLoop(inner);

  // start line
  stroke(237, 34, 93, 130);
  strokeWeight(2);
  const i = 0;
  line(outer[i].x, outer[i].y, inner[i].x, inner[i].y);
}

function drawLoop(pts) {
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape(CLOSE);
}

function drawCars() {
  let best = null;
  for (const car of cars) {
    if (car.alive && (!best || car.fitness > best.fitness)) best = car;
  }
  for (const car of cars) if (car !== best) car.show(false);
  if (best) best.show(true);
}

function drawHud() {
  let alive = livingCount();
  let bestProgress = 0;
  for (const car of cars) if (car.alive) bestProgress = max(bestProgress, car.progress);
  const laps = (bestProgress / center.length).toFixed(2);

  push();
  textFont('monospace');
  textSize(13);
  const x = 14;
  let y = 24;
  const line2 = (label, val, col) => {
    noStroke();
    fill(138, 138, 149);
    text(label, x, y);
    fill(col || 230);
    text(val, x + 124, y);
    y += 19;
  };
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 230, 99, 6);
  line2('generation', generation, ACCENT);
  line2('alive', alive + ' / ' + POP_SIZE);
  line2('best laps', laps, bestProgress > 0 ? '#5fd38d' : 230);
  line2('best ever', (bestEver / center.length).toFixed(2) + ' laps');

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
  text('best progress ▸ generation', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;
  const yMax = max(bestEver, 1);
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
  pop();
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    stepsPerFrame = stepsPerFrame > 1 ? 1 : 10;
  } else if (key === 'r' || key === 'R') {
    reset();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
}
