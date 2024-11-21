let t = 0,
  p = 0;
let x = [],
  y = [],
  z = [],
  xPrev = [],
  yPrev = [],
  zPrev = [];

function setup() {
  createCanvas(700, 700, WEBGL);
}

function draw() {
  background(150);
  orbitControl();
  // translate(400, 400);
  rotateX(radians(t));
  push();

  //rotate mobius strip
  t = t + 0.5;

  p++;

  //run through 360 degrees
  for (let u = 0; u < 361; u++) {
    //uu is a radian translation of degrees
    let uu = radians(u);
    // console.log(uu);

    //arrays to store 5 points per perpendicular line on a strip
    x = [];
    y = [];
    z = [];
    let index = 0;

    for (let v = -1; v <= 1; v += 0.5) {
      //calculate coordinates, following parametrization
      let xCoord = 200 * (1 + (v / 2) * cos(uu / 2)) * cos(uu);
      let yCoord = 200 * (1 + (v / 2) * cos(uu / 2)) * sin(uu);
      let zCoord = 200 * (v / 2) * sin(uu / 2);
      x[index] = xCoord;
      y[index] = yCoord;
      z[index] = zCoord;
      index++;
    }

    //if there is more than 1 point, start drawing
    if (u > 0) {
      for (let i = 0; i < 5; i++) {
        // console.log(x, y, z, xPrev, yPrev, zPrev);
        // console.log(x[i], y[i], z[i], xPrev[i], yPrev[i], zPrev[i]);
        push();
        stroke(50);
        line(x[i], y[i], z[i], xPrev[i], yPrev[i], zPrev[i]);
        pop();
        if (u % 10 == 0 && i > 0) {
          push();
          stroke(100);
          line(x[i - 1], y[i - 1], z[i - 1], x[i], y[i], z[i]);
          pop();
        }
        if (u == p && i == 2) {
          fill(100, 100, 100, 255);
          ellipse(x[i], y[i], 30, 30);
          if (p == 360) {
            p = 0;
          }
        }
      }
    }
    xPrev = x;
    yPrev = y;
    zPrev = z;
  }
  pop();
}
