var x;
var y;
var lastDirection = -1;

function setup() {
  createCanvas(700, 650);
  x = 350;
  y = 325;
  // draw bg just once so we can see dot moves
  background(0);
}

function draw() {
  stroke(255);
  strokeWeight(2);
  point(x, y);

  var direction;
  // do {
  // var r = random(0, 4) // by definition works without the first one if it is 0
  // highest value this can give is 3.99999...
  direction = floor(random(4));
  // } while (direction == lastDirection);

  // 0, 1, 2, 3 == left, right, up, down
  switch (direction) {
    case 0:
      x = x - 1;
      break;
    case 1:
      x = x + 1;
      break;
    case 2:
      y = y + 1;
      break;
    case 3:
      y = y - 1;
      break;
  }
  // lastDirection = direction;
}
