/*
 * Q-Learning — reinforcement learning on a grid world.
 *
 * Unlike the genetic-algorithm sketches (which evolve a whole population), this
 * is a SINGLE agent learning from reward, one step at a time. It starts knowing
 * nothing and wanders almost at random. Every time it reaches the goal (+1) or
 * falls in a trap (−1) it updates a table of expected values — Q[state][action]
 * — nudging each move toward whatever led to reward. Over many episodes the
 * value "soaks back" from the goal across the grid, and a policy emerges.
 *
 * What you're watching:
 *   - cell shading = how good the agent thinks that cell is (value heatmap)
 *   - arrows       = the action it currently prefers there (the policy)
 *   - the chart    = success rate climbing as it learns the route
 *
 * Reward-driven learning like this is the lineage behind the RLHF step that
 * tunes modern chat models.
 *
 * Controls:  F = fast-forward   ·   Space = pause   ·   R = reset
 */

// ---- world layout (S start, G goal, T trap, # wall, . empty) ----
const MAP = [
  'S....#......',
  '..#..#.###..',
  '.##....#.#..',
  '...##.#..#.T',
  '.##...#.#...',
  '..#.##...##.',
  '#..#..##.#..',
  '..#...#...#.',
  '.##.#..##..G',
];

// ---- learning hyperparameters ----
const ALPHA = 0.2; // learning rate
const GAMMA = 0.95; // discount: how far the agent looks ahead
const STEP_COST = -0.02; // small penalty per move -> prefer shorter paths
const MAX_STEPS = 200; // give up an episode after this many steps

// actions: up, right, down, left
const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];

// ---- state ----
let COLS, ROWS, cell, ox, oy;
let walls, start, goal, traps;
let Q; // Q[r][c][a]
let agent, episode, stepCount, epsilon;
let successes = []; // 1/0 per recent episode, for the success-rate chart
let history = []; // success-rate samples
let stepsPerFrame = 6;
let paused = false;

const ACCENT = '#ed225d';

function setup() {
  const c = createCanvas(700, 650);
  c.parent(document.querySelector('main'));
  ROWS = MAP.length;
  COLS = MAP[0].length;
  reset();
}

function reset() {
  walls = [];
  traps = [];
  for (let r = 0; r < ROWS; r++) {
    walls[r] = [];
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      walls[r][c] = ch === '#';
      if (ch === 'S') start = { r, c };
      if (ch === 'G') goal = { r, c };
      if (ch === 'T') traps.push(r * COLS + c);
    }
  }
  // Q table
  Q = [];
  for (let r = 0; r < ROWS; r++) {
    Q[r] = [];
    for (let c = 0; c < COLS; c++) Q[r][c] = [0, 0, 0, 0];
  }
  agent = { r: start.r, c: start.c };
  episode = 1;
  stepCount = 0;
  epsilon = 1;
  successes = [];
  history = [];

  // layout the grid within the canvas
  cell = floor(min((width - 40) / COLS, (height - 150) / ROWS));
  ox = floor((width - cell * COLS) / 2);
  oy = 96;
}

function isTerminal(r, c) {
  return (r === goal.r && c === goal.c) || traps.includes(r * COLS + c);
}

function rewardAt(r, c) {
  if (r === goal.r && c === goal.c) return 1;
  if (traps.includes(r * COLS + c)) return -1;
  return STEP_COST;
}

function bestAction(r, c) {
  let a = 0;
  for (let i = 1; i < 4; i++) if (Q[r][c][i] > Q[r][c][a]) a = i;
  return a;
}

function learnStep() {
  const r = agent.r;
  const c = agent.c;

  // epsilon-greedy action
  let a;
  if (random() < epsilon) a = floor(random(4));
  else a = bestAction(r, c);

  // attempt the move (walls and edges block it -> stay put)
  let nr = r + DR[a];
  let nc = c + DC[a];
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || walls[nr][nc]) {
    nr = r;
    nc = c;
  }

  const reward = rewardAt(nr, nc);
  const terminal = isTerminal(nr, nc);

  // Q-learning update
  const future = terminal ? 0 : Math.max(...Q[nr][nc]);
  Q[r][c][a] += ALPHA * (reward + GAMMA * future - Q[r][c][a]);

  agent.r = nr;
  agent.c = nc;
  stepCount++;

  if (terminal || stepCount >= MAX_STEPS) {
    endEpisode(nr === goal.r && nc === goal.c);
  }
}

function endEpisode(reached) {
  successes.push(reached ? 1 : 0);
  if (successes.length > 50) successes.shift();
  const rate = successes.reduce((a, b) => a + b, 0) / successes.length;
  history.push(rate);
  if (history.length > 240) history.shift();

  episode++;
  epsilon = max(0.05, 1 - episode / 120); // explore less as it learns
  agent = { r: start.r, c: start.c };
  stepCount = 0;
}

