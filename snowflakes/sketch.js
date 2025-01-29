let snowflakes = []; // array to hold snowflake objects

function setup() {
  createCanvas(800, 500);
  fill(240);
  noStroke();
}

function draw() {
  setGradient(0, 0, width, height, color('#132d47'), color('#2e5e8f'));
  let t = frameCount / 60; // update time

  // create a random number of snowflakes each frame
  for (var i = 0; i < random(5); i++) {
    snowflakes.push(new Snowflake()); // append snowflake object
  }

  // loop through snowflakes with a for..of loop
  for (let flake of snowflakes) {
    flake.update(t); // update snowflake position
    flake.display(); // draw snowflake
  }

  // Remove snowflakes that are off screen
  snowflakes = snowflakes.filter((flake) => flake.posY <= height);
}

function setGradient(x, y, w, h, c1, c2) {
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

// Snowflake class
class Snowflake {
  constructor() {
    this.posX = random(width);
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(3, 8);
    this.radius = sqrt(random(pow(width / 2, 2)));
    this.opacity = random(150, 255);
    this.windOffset = random(-0.5, 0.5);
  }

  update(time) {
    let w = 0.6; // angular speed
    let angle = w * time + this.initialangle;
    this.posX += this.windOffset; // Wind effect
    this.posX = width / 2 + this.radius * sin(angle);
    this.posY += pow(this.size, 0.5);
  }

  display() {
    push();
    fill(255, this.opacity);
    stroke(255);
    strokeWeight(1);
    translate(this.posX, this.posY);
    rotate(frameCount / 100.0);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i;
      let x = (cos(angle) * this.size) / 2;
      let y = (sin(angle) * this.size) / 2;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}
