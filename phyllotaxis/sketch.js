var n = 0;
var scalingFactor = 4;
var ellipseWidth = 4;
var ellipseHeight = 4;
// good degrees: 137.3, 137.5, 137.6
var magicDegrees = 137.3;

function setup() {
  createCanvas(700, 650);
  // not default angleMode
  angleMode(DEGREES);
  // HSB = Hue Saturation Brightness
  colorMode(HSB);
  background(0);
}

function draw() {
  // we want to draw the background only at the start
  // background(0);

  var angle = n * magicDegrees;
  var radius = scalingFactor * sqrt(n);

  var x = radius * cos(angle) + width / 2;
  var y = radius * sin(angle) + height / 2;

  // fill(255);
  // fill(n % 256, 255, 255);
  fill((angle - radius) % 256, 255, 255);
  noStroke();
  ellipse(x, y, ellipseWidth, ellipseHeight);

  // experimenting with increasing the initial degree value
  // magicDegrees += 0.0001;
  n++;
}
