let gridSize = 5; // Size of each "pixel" block (adjust as needed)
let droplets = []; // Array to store the rain droplets
let dropletAmount = 100;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100); // HSB mode for hue manipulation
  frameRate(60);

  // Create initial set of droplets
  for (let i = 0; i < dropletAmount; i++) {
    droplets.push(new Droplet());
  }
}

// Draw function with no borders around rectangles but with visible droplets
function draw() {
  // Draw rainbow background
  noStroke(); // Disable stroke for the rectangles
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      let hueValue =
        (map(x + y, 0, width + height, 0, 360) + frameCount / 3) % 360;
      fill(hueValue, 75, 100); // Reduced saturation to 75
      rect(x, y, gridSize, gridSize);
    }
  }

  // Draw rain droplets on top of the rainbow background
  for (let droplet of droplets) {
    droplet.update();
    droplet.show();
  }
}
