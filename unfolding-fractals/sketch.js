let segments = [];
let endSegment;
let zoom = 1;
let targetZoom = 1;
let amount = 0;

function setup() {
  createCanvas(700, 700);

  let a = createVector(0, 0);
  let b = createVector(0, 200);
  // ^ due to the translate in draw
  endSegment = new Segment(a, b, b);
  endSegment.completed = true;
  segments.push(endSegment);
}

let firstTime = true;

function nextGeneration() {
  let newSegments = [];
  for (let i = 0; i < segments.length; i++) {
    let s = segments[i];

    let newS = s.duplicate(endSegment.a);
    if (firstTime) {
      newS.origin = endSegment.b.copy();
      firstTime = false;
    }
    newSegments.push(newS);
  }
  endSegment = newSegments[0];
  segments = segments.concat(newSegments);
  rotationSpeed *= 0.95;
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  // always move at the speed of the growing pattern
  let newZoom = lerp(zoom, targetZoom, amount);
  scale(newZoom);

  // let allCompleted = true;
  amount += 0.01;
  for (let s of segments) {
    if (!s.completed) {
      s.update();
      // allCompleted = false;
    }
    s.show();
  }

  // if (allCompleted) {
  if (amount >= 1) {
    for (let s of segments) {
      s.completed = true;
    }

    nextGeneration();
    amount = 0;
    zoom = newZoom;
    targetZoom = zoom / Math.sqrt(2);
  }

  // stroke(255, 0, 0);
  // strokeWeight(5);
  // point(endSegment.a.x, endSegment.a.y);
}
