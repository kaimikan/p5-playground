let symmetricalSides = 2;
let symmetrySlider;
let symmetryText;
let sectionAngles = 360 / symmetricalSides;
let canvas;
let resetBtn;
let saveBtn;
let colorPicker;
let lineColor = 'white';

function setup() {
  canvas = createCanvas(650, 550);
  angleMode(DEGREES);

  symmetryText = createP(`Sides: ${symmetricalSides}`);
  symmetryText.style('color', 'grey');
  symmetryText.style('margin', '0');

  symmetrySlider = createSlider(1, 12, 2, 1);
  symmetrySlider.size(80);
  symmetrySlider.input(changeSymmetrySides);

  colorPicker = createColorPicker(lineColor);
  colorPicker.input(changeLineColor);

  resetBtn = createButton('Reset');
  resetBtn.mouseClicked(resetSketch);
  resetBtn.size(100, 50);
  resetBtn.style('font-family', 'Helvetica');
  resetBtn.style('font-size', '25px');

  saveBtn = createButton('Save');
  saveBtn.mouseClicked(saveSketch);
  saveBtn.size(100, 50);
  saveBtn.style('font-family', 'Helvetica');
  saveBtn.style('font-size', '25px');

  background(51);
}

function changeLineColor() {
  lineColor = colorPicker.value();
}

function changeSymmetrySides() {
  symmetricalSides = symmetrySlider.value();
  sectionAngles = 360 / symmetricalSides;
  symmetryText.html(`Sides: ${symmetricalSides}`);
}

function resetSketch() {
  background(51);
}

function saveSketch() {
  saveCanvas(canvas);
}

function draw() {
  translate(width / 2, height / 2);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // update based on the translate above
    let lineStartX = mouseX - width / 2;
    let lineStartY = mouseY - height / 2;
    // pmouseX keeps track of the mouse's position relative to the top-left corner of the canvas (in 2d)
    let lineEndX = pmouseX - width / 2;
    let lineEndY = pmouseY - height / 2;

    if (mouseIsPressed === true) {
      for (let i = 0; i < symmetricalSides; i++) {
        rotate(sectionAngles);
        stroke(lineColor);
        strokeWeight(3);
        line(lineStartX, lineStartY, lineEndX, lineEndY);
        push();
        scale(1, -1);
        line(lineStartX, lineStartY, lineEndX, lineEndY);
        pop();
      }
    }
  }
}
