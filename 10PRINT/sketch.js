let x = 0;
let y = 0;
let spacing = 25;

function setup() {
  createCanvas(700, 650);
  background(51);
}

function draw() {
  stroke(255);
  if (random(1) < 0.5) {
    line(x, y, x + spacing, y + spacing);
  } else {
    line(x, y + spacing, x + spacing, y);
  }
  x += spacing;
  if (x > width) {
    x = 0;
    y += spacing;
  }
}
