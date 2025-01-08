// Old TV Static Simulation
function setup() {
  createCanvas(800, 500);

  // Download Button
  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#212121');
  downloadButton.style('color', '#bdbdbd');
  downloadButton.mousePressed(() => saveCanvas('tv-static', 'jpg'));

  noStroke();
  frameRate(30); // Simulates the refresh rate of old TV static
}

function draw() {
  let density = pixelDensity(); // Get the pixel density
  let adjustedWidth = width * density;
  let adjustedHeight = height * density;

  loadPixels();
  for (let y = 0; y < adjustedHeight; y++) {
    for (let x = 0; x < adjustedWidth; x++) {
      let index = 4 * (x + y * adjustedWidth); // Adjusted indexing for pixel density
      let col = random(255); // Random grayscale value
      pixels[index] = col; // Red
      pixels[index + 1] = col; // Green
      pixels[index + 2] = col; // Blue
      pixels[index + 3] = 255; // Alpha
    }
  }
  updatePixels();
}
