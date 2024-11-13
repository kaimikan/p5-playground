// Double Pendulum Variables
let r1 = 125; // Length of first pendulum arm
let r2 = 125; // Length of second pendulum arm
let m1 = 10; // Mass of first pendulum bob
let m2 = 10; // Mass of second pendulum bob
let a1 = Math.PI / 2; // Initial angle of first pendulum
let a2 = Math.PI / 2; // Initial angle of second pendulum
let a1_v = 0; // Angular velocity of first pendulum
let a2_v = 0; // Angular velocity of second pendulum
let g = 1; // Gravity constant

let px2 = -1;
let py2 = -1;
let cx, cy;

// Graphics for trajectory
let trajectoryCanvas;

function setup() {
  createCanvas(800, 600);
  pixelDensity(1);
  cx = width / 2;
  cy = 50;

  // Create an offscreen buffer for the trajectory
  trajectoryCanvas = createGraphics(width, height);
  trajectoryCanvas.background(200);
  trajectoryCanvas.translate(cx, cy);

  // Sliders for parameters
  r1Slider = createSlider(50, 200, r1);
  r2Slider = createSlider(50, 200, r2);

  m1Slider = createSlider(1, 20, m1);
  m2Slider = createSlider(1, 20, m2);
}

function draw() {
  // Update parameters from sliders
  r1 = r1Slider.value();
  r2 = r2Slider.value();
  m1 = m1Slider.value();
  m2 = m2Slider.value();

  // Draw background on the main canvas
  background(200);
  imageMode(CORNER);
  image(trajectoryCanvas, 0, 0, width, height);

  // Labels for sliders
  fill(0);
  noStroke();

  text('Length of first pendulum (r1): ' + r1, 30, height - 125);
  text('Length of second pendulum (r2): ' + r2, 30, height - 95);
  text('Mass of first pendulum (m1): ' + m1, 30, height - 65);
  text('Mass of second pendulum (m2): ' + m2, 30, height - 35);

  // Calculate angular accelerations (Euler's method)
  let num1 = -g * (2 * m1 + m2) * sin(a1);
  let num2 = -m2 * g * sin(a1 - 2 * a2);
  let num3 = -2 * sin(a1 - a2) * m2;
  let num4 = a2_v * a2_v * r2 + a1_v * a1_v * r1 * cos(a1 - a2);
  let denom = r1 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let a1_a = (num1 + num2 + num3 * num4) / denom;

  num1 = 2 * sin(a1 - a2);
  num2 = a1_v * a1_v * r1 * (m1 + m2);
  num3 = g * (m1 + m2) * cos(a1);
  num4 = a2_v * a2_v * r2 * m2 * cos(a1 - a2);
  denom = r2 * (2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / denom;

  translate(cx, cy);
  stroke(0);
  strokeWeight(2);

  // Calculate position of the first bob
  let x1 = r1 * sin(a1);
  let y1 = r1 * cos(a1);

  // Calculate position of the second bob
  let x2 = x1 + r2 * sin(a2);
  let y2 = y1 + r2 * cos(a2);

  // Draw the bobs on the main canvas
  strokeWeight(2);
  line(0, 0, x1, y1);
  fill(0);
  ellipse(x1, y1, m1 * 2, m1 * 2);

  line(x1, y1, x2, y2);
  fill(0);
  ellipse(x2, y2, m2 * 2, m2 * 2);

  // Update velocities and angles
  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;

  // Damping effect
  // a1_v *= 0.99;
  // a2_v *= 0.99;

  // Update the trajectory on the offscreen canvas``
  trajectoryCanvas.stroke(0);
  if (frameCount > 1) {
    stroke(0, 100);
    strokeWeight(0.5);
    trajectoryCanvas.line(px2, py2, x2, y2);
  }

  px2 = x2;
  py2 = y2;
}
