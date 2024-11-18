let bricks = [];
let numBricks = 25;
let hintP;

function setup() {
  createCanvas(800, 400, WEBGL);
  createBricks();
  // Add instructions below the canvas
  createP(
    'Click and drag to rotate the view of the canvas. Scroll to zoom in or out.'
  ).style('color', 'lightgrey');
}

// Function to create a row of bricks
function createBricks() {
  let spacing = width / numBricks; // Space bricks evenly across canvas
  for (let i = 0; i < numBricks; i++) {
    let x = i * spacing;
    let z = 0;
    let angle = i * 10;
    let color =
      i < numBricks / 2
        ? i * (255 / (numBricks / 2))
        : (numBricks - i) * (255 / (numBricks / 2));
    bricks.push(new Brick(x, z, angle, color));
  }
}

function draw() {
  background(200);

  // Set the camera
  orbitControl();
  translate(-width / 2 + width / numBricks / 2, 0, 0); // Shift the view

  // Draw and update all bricks
  for (let brick of bricks) {
    brick.update();
    brick.show();
  }
}

class Brick {
  constructor(x, z, angle, color) {
    this.x = x;
    this.z = z;
    this.width = 30;
    this.height = 10;
    this.depth = 100;
    this.angle = angle; // Rotation angle
    this.color = color;
  }

  // Update brick physics
  update() {
    this.angle += 0.05; // Rotate the brick slowly
  }

  // Render the brick
  show() {
    push();
    translate(this.x, -this.height / 2, this.z); // Position brick
    rotateX(this.angle); // Apply tilt
    fill(this.color);
    stroke(0);
    box(this.width, this.height, this.depth); // brick shape
    pop();
  }
}
