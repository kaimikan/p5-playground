let cols, rows;
let scale = 20; // Size of each grid cell
let flowfield = [];
let particles = [];
let zoff = 0; // Z-offset for Perlin noise
let downloadButton; // Button for downloading the canvas
let colorButtons = []; // Array to hold the color buttons
let currentColor = 200; // Default color is blue

function setup() {
  createCanvas(800, 500);
  cols = floor(width / scale);
  rows = floor(height / scale);

  flowfield = new Array(cols * rows);

  for (let i = 0; i < 500; i++) {
    particles.push(new Particle());
  }

  background(0);

  // Create the download button
  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#212121');
  downloadButton.style('color', '#bdbdbd');
  downloadButton.mousePressed(() => saveCanvas('flow-field-rgb', 'png'));

  colorContainer = createDiv();
  colorContainer.style('display', 'flex');
  colorContainer.style('flex-direction', 'row');

  // Create color buttons
  createColorButton('Blue', color(0, 0, 200));
  createColorButton('Red', color(200, 0, 0));
  createColorButton('Green', color(0, 200, 0));

  colorButtons.forEach((button) => colorContainer.child(button));
}

function draw() {
  let yoff = 0;

  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 4; // Creates flowfield angle
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += 0.1;
    }
    yoff += 0.1;
  }
  zoff += 0.01;

  for (let particle of particles) {
    particle.follow(flowfield);
    particle.update();
    particle.edges();
    particle.show();
  }
}

// Function to create color buttons
function createColorButton(label, colorValue) {
  let button = createButton(label);
  button.mousePressed(() => setColor(colorValue));
  button.style('background-color', colorValue.toString());
  button.style('color', 'white');
  button.style('display', 'inline-block');
  button.style('width', '75px');
  colorButtons.push(button);
}

// Function to set the current color based on the selected button
function setColor(colorValue) {
  currentColor = colorValue;
  particles
    .slice(0, particles.length / 2)
    .forEach((particle) => (particle.color = colorValue));
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.color = currentColor; // Set initial color based on the global variable
  }

  follow(vectors) {
    let x = floor(this.pos.x / scale);
    let y = floor(this.pos.y / scale);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    strokeWeight(2);
    stroke(this.color, random(100, 255));
    point(this.pos.x, this.pos.y);
    //this.hue = (this.hue + 0.5) % 360; // Change color over time, modifiable if needed
  }
}
