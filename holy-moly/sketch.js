let button;
let sound;
let isPlaying = false; // Track if the sound is playing
let width = 700,
  height = 500;
let buttonSize = 100;
let quirks = []; // Store random visuals

function preload() {
  sound = loadSound('sound.mp3');
  sound.setVolume(0.1);
}

function setup() {
  createCanvas(width, height);

  // Create a button in the center of the canvas
  button = createButton('');
  button.size(buttonSize, buttonSize);
  button.center();
  styleButton('darkred', true); // Apply initial 3D style

  // Attach the play function to the button
  button.mousePressed(playSound);

  // Monitor when the song finishes
  sound.onended(resetButton);
}

function draw() {
  background(220);

  // Display instructions
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text('Press the button', width / 2, height / 4);

  // Draw quirky visuals if the sound is playing
  if (isPlaying) {
    for (let quirk of quirks) {
      quirk.show();
    }
  }
}

function playSound() {
  if (!isPlaying) {
    sound.play(); // Play the sound
    isPlaying = true;
    styleButton('red', false); // Change to "pressed" style
    generateQuirks(); // Generate quirky visuals
  }
}

function resetButton() {
  isPlaying = false; // Reset the playing state
  styleButton('darkred', true); // Reset to original style
  quirks = []; // Clear the visuals
}

function styleButton(color, raised) {
  button.style('background-color', color);
  button.style(
    'box-shadow',
    raised
      ? '0px 10px 20px rgba(0, 0, 0, 0.3)' // Raised shadow
      : '0px 2px 5px rgba(0, 0, 0, 0.5)' // Pressed shadow
  );
  button.style('transform', raised ? 'translateY(0px)' : 'translateY(5px)');
  button.style('border', 'none');
  button.style('border-radius', '50%');
  button.style('cursor', 'pointer');
}

// Generate random quirky visuals
function generateQuirks() {
  quirks = []; // Clear previous quirks
  let count = random(5, 15); // Random number of visuals

  for (let i = 0; i < count; i++) {
    quirks.push(new Quirk(random(width), random(height)));
  }
}

// Quirky visual class
class Quirk {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 50);
    this.color = color(random(255), random(255), random(255));
    this.shapeType = int(random(3)); // 0: ellipse, 1: rect, 2: triangle
  }

  show() {
    fill(this.color);
    noStroke();

    if (this.shapeType === 0) {
      ellipse(this.x, this.y, this.size);
    } else if (this.shapeType === 1) {
      rect(this.x, this.y, this.size, this.size);
    } else if (this.shapeType === 2) {
      triangle(
        this.x,
        this.y - this.size / 2,
        this.x - this.size / 2,
        this.y + this.size / 2,
        this.x + this.size / 2,
        this.y + this.size / 2
      );
    }
  }
}
