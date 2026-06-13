// Howard — a green-screen (chroma key) dancing alien composited live over a
// swappable animated background. Click for music; arrow keys change the
// backdrop; [ and ] tune how aggressively green is removed.

let vid;
let sound;
let startedSound = false;

// --- backgrounds ---
const BACKGROUNDS = ['Rainbow', 'Plasma', 'Starfield', 'Confetti', 'Synthwave'];
let bgIndex = 0;
let stars = [];
let confetti = [];

// Chroma-key strength: how strongly the green channel must dominate for a
// pixel to count as "green screen". Higher removes more. Tunable with [ ].
let keyStrength = 90;

function setup() {
  const canvs = createCanvas(640, 360);
  pixelDensity(1);
  canvs.mousePressed(playSound);
  createP('Click the canvas for music · ← → background · [ ] tune key').style(
    'color',
    'grey'
  );
  colorMode(HSB, 360, 100, 100, 255);
  noStroke();
  initStars();
  initConfetti();

  // Load media here (not in preload) so a slow or undecodable video can never
  // hang the page on the "Loading…" screen — the background animates regardless
  // and Howard fades in once his frames are ready.
  vid = createVideo('my-boy-howard.mp4', vidLoad);
  sound = loadSound('tune.mp3');
}

function draw() {
  drawBackground();

  // Composite the alien on top by copying every NON-green video pixel onto the
  // background. Only do this once the video has actually decoded a frame: a
  // browser without an H.264 codec (or the instant before load) exposes empty
  // pixels, and painting those over the background would turn the whole canvas
  // black. The guard keeps the background showing until Howard arrives.
  if (videoReady()) {
    loadPixels();
    vid.loadPixels();
    const vp = vid.pixels;
    for (let idx = 0; idx < vp.length; idx += 4) {
      const r = vp[idx];
      const g = vp[idx + 1];
      const b = vp[idx + 2];
      // "Greenness" = how much green dominates red+blue. This is far more
      // forgiving than the old strict test (g > 200 && r + b < 50), which let
      // the green leak through wherever compression dimmed the screen.
      if (2 * g - r - b > keyStrength) {
        // green screen → keep the background pixel underneath
      } else {
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
    updatePixels();
  }

  drawHud();
}

function videoReady() {
  return vid && vid.elt && vid.elt.readyState >= 2 && vid.width > 0;
}

// --------------------------------------------------------------------------
// Backgrounds — each draws a full frame onto the canvas before the alien is
// composited over it. Add one to BACKGROUNDS and give it a case below.
// --------------------------------------------------------------------------
function drawBackground() {
  switch (BACKGROUNDS[bgIndex]) {
    case 'Rainbow':
      bgRainbow();
      break;
    case 'Plasma':
      bgPlasma();
      break;
    case 'Starfield':
      bgStarfield();
      break;
    case 'Confetti':
      bgConfetti();
      break;
    case 'Synthwave':
      bgSynthwave();
      break;
  }
}

function bgRainbow() {
  for (let i = 0; i < 36; i += 1) {
    const h = (frameCount + i * 10) % 360;
    fill(h, 60, 100);
    rect(0, i * 10, width, 10);
  }
}

function bgPlasma() {
  const cell = 16;
  const t = frameCount * 0.03;
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const v =
        sin(x * 0.02 + t) + sin(y * 0.03 - t) + sin((x + y) * 0.02 + t * 0.7);
      fill(((v + 3) / 6) * 360, 75, 100);
      rect(x, y, cell, cell);
    }
  }
}

function initStars() {
  stars = [];
  for (let i = 0; i < 150; i += 1) {
    stars.push({ x: random(width), y: random(height), z: random(0.3, 1.5) });
  }
}

function bgStarfield() {
  background(245, 70, 10);
  fill(0, 0, 100);
  for (const s of stars) {
    circle(s.x, s.y, s.z * 1.7);
    s.x -= s.z * 1.6;
    if (s.x < 0) {
      s.x = width;
      s.y = random(height);
    }
  }
}

function initConfetti() {
  confetti = [];
  for (let i = 0; i < 130; i += 1) {
    confetti.push({
      x: random(width),
      y: random(height),
      s: random(4, 9),
      h: random(360),
      v: random(1, 3),
    });
  }
}

function bgConfetti() {
  background(0, 0, 8);
  for (const c of confetti) {
    fill(c.h, 80, 100);
    rect(c.x, c.y, c.s, c.s);
    c.y += c.v;
    c.x += sin((frameCount + c.h) * 0.05);
    if (c.y > height) {
      c.y = -c.s;
      c.x = random(width);
    }
  }
}

function bgSynthwave() {
  // gradient sky
  for (let i = 0; i < height / 2; i += 1) {
    fill(map(i, 0, height / 2, 300, 30), 85, map(i, 0, height / 2, 35, 100));
    rect(0, i, width, 1);
  }
  const horizon = height / 2;
  fill(285, 90, 14);
  rect(0, horizon, width, height - horizon);
  // receding neon grid
  stroke(325, 100, 100);
  strokeWeight(1.5);
  const scroll = (frameCount % 30) / 30;
  for (let i = 0; i < 13; i += 1) {
    const yy = horizon + pow((i + scroll) / 13, 2) * (height - horizon);
    line(0, yy, width, yy);
  }
  for (let x = -10; x <= 10; x += 1) {
    line(width / 2 + x * 18, horizon, width / 2 + x * 90, height);
  }
  noStroke();
}

// --------------------------------------------------------------------------
function drawHud() {
  push();
  colorMode(RGB, 255);
  noStroke();
  fill(0, 0, 0, 140);
  rect(0, height - 22, width, 22);
  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(
    '▶ ' +
      BACKGROUNDS[bgIndex] +
      '   ← → background   [ ] key=' +
      keyStrength +
      (videoReady() ? '' : '   (loading video…)'),
    8,
    height - 11
  );
  pop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    bgIndex = (bgIndex + BACKGROUNDS.length - 1) % BACKGROUNDS.length;
  } else if (keyCode === RIGHT_ARROW) {
    bgIndex = (bgIndex + 1) % BACKGROUNDS.length;
  } else if (key === ']') {
    keyStrength = min(keyStrength + 10, 300);
  } else if (key === '[') {
    keyStrength = max(keyStrength - 10, 10);
  }
}

// Mute the video and loop it once it has loaded.
function vidLoad() {
  vid.volume(0);
  vid.loop();
  vid.hide();
}

function playSound() {
  if (!startedSound && sound && sound.isLoaded()) {
    sound.setVolume(0.05);
    sound.loop();
    startedSound = true;
  }
}
