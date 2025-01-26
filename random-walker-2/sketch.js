let walkers = [];
let gridSize = 10;
let cols, rows;

function setup() {
  createCanvas(800, 500);
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);

  for (let i = 0; i < 50; i++) {
    walkers.push(new Walker(random(cols) * gridSize, random(rows) * gridSize));
  }

  background(0);
}

function draw() {
  background(0, 5);

  for (let walker of walkers) {
    walker.update();
    walker.display();
  }
}

class Walker {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.hue = random(360);
    this.history = [];
  }

  update() {
    let directions = [
      createVector(gridSize, 0),
      createVector(-gridSize, 0),
      createVector(0, gridSize),
      createVector(0, -gridSize),
    ];

    let step = random(directions);
    this.vel = step;
    this.pos.add(this.vel);

    // Keep position within the canvas boundaries
    this.pos.x = constrain(this.pos.x, 0, width - gridSize);
    this.pos.y = constrain(this.pos.y, 0, height - gridSize);

    this.history.push(this.pos.copy());
    if (this.history.length > 20) {
      this.history.shift();
    }
  }

  display() {
    noFill();
    strokeWeight(3);
    stroke(this.hue, 125, 255, 255);

    beginShape();
    for (let v of this.history) {
      vertex(v.x + gridSize / 2, v.y + gridSize / 2);
    }
    endShape();

    fill(this.hue, 255, 255);
    noStroke();
    ellipse(
      this.pos.x + gridSize / 2,
      this.pos.y + gridSize / 2,
      gridSize * 0.7
    );
    this.hue = (this.hue + 1) % 360;
  }
}
