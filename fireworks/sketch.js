let fireworks = [];
let gravity;

function setup() {
  createCanvas(600, 400);
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  stroke(255);
  strokeWeight(4);
}

function draw() {
  background(0, 0, 0, 25);

  // Launch fireworks at a controlled rate and within safe horizontal margins
  if (random(1) < 0.05) {
    let margin = 50;
    let x = random(margin, width - margin);
    fireworks.push(new Firework(x, height));
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}
