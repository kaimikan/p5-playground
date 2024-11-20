let r1 = 150;
let r2 = 50;
let angle = 180;

function setup() {
  createCanvas(500, 500, WEBGL);
  angleMode(DEGREES);
}

function draw() {
  background(51);
  orbitControl();

  // strokeWeight(2);
  // stroke(0);
  // noFill();
  // beginShape(POINTS);
  // for (let theta = 0; theta < 360; theta += 10) {
  //   for (let phi = 0; phi < 360; phi += 10) {
  //     let x = (r1 + r2 * cos(phi)) * cos(theta);
  //     let y = (r1 + r2 * cos(phi)) * sin(theta);
  //     let z = r2 * sin(phi);
  //     vertex(x, y, z);
  //   }
  // }
  // endShape();

  // strokeWeight(3);
  // stroke(255, 0, 0);
  // noFill();
  beginShape(QUAD_STRIP);
  let big = 1;
  let small = 0.5;
  let x, y, z;
  let startingAngle = 180;
  for (let theta = 0; theta <= 360; theta += 10) {
    fill(0, 255, 100);
    x = (r1 + r2 * cos(small * theta)) * cos(big * theta);
    y = (r1 + r2 * cos(small * theta)) * sin(big * theta);
    z = r2 * sin(small * theta);
    vertex(x, y, z);

    fill(0, 100, 255);
    x = (r1 + r2 * cos(startingAngle + small * theta)) * cos(big * theta);
    y = (r1 + r2 * cos(startingAngle + small * theta)) * sin(big * theta);
    z = r2 * sin(startingAngle + small * theta);
    vertex(x, y, z);
  }
  endShape();
  // stroke('blue');
  // ellipse(r1 + r2, 0, 5, 5);

  let x2, y2, z2;
  if (angle < 180) {
    x2 = (r1 + r2 * cos(small * angle)) * cos(big * angle);
    y2 = (r1 + r2 * cos(small * angle)) * sin(big * angle);
    z2 = r2 * sin(small * angle);
  } else {
    x2 = (r1 + r2 * cos(startingAngle + small * angle)) * cos(big * angle);
    y2 = (r1 + r2 * cos(startingAngle + small * angle)) * sin(big * angle);
    z2 = r2 * sin(startingAngle + small * angle);
  }
  push();
  translate(x2, y2, z2);
  stroke(255, 150, 0);
  sphere(10);
  pop();

  angle += 1;
}
