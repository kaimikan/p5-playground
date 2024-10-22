var slider;
var n1 = 1;
var n2 = 1;
var n3 = 1;
var m = 5;
var a = 1;
var b = 1;

function setup() {
  createCanvas(700, 650);
  slider = createSlider(0, 10, 5, 1);
}

function supershape(angle) {
  var equationPartOne = (1 / a) * cos((angle * m) / 4);
  equationPartOne = abs(equationPartOne);
  equationPartOne = pow(equationPartOne, n2);

  var equationPartTwo = (1 / b) * sin((angle * m) / 4);
  equationPartTwo = abs(equationPartTwo);
  equationPartTwo = pow(equationPartTwo, n3);

  var equationPartThree = pow(equationPartOne + equationPartTwo, 1 / n2);

  if (equationPartThree === 0) {
    return 0;
  }

  return 1 / equationPartThree;
}

function draw() {
  m = slider.value();
  background(0);
  translate(width / 2, height / 2);

  stroke(255);
  noFill();

  var scale = 100;
  var pointTotal = 200;
  var pointIncrement = TWO_PI / pointTotal;

  beginShape();

  for (var angle = 0; angle < TWO_PI; angle += pointIncrement) {
    var radius = supershape(angle);
    var x = scale * radius * cos(angle);
    var y = scale * radius * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
}
