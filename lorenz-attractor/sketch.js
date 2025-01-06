let x = 1;
let y = 0;
let z = 0;

let sigma = 10;
let rho = 28;
let beta = 8 / 3;

let dt = 0.01; // Time step
let hueValue = 0; // Starting hue value

function setup() {
  createCanvas(500, 500);
  strokeWeight(3);
  colorMode(HSB, 360, 100, 100);
  background(0, 0);
}

function draw() {
  // Calculate the Lorenz Attractor
  let dx = sigma * (y - x);
  let dy = x * (rho - z) - y;
  let dz = x * y - beta * z;

  // Update the positions
  x += dx * dt;
  y += dy * dt;
  z += dz * dt;

  // Map the 3D coordinates to 2D screen space
  let px = map(x, -20, 20, 0, width);
  let py = map(y, -20, 20, 0, height);

  // Set the color based on the hue value
  let trailColor = color(hueValue, 80, 80); // Saturation and brightness are fixed
  stroke(trailColor);

  // Draw the point with a trail effect
  point(px, py);

  // Gradually change the hue
  hueValue += 0.5; // Increment hue value for color transition
  if (hueValue > 360) {
    hueValue = 0; // Reset hue when it exceeds 360 degrees
  }
}