function draw() {
  background(13, 13, 15);
  if (!paused) {
    for (let s = 0; s < stepsPerFrame; s++) learnStep();
  }
  drawGrid();
  drawAgent();
  drawHud();
  drawChart();
}

// ---------------------------------------------------------------------------
function drawGrid() {
  // value range for normalising the heatmap
  let maxV = 0.001;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!walls[r][c]) maxV = max(maxV, Math.max(...Q[r][c]));
    }
  }

  textFont('monospace');
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = ox + c * cell;
      const y = oy + r * cell;
      const isGoal = r === goal.r && c === goal.c;
      const isTrap = traps.includes(r * COLS + c);

      noStroke();
      if (walls[r][c]) {
        fill(30, 30, 36);
      } else if (isGoal) {
        fill(60, 200, 120);
      } else if (isTrap) {
        fill(70, 30, 40);
      } else {
        const v = Math.max(...Q[r][c]);
        if (v > 0) {
          fill(237, 34, 93, (v / maxV) * 200); // coral by value
        } else {
          fill(22, 22, 28);
        }
      }
      rect(x, y, cell - 2, cell - 2, 3);

      // policy arrow for visited, non-terminal, non-wall cells
      if (!walls[r][c] && !isGoal && !isTrap) {
        const v = Math.max(...Q[r][c]);
        if (v > 0) drawArrow(x + cell / 2, y + cell / 2, bestAction(r, c));
      }
      if (isGoal || isTrap) {
        fill(0, 0, 0, 200);
        textSize(cell * 0.4);
        textAlign(CENTER, CENTER);
        text(isGoal ? '★' : '✕', x + (cell - 2) / 2, y + (cell - 2) / 2);
      }
    }
  }
}

function drawArrow(cx, cy, a) {
  const len = cell * 0.28;
  const dx = DC[a] * len;
  const dy = DR[a] * len;
  stroke(255, 255, 255, 150);
  strokeWeight(1.5);
  line(cx - dx * 0.4, cy - dy * 0.4, cx + dx, cy + dy);
  // arrowhead
  push();
  translate(cx + dx, cy + dy);
  rotate(atan2(dy, dx));
  noStroke();
  fill(255, 255, 255, 180);
  triangle(0, 0, -5, -3, -5, 3);
  pop();
}

function drawAgent() {
  const x = ox + agent.c * cell + (cell - 2) / 2;
  const y = oy + agent.r * cell + (cell - 2) / 2;
  noStroke();
  fill(255, 220, 120);
  circle(x, y, cell * 0.5);
  fill(0, 0, 0, 120);
  circle(x, y, cell * 0.2);
}

function drawHud() {
  const rate =
    successes.length > 0
      ? successes.reduce((a, b) => a + b, 0) / successes.length
      : 0;
  push();
  textFont('monospace');
  textAlign(LEFT, BASELINE); // drawGrid leaves textAlign at CENTER
  textSize(13);
  const x = 14;
  let y = 24;
  const line = (label, val, col) => {
    noStroke();
    fill(138, 138, 149);
    text(label, x, y);
    fill(col || 230);
    text(val, x + 110, y);
    y += 19;
  };
  fill(22, 22, 26, 200);
  noStroke();
  rect(x - 8, 8, 224, 78, 6);
  line('episode', episode, ACCENT);
  line('explore ε', nf(epsilon, 0, 2));
  line('success rate', round(rate * 100) + '%', rate > 0.5 ? '#5fd38d' : 230);

  textSize(11);
  fill(110, 110, 120);
  textAlign(LEFT, BASELINE);
  text(
    (paused ? '[paused] ' : '') +
      'F fast-forward · Space pause · R reset' +
      (stepsPerFrame > 6 ? '   ▸▸ ×' + stepsPerFrame : ''),
    14,
    height - 12
  );
  pop();
}

function drawChart() {
  if (history.length < 2) return;
  const cw = 220;
  const ch = 70;
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
  text('success rate ▸ episode', cx + 8, cy + 7);

  const px = cx + 8;
  const py = cy + 26;
  const pw = cw - 16;
  const ph = ch - 34;
  const n = history.length;
  stroke(ACCENT);
  strokeWeight(1.8);
  noFill();
  beginShape();
  for (let i = 0; i < n; i++) {
    vertex(px + (i / (n - 1)) * pw, py + ph - history[i] * ph);
  }
  endShape();
  pop();
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    stepsPerFrame = stepsPerFrame > 6 ? 6 : 120;
  } else if (key === 'r' || key === 'R') {
    reset();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
}
