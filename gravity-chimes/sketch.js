/*
 * Gravity Chimes — a pendulum wave made of bouncing balls.
 *
 * Fifteen balls fall from the same height, but each under its OWN gravity,
 * tuned so ball i completes exactly (20 + i) bounces per 60-second cycle.
 * They start in unison, drift into canons and waves, dissolve into chaos,
 * and — 60 seconds later — snap back into perfect sync. Every floor hit
 * chimes that ball's note on a C-major pentatonic scale (left = low),
 * synthesized live (no audio files). Inspired by @particlesflow.
 *
 * Positions are computed analytically from time (a pure parabola per ball),
 * so the phasing never drifts, and pausing/restarting is exact.
 *
 * Click for sound (then click toggles mute) · M mute · Space pause · R restart.
 */

const N = 15;
const PERIOD = 60; // seconds until every ball re-syncs
const BASE = 20; // the slowest ball bounces 20 times per cycle
const RAD = 9;

// C-major pentatonic, three octaves — one note per ball, left = low
const SCALE_MIDI = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93];

let FLOOR, DROP;
let balls = [];
let ripples = [];
let t = 0;
let paused = false;
let audioOn = false;
let muted = false;
let voices = [];
let voiceIdx = 0;
let reverb;

function setup() {
  const w = constrain(windowWidth - 20, 640, 900);
  const h = constrain(windowHeight - 20, 480, 620);
  const c = createCanvas(w, h);
  c.parent(document.querySelector('main'));
  colorMode(HSB, 360, 100, 100, 1);
  strokeCap(ROUND);

  FLOOR = height - 78;
  DROP = height - 210;
  const m = 64;
  for (let i = 0; i < N; i++) {
    balls.push({
      x: map(i, 0, N - 1, m, width - m),
      T: PERIOD / (BASE + i), // full bounce period; gravity is implied
      midi: SCALE_MIDI[i],
      hue: map(i, 0, N - 1, 28, 52), // deep amber → pale gold
      sat: map(i, 0, N - 1, 85, 30),
      bri: map(i, 0, N - 1, 88, 100),
      cycles: 0,
      hitT: -9,
    });
  }
}

// ---------------------------------------------------------------------------
// Sound: a small pool of triangle-wave voices with percussive envelopes,
// shared through one reverb. Built lazily on the first user gesture.
// ---------------------------------------------------------------------------
function initAudio() {
  userStartAudio();
  reverb = new p5.Reverb();
  reverb.drywet(0.35);
  for (let k = 0; k < 10; k++) {
    const osc = new p5.Oscillator('triangle');
    const env = new p5.Envelope();
    env.setADSR(0.002, 0.34, 0, 0.08);
    env.setRange(0.16, 0);
    osc.start();
    osc.amp(0);
    reverb.process(osc, 1.8, 2);
    voices.push({ osc, env });
  }
  audioOn = true;
}

function chime(midi) {
  if (!audioOn || muted) return;
  const v = voices[voiceIdx++ % voices.length];
  v.osc.freq(midiToFreq(midi));
  v.env.play(v.osc);
}

// ---------------------------------------------------------------------------
function hit(b) {
  b.hitT = t;
  ripples.push({ x: b.x, t0: t, hue: b.hue });
  chime(b.midi);
}

function draw() {
  if (!paused) t += min(deltaTime, 50) / 1000;
  background(222, 40, 7);

  // floor
  stroke(220, 25, 45, 0.5);
  strokeWeight(1);
  line(36, FLOOR, width - 36, FLOOR);

  // ball positions — analytic parabola per ball; a wrap of the phase = a hit
  const pts = [];
  for (const b of balls) {
    const c = floor((t + b.T / 2) / b.T);
    if (c > b.cycles) hit(b);
    b.cycles = c;
    const u = ((t + b.T / 2) % b.T) / b.T;
    const y = FLOOR - RAD - DROP * (1 - sq(2 * u - 1));
    pts.push({ x: b.x, y, b });
  }

  // the wave: a faint thread through the ball centres
  noFill();
  stroke(210, 30, 80, 0.16);
  strokeWeight(1.2);
  beginShape();
  curveVertex(pts[0].x, pts[0].y);
  for (const q of pts) curveVertex(q.x, q.y);
  curveVertex(pts[N - 1].x, pts[N - 1].y);
  endShape();

  // impact ripples along the floor
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    const age = t - rp.t0;
    if (age > 0.7 || age < 0) {
      ripples.splice(i, 1);
      continue;
    }
    const p = age / 0.7;
    noFill();
    stroke(rp.hue, 50, 100, 0.5 * (1 - p));
    strokeWeight(1.5);
    ellipse(rp.x, FLOOR + 1, 10 + p * 54, (10 + p * 54) * 0.28);
  }

  // balls: soft glow (brightening briefly on impact), body, highlight
  noStroke();
  for (const q of pts) {
    const f = max(0, 1 - (t - q.b.hitT) / 0.25);
    fill(q.b.hue, q.b.sat, q.b.bri, 0.1 + 0.22 * f);
    circle(q.x, q.y, RAD * (4.2 + 1.6 * f));
    fill(q.b.hue, q.b.sat, q.b.bri, 0.95);
    circle(q.x, q.y, RAD * 2);
    fill(q.b.hue, q.b.sat * 0.3, 100, 0.9);
    circle(q.x - RAD * 0.3, q.y - RAD * 0.35, RAD * 0.7);
  }

  drawHud();
}

function drawHud() {
  textFont('monospace');
  noStroke();

  textAlign(RIGHT, TOP);
  textSize(11);
  fill(210, 15, 90, 0.3);
  text('resync in ' + ceil(PERIOD - (t % PERIOD)) + 's', width - 18, 14);

  textAlign(CENTER, BOTTOM);
  if (!audioOn) {
    textSize(13);
    fill(45, 40, 100, 0.45 + 0.25 * sin(millis() / 400));
    text('click for sound', width / 2, height - 22);
  } else {
    textSize(10);
    fill(210, 10, 90, 0.25);
    text(
      (muted ? 'muted · click to unmute' : 'click to mute') +
        ' · space pause · r restart',
      width / 2,
      height - 18
    );
  }
}

function keyPressed() {
  if (key === ' ') {
    paused = !paused;
    return false;
  }
  if (key === 'r' || key === 'R') restart();
  if (key === 'm' || key === 'M') {
    if (!audioOn) initAudio();
    else muted = !muted;
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  if (!audioOn) initAudio();
  else muted = !muted;
}

function restart() {
  t = 0;
  ripples = [];
  for (const b of balls) {
    b.cycles = 0;
    b.hitT = -9;
  }
  paused = false;
}
