let nSlider, dSlider;
let nValue, dValue;
let nAndDPara; // Paragraphs to display slider values
let radius = 200; // Radius of the rose

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  noFill();
  strokeWeight(1.5);

  // Create sliders
  nSlider = createSlider(1, 10, 6, 1); // n: petals (1 to 10)

  dSlider = createSlider(1, 360, 71, 1); // d: step size (1 to 360)

  // Create paragraphs to show values
  nAndDPara = createP(`n: ${nSlider.value()} d: ${dSlider.value()}`).style(
    'color',
    'grey'
  );
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  // Get slider values
  nValue = nSlider.value();
  dValue = dSlider.value();

  // Update paragraphs with slider values
  nAndDPara.html(`n: ${nValue} d: ${dValue}`);

  // Draw the Maurer Rose
  stroke(200);
  beginShape();
  for (let i = 0; i <= 360; i += 1) {
    let k = i * dValue;
    let r = radius * sin(nValue * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape(CLOSE);
}
