let x = 0;
let y = 0;

function setup() {
  createCanvas(400, 400);
  background(0);
  stroke(0, 255, 0);
  strokeWeight(1);
}

function draw() {
  for (let i = 0; i < 100; i++) {
    drawFern();
  }
}

function drawFern() {
  // Generate a random number to select a transformation
  let r = random(1);
  let nextX, nextY;

  if (r < 0.01) {
    // Transformation 1
    nextX = 0;
    nextY = 0.16 * y;
  } else if (r < 0.86) {
    // Transformation 2
    nextX = 0.85 * x + 0.04 * y;
    nextY = -0.04 * x + 0.85 * y + 1.6;
  } else if (r < 0.93) {
    // Transformation 3
    nextX = 0.2 * x - 0.26 * y;
    nextY = 0.23 * x + 0.22 * y + 1.6;
  } else {
    // Transformation 4
    nextX = -0.15 * x + 0.28 * y;
    nextY = 0.26 * x + 0.24 * y + 0.44;
  }

  // Update the current point
  x = nextX;
  y = nextY;

  // Map the point to canvas space and draw it
  let px = map(x, -2.182, 2.6558, 0, width);
  let py = map(y, 0, 9.9983, height, 0);
  point(px, py);
}
