let yoff = 0.0; // Starting offset for Perlin noise

function setup() {
  createCanvas(600, 400);
  noFill();
  stroke(255);
}

function draw() {
  background(0);
  yoff = yoff + 0.01; // Update y-offset for smooth animation

  for (let y = 0; y <= height; y += 10) {
    beginShape();
    let xoff = 0; // Reset x-offset for each line

    for (let x = 0; x <= width; x += 10) {
      // Generate Perlin noise for each point
      let n = noise(xoff, yoff + y * 0.02);
      let yNoise = map(n, 0, 1, -50, 50);

      vertex(x, y + yNoise); // Move point according to Perlin noise
      xoff += 0.1;
    }

    endShape();
  }
}
