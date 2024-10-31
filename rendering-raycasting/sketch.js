let walls = [];
let ray;
let particle;
let xOffset = 0;
let yOffset = 10000;

const sceneW = 400;
const sceneH = 400;
let fovSlider;

function setup() {
  createCanvas(sceneW * 2, sceneH);
  for (let i = 0; i < 5; i++) {
    let x1 = random(sceneW);
    let x2 = random(sceneW);
    let y1 = random(sceneH);
    let y2 = random(sceneH);
    walls[i] = new Boundary(x1, y1, x2, y2);
  }
  // window edge walls
  walls.push(new Boundary(0, 0, sceneW, 0));
  walls.push(new Boundary(sceneW, 0, sceneW, sceneH));
  walls.push(new Boundary(sceneW, sceneH, 0, sceneH));
  walls.push(new Boundary(0, sceneH, 0, 0));
  particle = new Particle();
  fovSlider = createSlider(0, 360, 45);
  fovSlider.input(changeFOV);
}

function changeFOV() {
  const fov = fovSlider.value();
  particle.updateFOV(fov);
}

function draw() {
  background(0);
  for (let wall of walls) {
    wall.show();
  }

  if (keyIsDown(LEFT_ARROW)) {
    particle.rotate(-0.1);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    particle.rotate(0.1);
  }

  let scene;
  if (0 < mouseX && mouseX < sceneW && 0 < mouseY && mouseY < sceneH) {
    // move with mouse
    particle.update(mouseX, mouseY);
  } else if (
    keyIsDown(UP_ARROW) ||
    keyIsDown(DOWN_ARROW) ||
    keyIsDown(LEFT_ARROW) ||
    keyIsDown(RIGHT_ARROW)
  ) {
    if (keyIsDown(DOWN_ARROW)) {
      particle.move(-1);
    }
    if (keyIsDown(UP_ARROW)) {
      particle.move(1);
    }
  } //else {
  //   // move with perlin noise
  //   particle.update(noise(xOffset) * sceneW, noise(yOffset) * sceneH);
  //   xOffset += 0.01;
  //   yOffset += 0.01;
  // }
  scene = particle.look(walls);

  const w = sceneW / scene.length;
  push();
  translate(sceneW, 0);
  for (let i = 0; i < scene.length; i++) {
    noStroke();
    const sq = scene[i] * scene[i];
    const widthSquare = sceneW * sceneW;
    const barColor = map(sq, 0, widthSquare, 255, 0);
    let barHeight = map(scene[i], 0, sceneW, sceneH, 0);
    fill(barColor);
    rectMode(CENTER);
    rect(i * w + w / 2, sceneH / 2, w + 1, (50 * barHeight) / scene[i]);
  }
  pop();

  particle.show();
  particle.look(walls);
}
