let easycam;
let sun;
let planets = [];
let stars = []; // Array for background stars
let numPlanets = 8;

// Planet class
class Planet {
  constructor(distance, radius, speed, color) {
    this.distance = distance;
    this.radius = radius;
    this.angle = random(TWO_PI);
    this.speed = speed;
    this.color = color;
  }

  update() {
    this.angle += this.speed;
  }

  display() {
    push();
    rotateY(this.angle);
    translate(this.distance, 0, 0);
    fill(this.color);
    sphere(this.radius);
    pop();
  }
}

function setup() {
  createCanvas(800, 500, WEBGL);

  // Enable 3D camera controls
  easycam = new Dw.EasyCam(this._renderer, { rotation: [1, -0.3, 0, 0] });

  // Sun setup
  sun = { radius: 50, color: color(255, 204, 0) };

  // Planet setup (distance, radius, speed, color)
  let planetData = [
    { d: 100, r: 10, s: 0.03, c: 'gray' }, // Mercury
    { d: 150, r: 14, s: 0.02, c: 'orange' }, // Venus
    { d: 200, r: 16, s: 0.015, c: 'blue' }, // Earth
    { d: 250, r: 12, s: 0.012, c: 'red' }, // Mars
    { d: 350, r: 30, s: 0.008, c: 'brown' }, // Jupiter
    { d: 450, r: 25, s: 0.006, c: 'yellow' }, // Saturn
    { d: 550, r: 20, s: 0.004, c: 'lightblue' }, // Uranus
    { d: 650, r: 18, s: 0.002, c: 'darkblue' }, // Neptune
  ];

  for (let p of planetData) {
    planets.push(new Planet(p.d, p.r, p.s, p.c));
  }

  // Generate random distant stars
  for (let i = 0; i < 300; i++) {
    let x = random(-2000, 2000);
    let y = random(-2000, 2000);
    let z = random(-2000, 2000);
    stars.push(createVector(x, y, z));
  }

  createP('Drag mouse to rotate, scroll to zoom in/out.').style(
    'color',
    '#fff'
  );
}

function draw() {
  background(0);
  lights();

  // Draw distant stars
  push();
  stroke(255, 255, 255, 100);
  for (let star of stars) {
    point(star.x, star.y, star.z);
  }
  pop();

  // Draw the Sun
  push();
  fill(sun.color);
  sphere(sun.radius);
  pop();

  // Draw planet orbits (now horizontal in XZ plane)
  stroke(120);
  noFill();
  for (let planet of planets) {
    push();
    rotateX(HALF_PI); // Rotate to make the orbit horizontal
    ellipse(0, 0, planet.distance * 2, planet.distance * 2);
    pop();
  }

  // Draw planets
  noStroke();
  for (let planet of planets) {
    planet.update();
    planet.display();
  }
}
