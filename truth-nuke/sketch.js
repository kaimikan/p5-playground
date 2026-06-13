/*
 * Truth Nuke — press the button, drop two mushroom clouds, and a
 * hard-to-swallow pill detonates on screen. A meme toy in the spirit of
 * Howard: cut-out character composited over a p5-drawn apocalypse, with
 * particle-ish mushroom clouds, a synthesized boom (no audio file), screen
 * shake, and a "truth nuke" fact that slams in.
 *
 * Click DROP TRUTH NUKE (or press the spacebar / click the canvas).
 */

let charImg;
let W = 780;
let H = 575;

let left, right; // the two explosions
let shake = 0;
let flash = 0;
let fact = '';
let factAge = -1;
let armed = true; // prevent re-trigger mid-blast

// synthesized sound
let boomOsc, boomEnv, noise, noiseEnv, soundReady = false;

const FACTS = [
  'You will never read every book you want to read.',
  'Nobody is thinking about you as much as you think they are.',
  "The book you're 'going to read' is judging you.",
  'Most of your problems are scheduling problems.',
  'Your screen-time report is not a typo.',
  "You've already met most of the friends you'll ever have.",
  'Comfort is the slowest way to fail.',
  'Most arguments online change exactly zero minds.',
  'Discipline is just remembering what you actually want.',
  'Someone less qualified than you is doing the thing you keep putting off.',
  'The gym membership does nothing if you never go.',
  'Hard work beats talent — until talent starts working hard.',
  'Your future self is watching you choose this right now.',
  'Being busy is not the same as being productive.',
  "'I'll do it tomorrow' has a perfect 0% completion rate.",
  'You cannot out-google a lack of thinking.',
];

function preload() {
  charImg = loadImage('character.png');
}

function setup() {
  const c = createCanvas(W, H);
  c.parent(document.querySelector('main'));

  left = new Blast(W * 0.17, H * 0.6, 1.0, 11);
  right = new Blast(W * 0.83, H * 0.56, 1.12, 29);

  const btn = createButton('☢  DROP TRUTH NUKE');
  btn.id('nuke-btn');
  btn.mousePressed(detonate);

  // build the synth chain (started lazily on first user gesture)
  if (typeof p5.Oscillator === 'function') {
    boomOsc = new p5.Oscillator('sine');
    boomEnv = new p5.Envelope();
    boomEnv.setADSR(0.005, 0.5, 0, 0.4);
    boomEnv.setRange(0.9, 0);
    noise = new p5.Noise('brown');
    noiseEnv = new p5.Envelope();
    noiseEnv.setADSR(0.001, 0.35, 0, 0.3);
    noiseEnv.setRange(0.6, 0);
  }
  textFont('Arial');
}

function detonate() {
  if (!armed) return;
  armed = false;
  left.fire();
  right.fire();
  shake = 16;
  flash = 200;
  fact = random(FACTS);
  factAge = -18; // delay the text until the blast peaks
  playBoom();
}

function playBoom() {
  if (!boomOsc) return;
  if (!soundReady) {
    userStartAudio();
    boomOsc.start();
    boomOsc.amp(boomEnv);
    noise.start();
    noise.amp(noiseEnv);
    soundReady = true;
  }
  boomOsc.freq(110);
  boomOsc.freq(28, 0.5); // pitch drop = the "whump"
  boomEnv.play(boomOsc);
  noiseEnv.play(noise);
}

function draw() {
  push();
  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
    shake *= 0.88;
    if (shake < 0.4) shake = 0;
  }

  drawSky();
  left.run();
  right.run();
  image(charImg, 0, 0, W, H);
  drawFact();
  pop();

  // white flash sits above everything (outside the shake transform)
  if (flash > 0) {
    noStroke();
    fill(255, 245, 230, flash);
    rect(0, 0, W, H);
    flash *= 0.82;
    if (flash < 2) flash = 0;
  }

  // re-arm once both blasts have finished
  if (!armed && left.done() && right.done()) armed = true;
}

// ---------------------------------------------------------------------------
function drawSky() {
  noStroke();
  for (let y = 0; y < H; y++) {
    const t = y / H;
    let r, g, b;
    if (t < 0.78) {
      const u = t / 0.78;
      r = lerp(255, 230, u);
      g = lerp(150, 70, u);
      b = lerp(45, 20, u);
    } else {
      const u = (t - 0.78) / 0.22;
      r = lerp(190, 120, u);
      g = lerp(45, 20, u);
      b = lerp(15, 8, u);
    }
    fill(r, g, b);
    rect(0, y, W, 1);
  }
  // a few lava streaks on the ground
  stroke(90, 18, 8, 150);
  strokeWeight(2);
  for (let i = 0; i < 6; i++) {
    const y = H * 0.8 + i * (H * 0.2) / 6;
    line(0, y, W, y + sin(i) * 4);
  }
  noStroke();
}

