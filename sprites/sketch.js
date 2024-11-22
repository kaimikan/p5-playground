function preload() {
  walk = loadImage('amongus.png');
}

function setup() {
  createCanvas(500, 500);
  createP('Amongus ^').style('color', 'red');
}

let frameCounter = 0;

function draw() {
  background(93, 108, 98);
  image(
    walk,
    75,
    100,
    walk.height,
    walk.height,
    walk.height * floor(frameCounter),
    0,
    walk.height,
    walk.height
  );
  frameCounter += 0.1;

  console.log(walk.width / walk.height);
  if (frameCounter > walk.width / walk.height) {
    frameCounter = 0;
  }
}
