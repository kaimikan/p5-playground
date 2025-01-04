let particles = [];
let flowfield;
let cols, rows;
let scl = 10;
let zoff = 0;
let inc = 0.1;

function setup() {
  createCanvas(700, 500);
  colorMode(HSB, 255);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);

  for (let i = 0; i < 1000; i++) {
    particles[i] = new Particle();
  }
  background(0);

  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#212121');
  downloadButton.style('color', '#bdbdbd');
  downloadButton.mousePressed(() => saveCanvas('flow-field-gradient', 'png'));
}

function draw() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(0.2);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0003;
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}
