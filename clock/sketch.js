function setup() {
  createCanvas(400, 460);
  angleMode(DEGREES);
}

function draw() {
  background(0);
  translate(200, 200);
  rotate(-90);

  let hr = hour();
  let min = minute();
  let sec = second();

  fill(25);
  stroke(225);
  ellipse(0, 0, 325, 325);

  strokeWeight(8);
  noFill();
  stroke(255, 100, 150);
  let endSecs = map(sec, 0, 60, 0, 360);
  arc(0, 0, 300, 300, 0, endSecs);
  push();
  rotate(endSecs);
  stroke(255, 100, 150);
  line(0, 0, 100, 0);
  pop();

  stroke(150, 100, 255);
  let endMins = map(min, 0, 60, 0, 360);
  arc(0, 0, 280, 280, 0, endMins);
  push();
  rotate(endMins);
  stroke(150, 100, 255);
  line(0, 0, 75, 0);
  pop();

  stroke(150, 255, 100);
  let endHrs = map(hr % 12, 0, 12, 0, 360);
  arc(0, 0, 260, 260, 0, endHrs);
  push();
  rotate(endHrs);
  stroke(150, 255, 100);
  line(0, 0, 50, 0);
  pop();

  stroke(225);
  point(0, 0);

  let timeString = nf(hr, 2) + ':' + nf(min, 2) + ':' + nf(sec, 2);

  rotate(90);
  fill(255);
  noStroke();
  textSize(75);
  textStyle(BOLD);
  textAlign(CENTER);
  textFont('Courier New');
  text(timeString, 0, 235);
}
