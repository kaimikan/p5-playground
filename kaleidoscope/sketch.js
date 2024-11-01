let symmetricalSides = 5;
let sectionAngles = 360 / symmetricalSides;
let canvas;

function setup() {
  canvas = createCanvas(650, 550);
  angleMode(DEGREES);

  background(51);
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
        stroke(255);
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
