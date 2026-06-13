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
let boomOsc, boomEnv, boomNoise, noiseEnv, soundReady = false;

const FACTS = [
  'The story you tell about yourself is self-reinforcing: believe you are unlucky or depressed and you make it real — and the reverse is just as true.',
  'No one is coming to save you. That is not despair, it is permission.',
  'You are roughly the average of the five people you spend the most time with.',
  'The pain of discipline weighs ounces; the pain of regret weighs tons.',
  "You don't lack time, you lack priorities — you found the time for this.",
  "Most 'overthinking' is just avoiding a decision you have already made.",
  'You become whatever you repeatedly tolerate and repeatedly practice.',
  'Where your attention goes is the truest measure of what you actually value.',
  'The skills you keep avoiding are the ones quietly running your life.',
  'Motivation follows action, not the other way around.',
  'Your standards, not your dreams, decide how your life actually goes.',
  'Nobody is thinking about you as much as you think they are.',
  'You will never read every book you want to read.',
  "You've already met most of the friends you'll ever have.",
  'Comfort is a slow, pleasant way to fail.',
  'Most arguments online change exactly zero minds.',
  'Discipline is just remembering what you actually want.',
  'Someone less qualified than you is doing the thing you keep putting off.',
  'Being busy is not the same as being productive.',
  "'I'll do it tomorrow' has a perfect 0% completion rate.",
];

// shuffle-bag: every fact is shown once before any repeats
let factBag = [];
let lastFactIdx = -1;
function pickFact() {
  if (factBag.length === 0) {
    factBag = Array.from({ length: FACTS.length }, (_, i) => i);
    for (let i = factBag.length - 1; i > 0; i--) {
      const j = floor(random(i + 1));
      [factBag[i], factBag[j]] = [factBag[j], factBag[i]];
    }
    // don't let a fresh bag immediately repeat the last fact shown
    if (factBag[factBag.length - 1] === lastFactIdx && factBag.length > 1) {
      [factBag[factBag.length - 1], factBag[0]] =
        [factBag[0], factBag[factBag.length - 1]];
    }
  }
  lastFactIdx = factBag.pop();
  return FACTS[lastFactIdx];
}

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
    boomNoise = new p5.Noise('brown');
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
  fact = pickFact();
  factAge = -18; // delay the text until the blast peaks
  playBoom();
}

function playBoom() {
  if (!boomOsc) return;
  if (!soundReady) {
    userStartAudio();
    boomOsc.start();
    boomOsc.amp(boomEnv);
    boomNoise.start();
    boomNoise.amp(noiseEnv);
    soundReady = true;
  }
  boomOsc.freq(110);
  boomOsc.freq(28, 0.5); // pitch drop = the "whump"
  boomEnv.play(boomOsc);
  noiseEnv.play(boomNoise);
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
  if (!fact) return; // nothing until the first detonation
  if (factAge < 0) {
    factAge++;
    return;
  }
  factAge++;
  const prog = constrain(factAge / 10, 0, 1);
  const ease = 1 - pow(1 - prog, 3);
  const alpha = 255 * ease;
  // longer pills get smaller type so they fit the band
  const ts = fact.length > 95 ? 21 : fact.length > 60 ? 25 : 30;

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
  textSize(ts);
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
  this.fires = [];

  this.spawnFire = function (n, atY, spread, vyMin, vyMax) {
    for (let i = 0; i < n; i++) {
      this.fires.push({
        x: this.x + random(-spread, spread),
        y: atY + random(-6, 6),
        vx: random(-1.6, 1.6) * this.scl,
        vy: -random(vyMin, vyMax) * this.scl,
        life: random(0.7, 1),
        decay: random(0.012, 0.03),
        size: random(7, 18) * this.scl,
      });
    }
  };

  this.fire = function () {
    this.age = 0;
    this.embers = [];
    this.fires = [];
    this.spawnFire(46, this.y, 26 * this.scl, 2, 8); // initial fireball burst
    const n = 30;
    for (let i = 0; i < n; i++) {
      const a = random(-PI, 0); // upward hemisphere
      const sp = random(3, 10) * this.scl;
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

    // fire particles (additive glow) emitted from the base and lower column
    if (this.age < 34) {
      this.spawnFire(5, this.y, 22 * this.scl, 2, 6);
      this.spawnFire(3, lerp(this.y, capY, 0.3), 16 * this.scl, 1, 4);
    }
    push();
    blendMode(ADD);
    noStroke();
    for (const f of this.fires) {
      f.x +=
        f.vx +
        (noise(f.x * 0.012, f.y * 0.012, this.age * 0.06) - 0.5) * 2.4 * this.scl;
      f.y += f.vy;
      f.vy += 0.05 * this.scl; // gravity slows the rise
      f.vy *= 0.99;
      f.vx *= 0.98;
      f.life -= f.decay;
      if (f.life <= 0) continue;
      const col = fireColor(f.life);
      const a = 255 * f.life * fade;
      fill(col[0], col[1], col[2], a * 0.45); // soft glow
      circle(f.x, f.y, f.size * 1.9);
      fill(min(col[0] + 40, 255), min(col[1] + 50, 255), col[2], a); // hot core
      circle(f.x, f.y, f.size * 0.8);
    }
    blendMode(BLEND);
    pop();
    this.fires = this.fires.filter((f) => f.life > 0);

    // embers / sparks
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

// fire gradient by particle life: white-hot → yellow → orange → red → ember
function fireColor(t) {
  if (t > 0.7) {
    const u = (t - 0.7) / 0.3;
    return [255, lerp(195, 250, u), lerp(70, 210, u)];
  }
  if (t > 0.4) {
    const u = (t - 0.4) / 0.3;
    return [255, lerp(110, 195, u), lerp(25, 70, u)];
  }
  if (t > 0.15) {
    const u = (t - 0.15) / 0.25;
    return [lerp(200, 255, u), lerp(45, 110, u), 20];
  }
  const u = t / 0.15;
  return [lerp(90, 200, u), lerp(20, 45, u), 12];
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
