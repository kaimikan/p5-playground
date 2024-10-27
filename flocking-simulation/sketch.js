const flock = [];

let alignmentSlider, cohesionSlider, separationSlider;

function setup() {
  createCanvas(800, 300);
  alignmentSlider = createSlider(0, 5, 1, 0.01);
  cohesionSlider = createSlider(0, 5, 1, 0.01);
  separationSlider = createSlider(0, 5, 1, 0.01);
  for (let i = 0; i < 100; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  background(51);

  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.align(flock);

    boid.update();
    boid.show();
  }
}
