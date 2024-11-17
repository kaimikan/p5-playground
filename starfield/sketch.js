let stars = [];
let speed = 10;
let totalStars = 500;

function setup() {
  createCanvas(800, 600);
  for (let i = 0; i < totalStars; i++) {
    stars.push(new Star());
  }
}

function draw() {
  // Draw a semi-transparent rectangle only in the starfield area
  noStroke();
  fill(0, 129); // Adjust alpha for trail fade
  rect(0, 0, width, height); // Inner rectangle, leaving a border

  translate(width / 2, height / 2);
  for (let star of stars) {
    star.update();
    star.show();
  }
}