function drawFact() {
  if (factAge < 0) {
    factAge++;
    return;
  }
  factAge++;
  const prog = constrain(factAge / 10, 0, 1);
  const ease = 1 - pow(1 - prog, 3);
  const alpha = 255 * ease;

  const boxH = H * 0.3;
  const boxY = H - boxH - 10;
  push();
  rectMode(CORNER);
  noStroke();
  fill(10, 6, 4, 200 * ease);
  rect(16, boxY, W - 32, boxH, 10);
  fill(237, 34, 93, 220 * ease);
  rect(16, boxY, W - 32, 5);

  translate(W / 2, boxY + boxH / 2);
  scale(lerp(1.25, 1, ease));
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  // shadow for readability
  fill(0, 0, 0, alpha);
  text(fact, -W / 2 + 38 + 2, -boxH / 2 + 2, W - 76, boxH);
  fill(255, 255, 255, alpha);
  text(fact, -W / 2 + 38, -boxH / 2, W - 76, boxH);
  pop();
}

// ---------------------------------------------------------------------------
// Mushroom-cloud blast: a billowing cauliflower cap on a rising stem, plus a
// shockwave ring, base fireball, and flying embers.
// ---------------------------------------------------------------------------
function Blast(x, y, scl, seed) {
  this.x = x;
  this.y = y;
  this.scl = scl;
  this.seed = seed;
  this.age = -1;
  this.dur = 70;
  this.embers = [];

  this.fire = function () {
    this.age = 0;
    this.embers = [];
    const n = 26;
    for (let i = 0; i < n; i++) {
      const a = random(-PI, 0); // upward hemisphere
      const sp = random(3, 9) * this.scl;
      this.embers.push({
        x: this.x,
        y: this.y,
        vx: cos(a) * sp,
        vy: sin(a) * sp,
        life: 1,
        r: random(2, 5),
      });
    }
  };

  this.done = function () {
    return this.age < 0 || this.age > this.dur + 50;
  };

  this.run = function () {
    if (this.age < 0) return;
    this.age++;
    const t = constrain(this.age / this.dur, 0, 1);
    const ease = 1 - pow(1 - t, 3);
    const fade =
      this.age <= this.dur ? 1 : constrain(1 - (this.age - this.dur) / 50, 0, 1);

    const capH = 215 * this.scl * ease; // how high the cap has risen
    const capY = this.y - capH;
    const capR = 95 * this.scl * ease;
    const stemW = 34 * this.scl * (0.45 + 0.55 * ease);

    noStroke();

    // shockwave ring (early)
    if (this.age < 26) {
      const rr = this.age * 11 * this.scl;
      noFill();
      stroke(255, 235, 200, 200 * (1 - this.age / 26));
      strokeWeight(3 * this.scl);
      circle(this.x, this.y, rr * 2);
      noStroke();
    }

    // base fireball
    if (t < 0.55) {
      const fr = lerp(20, 70, t) * this.scl;
      fill(255, 230, 120, 230 * (1 - t / 0.55) * fade);
      circle(this.x, this.y, fr * 2);
      fill(255, 150, 40, 200 * (1 - t / 0.55) * fade);
      circle(this.x, this.y, fr * 1.3);
    }

    // rising stem (column of smoke puffs)
    const steps = 9;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const sy = lerp(this.y, capY, f);
      const wob = sin(this.seed + f * 6 + this.age * 0.05) * 6 * this.scl;
      const g = lerp(70, 130, f); // darker low, lighter high
      fill(g, g * 0.92, g * 0.86, 235 * fade);
      circle(this.x + wob, sy, stemW * (1 - 0.25 * f));
    }

    // billowing cap (cauliflower of overlapping puffs)
    const puffs = 13;
    for (let i = 0; i < puffs; i++) {
      const a = (i / puffs) * TWO_PI;
      const nz =
        0.55 + 0.45 * sin(this.seed * 1.7 + i * 1.3 + this.age * 0.04);
      const px = this.x + cos(a) * capR * nz;
      const py = capY + sin(a) * capR * 0.62 * nz - capR * 0.15;
      const pr = capR * (0.5 + 0.25 * nz);
      const g = map(sin(a), -1, 1, 150, 95); // top lighter, bottom darker
      fill(g, g * 0.9, g * 0.85, 240 * fade);
      circle(px, py, pr);
    }
    // bright core glow inside the cap, early on
    if (t < 0.5) {
      fill(255, 180, 70, 150 * (1 - t / 0.5) * fade);
      circle(this.x, capY, capR * 0.8);
    }

    // embers
    for (const e of this.embers) {
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.18; // gravity
      e.vx *= 0.99;
      e.life -= 0.022;
      if (e.life <= 0) continue;
      fill(255, lerp(120, 220, e.life), 60, 255 * e.life * fade);
      circle(e.x, e.y, e.r);
    }
    this.embers = this.embers.filter((e) => e.life > 0);
  };
}

// ---------------------------------------------------------------------------
function mousePressed() {
  // clicking the canvas (not the button) also detonates
  if (mouseX >= 0 && mouseX <= W && mouseY >= 0 && mouseY <= H) detonate();
}

function keyPressed() {
  if (key === ' ') {
    detonate();
    return false;
  }
}
