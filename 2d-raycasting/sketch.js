let walls = [];
let ray;
let particle;
let xOffset = 0;
let yOffset = 10000;

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 5; i++) {
    let x1 = random(width);
    let x2 = random(width);
    let y1 = random(height);
    let y2 = random(height);
    walls[i] = new Boundary(x1, y1, x2, y2);
  }
  // window edge walls
  walls.push(new Boundary(0, 0, width, 0));
  walls.push(new Boundary(width, 0, width, height));
  walls.push(new Boundary(width, height, 0, height));
  walls.push(new Boundary(0, height, 0, 0));
  particle = new Particle();
}

function draw() {
  background(0);
  for (let wall of walls) {
    wall.show();
  }

  console.log(width, height);
  console.log(mouseX, mouseY);
  if (0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height) {
    // move with mouse
    particle.update(mouseX, mouseY);
  } else {
    // move with perlin noise
    particle.update(noise(xOffset) * width, noise(yOffset) * height);
    xOffset += 0.01;
    yOffset += 0.01;
  }

  particle.show();
  particle.look(walls);
}
