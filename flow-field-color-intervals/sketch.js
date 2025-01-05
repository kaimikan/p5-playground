let cols, rows;
let scl = 20; // Scale of the flow field
let particles = [];
let flowField = [];
let zOffset = 0; // For Perlin noise in 3D
let colorChangeInterval = 1; // Interval in frames to change color
let nextColorChange = 0; // Frame count for the next color change
let currentColor; // Current color for the particles

let intervalSlider, sizeSlider; // Sliders for interval and size
let isGrayscale = false; // Toggle for grayscale mode
let sizeChangeMode = false; // Toggle for gradual size change
let toggleButton, clearButton, downloadButton, sizeChangeButton;

function setup() {
  createCanvas(800, 500);
  cols = floor(width / scl);
  rows = floor(height / scl);

  flowField = new Array(cols * rows);

  for (let i = 0; i < 500; i++) {
    particles.push(new Particle());
  }

  currentColor = color(200, 200, 200); // Start with a muted color

  // Container for buttons
  let buttonContainer = createDiv()
    .style('display', 'flex')
    .style('justify-content', 'space-evenly')
    .style('margin-bottom', '10px');

  // Download Button
  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#212121');
  downloadButton.style('color', '#bdbdbd');
  downloadButton.style('flex', '1').style('margin', '0 5px'); // Equal width
  downloadButton.mousePressed(() =>
    saveCanvas('flow-field-color-intervals', 'png')
  );
  buttonContainer.child(downloadButton);

  // Clear Button
  clearButton = createButton('Clear Canvas');
  clearButton.style('background-color', '#212121');
  clearButton.style('color', '#bdbdbd');
  clearButton.style('flex', '1').style('margin', '0 5px'); // Equal width
  clearButton.mousePressed(() => background(0));
  buttonContainer.child(clearButton);

  // Grayscale Toggle Button
  toggleButton = createButton('Grayscale: OFF');
  toggleButton.style('background-color', '#212121');
  toggleButton.style('color', '#bdbdbd');
  toggleButton.style('flex', '1').style('margin', '0 5px'); // Equal width
  toggleButton.mousePressed(toggleGrayscale);
  buttonContainer.child(toggleButton);

  // Particle Size Change Toggle Button
  sizeChangeButton = createButton('Size Change: OFF');
  sizeChangeButton.style('background-color', '#212121');
  sizeChangeButton.style('color', '#bdbdbd');
  sizeChangeButton.style('flex', '1').style('margin', '0 5px'); // Equal width
  sizeChangeButton.mousePressed(toggleSizeChange);
  buttonContainer.child(sizeChangeButton);

  // Container for sliders
  let sliderContainer = createDiv()
    .style('display', 'flex')
    .style('justify-content', 'space-between')
    .style('gap', '50px');

  // Interval Slider and Label
  let intervalLabel = createP('Color Change Interval:').style('color', '#fff');
  intervalLabel.style('margin-right', '10px').style('white-space', 'nowrap'); // Inline label
  let intervalGroup = createDiv()
    .style('display', 'flex')
    .style('align-items', 'center');
  intervalGroup.child(intervalLabel);
  intervalSlider = createSlider(3, 10, 5, 1);
  intervalSlider.style('flex', '1');
  intervalGroup.child(intervalSlider);
  sliderContainer.child(intervalGroup);

  // Particle Size Slider and Label
  let sizeLabel = createP('Particle Size:').style('color', '#fff');
  sizeLabel.style('margin-right', '10px').style('white-space', 'nowrap'); // Inline label
  let sizeGroup = createDiv()
    .style('display', 'flex')
    .style('align-items', 'center');
  sizeGroup.child(sizeLabel);
  sizeSlider = createSlider(3, 7, 3, 1);
  sizeSlider.style('flex', '1');
  sizeGroup.child(sizeSlider);
  sliderContainer.child(sizeGroup);
}

function draw() {
  background(0, 0); // Faint trail effect

  // Update interval from slider
  colorChangeInterval = intervalSlider.value();

  // Generate the flow field
  let xOffset = 0;
  for (let x = 0; x < cols; x++) {
    let yOffset = 0;
    for (let y = 0; y < rows; y++) {
      let angle = noise(xOffset, yOffset, zOffset) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowField[x + y * cols] = v;

      yOffset += 0.1; // Adjust for smoothness
    }
    xOffset += 0.1;
  }
  zOffset += 0.01; // Add depth to the noise

  // Change color at specified intervals
  if (frameCount >= nextColorChange) {
    currentColor = isGrayscale
      ? generateGrayscaleColor()
      : generateMutedColor();
    nextColorChange = frameCount + colorChangeInterval;
  }

  // Calculate particle size dynamically if sizeChangeMode is enabled
  let particleSize;
  if (sizeChangeMode) {
    particleSize = map(sin(frameCount * 0.025), -1, 1, 3, 7); // Oscillating size
    sizeSlider.value(particleSize); // Update slider to match size
  } else {
    particleSize = sizeSlider.value(); // Get size from slider
  }

  // Update and draw particles
  for (let particle of particles) {
    particle.follow(flowField);
    particle.show(currentColor, particleSize);
    particle.update();
    particle.edges();
  }
}

// Generate a muted color
function generateMutedColor() {
  let base = random(100, 220); // Keep colors light but not too bright
  let r = base + random(-50, 30); // Small variation around the base value
  let g = base + random(-50, 30);
  let b = base + random(-50, 30);
  return color(r, g, b);
}

// Generate a grayscale color
function generateGrayscaleColor() {
  let base = random(50, 220); // Black/White spectrum
  return color(base, base, base); // Grayscale color
}

// Toggle grayscale mode
function toggleGrayscale() {
  isGrayscale = !isGrayscale;
  toggleButton.html(isGrayscale ? 'Grayscale: ON' : 'Grayscale: OFF');
  toggleButton.style('color', isGrayscale ? '#2196f3' : '#bdbdbd'); // Blue for ON, gray for OFF
}

// Toggle gradual particle size change
function toggleSizeChange() {
  sizeChangeMode = !sizeChangeMode;
  sizeChangeButton.html(
    sizeChangeMode ? 'Size Change: ON' : 'Size Change: OFF'
  );
  sizeChangeButton.style('color', sizeChangeMode ? '#4caf50' : '#bdbdbd'); // Green for ON, gray for OFF
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
  }

  follow(vectors) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
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

  show(col, size) {
    stroke(col);
    strokeWeight(size); // Use particle size from slider
    point(this.pos.x, this.pos.y);
  }
}
