var rotationAngle = 0;
var slider;

function setup() {
  createCanvas(700, 650);
  slider = createSlider(0, TWO_PI, PI / 4, 0.01);
}

function draw() {
  background(51);
  rotationAngle = slider.value();
  stroke(255);
  translate(350, height);
  branch(100);
}

function branch(len) {
  line(0, 0, 0, 0 - len);

  translate(0, -len);

  if (len > 4) {
    push();
    rotate(rotationAngle);
    branch(len * 0.75);
    pop();
    push();
    rotate(-rotationAngle);
    branch(len * 0.75);
    pop();
  }

  // line(0, 0, 0, 0 - len * 0.75);
}
