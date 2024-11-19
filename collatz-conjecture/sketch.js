let n;
let steps = 0;
let totalSequences = 500;
let len = Math.PI;
let rotationAngle1 = Math.PI / 15;
let rotationAngle2 = Math.PI / 22.5;
let sequenceSlider;

function setup() {
  createCanvas(800, 500);
  background(0);

  // Create the slider
  sequenceSlider = createSlider(50, 1000, totalSequences, 50);
  sequenceSlider.style('width', '200px');
  sequenceSlider.input(onSliderChange); // Call onSliderChange when slider value changes

  translate((width * 1) / 3, (height * 7) / 8);
  drawSequence();
}

function drawSequence() {
  background(0); // Clear canvas on each redraw

  let sequence = [];
  for (let i = 1; i < totalSequences; i++) {
    sequence = [];
    n = i;

    do {
      sequence.push(n);
      n = collatz(n);
      steps++;
    } while (n != 1);
    sequence.push(n);
    sequence.reverse();

    resetMatrix();
    translate((width * 1) / 3, (height * 7) / 8);

    rotate(-PI / 2.5);
    for (let j = 1; j < sequence.length; j++) {
      let value = sequence[j];
      if (value % 2 == 0) {
        rotate(rotationAngle1);
      } else {
        rotate(-rotationAngle2);
      }
      strokeWeight(random(3, 5));
      stroke(125, random(150, 255), 75, random(30, 90));
      line(0, 0, 0, -len);
      translate(0, -len);
    }
  }
}

function collatz(n) {
  if (n % 2 == 0) {
    return n / 2;
  } else {
    return (n * 3 + 1) / 2;
  }
}

function onSliderChange() {
  totalSequences = sequenceSlider.value(); // Update totalSequences based on slider value
  drawSequence(); // Redraw with the updated totalSequences
}

function draw() {}
