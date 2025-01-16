let sliderA, sliderB, inputEquation, drawButton;
let equation = 'sin(k * theta)';

function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  background(255);

  // UI Elements
  createP('Flower Math Equation').style('margin', '0').style('color', 'white');

  createP(
    "Equation (use 'theta' as the angle variable, base is sin(k * theta)):"
  )
    .style('margin', '0')
    .style('color', 'white');
  inputEquation = createInput(equation);
  inputEquation.input(drawFlower);

  createP('Parameter A (k in the equation):')
    .style('margin', '0')
    .style('color', 'white');
  sliderA = createSlider(1, 20, 7, 0.1);
  sliderA.input(drawFlower);

  createP('Parameter B (Scale):').style('margin', '0').style('color', 'white');
  sliderB = createSlider(50, 250, 150, 1);
  sliderB.input(drawFlower);

  noLoop(); // Only redraw on interaction
}

function drawFlower() {
  background(255);

  let k = sliderA.value();
  let scale = sliderB.value();
  equation = inputEquation.value();

  beginShape();
  for (let theta = 0; theta <= 360; theta++) {
    // Parse and evaluate the user-defined equation
    let r;
    try {
      r = eval(equation.replace(/theta/g, theta).replace(/k/g, k));
    } catch (e) {
      r = 0; // Default to 0 in case of errors
    }
    let x = scale * r * cos(theta);
    let y = scale * r * sin(theta);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function draw() {
  translate(width / 2, height / 2);
  // Initial draw with default values
  drawFlower();
}
