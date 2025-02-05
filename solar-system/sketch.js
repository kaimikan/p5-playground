let sun;
let planets = [];
let numPlanets = 8;
let scaleFactor = 3;
let planetData = [
  { distance: 60, size: 2, speed: 0.02, color: [169, 169, 169] }, // Mercury (Gray)
  { distance: 90, size: 4, speed: 0.015, color: [255, 204, 153] }, // Venus (Pale Orange)
  { distance: 120, size: 5, speed: 0.01, color: [0, 102, 204] }, // Earth (Blue)
  { distance: 150, size: 3, speed: 0.008, color: [255, 102, 102] }, // Mars (Red)
  { distance: 200, size: 20, speed: 0.005, color: [204, 153, 102] }, // Jupiter (Brown)
  { distance: 260, size: 18, speed: 0.003, color: [255, 204, 102] }, // Saturn (Yellow)
  { distance: 320, size: 8, speed: 0.002, color: [102, 204, 255] }, // Uranus (Light Blue)
  { distance: 370, size: 7, speed: 0.001, color: [0, 0, 204] }, // Neptune (Deep Blue)
];

function setup() {
  createCanvas(800, 750);
  sun = new Planet(width / 2, height / 2, 50, 0); // Sun size adjusted to fit canvas

  for (let i = 0; i < numPlanets; i++) {
    planets.push(
      new OrbitingPlanet(
        sun.x,
        sun.y,
        planetData[i].size,
        planetData[i].distance,
        planetData[i].speed,
        planetData[i].color
      )
    );
  }
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  fill(255, 204, 0);
  ellipse(0, 0, sun.size * 2); // Sun

  for (let planet of planets) {
    planet.update();
    planet.show();
  }
}

class Planet {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }
}

class OrbitingPlanet extends Planet {
  constructor(x, y, size, distance, speed, color) {
    super(x, y, size, speed);
    this.angle = random(TWO_PI);
    this.distance = distance;
    this.color = color;
  }

  update() {
    this.angle += this.speed;
  }

  show() {
    let px = cos(this.angle) * this.distance;
    let py = sin(this.angle) * this.distance;
    fill(this.color);
    ellipse(px, py, this.size * 2);
  }
}
