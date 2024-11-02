let segments = [];
let endPoint;

function setup() {
  createCanvas(500, 500);

  let a = createVector(100, 50);
  let b = createVector(100, 60);
  endPoint = b;
  segments.push(new Segment(a, b));
}

function mousePressed() {
  let newSegments = [];
  for (let i = 0; i < segments.length; i++) {
    let s = segments[i];

    let newS = s.rotate(endPoint);
    newSegments.push(newS);
  }
  endPoint = newSegments[0].a;
  segments = segments.concat(newSegments);
}

function draw() {
  background(0);
  for (let s of segments) {
    s.show();
  }

  stroke(255, 0, 0);
  strokeWeight(11);
  point(endPoint.x, endPoint.y);
}
