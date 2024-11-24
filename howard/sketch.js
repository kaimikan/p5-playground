// Loads and plays back a video
let vid;
let sound;
let startedSound = false;

function preload() {
  // Load the sound
  sound = loadSound('tune.mp3');
  sound.setVolume(0.05);
  // Create the video element and pass the name of the function to call when
  // it is finished loading.
  vid = createVideo('my-boy-howard.mp4', vidLoad);
  // vid.attribute("muted");
  // vid.attribute("controls");
}

function setup() {
  // Create a canvas the same size as the video file
  let canvs = createCanvas(640, 360);
  pixelDensity(1);
  canvs.mousePressed(playSound);
  createP('Click on the canvas for bangarang.mp3').style('color', 'grey');
  colorMode(HSB);
  noStroke();
}

function draw() {
  drawBackground();

  loadPixels();

  // Loop over the image and create a pixellated version
  // Use the 'loadPixels' and 'updatePixels' functions to speed up
  // processing
  vid.loadPixels();

  // console.log(pixels.length);

  // Because we use 'loadPixels()' the cell size can be smaller.
  let cellSize = 1;
  let cols = round(width / cellSize);
  let rows = round(height / cellSize);

  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      // Figure out the x, y position, remember that we will sample from
      // the center point of the cell. Also, make it a whole number.
      let x = round(i * cellSize + cellSize / 2);
      let y = round(j * cellSize + cellSize / 2);

      // Figure out the index of the pixel we want.
      let idx = 4 * (x + y * width);

      // Get colour for each point
      let r = vid.pixels[idx + 0];
      let g = vid.pixels[idx + 1];
      let b = vid.pixels[idx + 2];

      // Remove all alpha if it is a green pixel.
      if (g > 200 && r + b < 50) {
        // Do nothing
      } else {
        pixels[idx] = vid.pixels[idx];
        pixels[idx + 1] = vid.pixels[idx + 1];
        pixels[idx + 2] = vid.pixels[idx + 2];
      }
    }
  }
  updatePixels();
}

// When this function is called, we will mute the video and set it looping.
function vidLoad() {
  vid.volume(0);
  vid.loop();
  vid.hide();
}

function playSound() {
  if (!startedSound) {
    sound.loop();
    startedSound = true;
  }
}

// This function draws the background rainbow. Change this to anything
// would like to see behind the video.
function drawBackground() {
  for (let i = 0; i < 36; i += 1) {
    let h = (frameCount + i * 10) % 360;
    fill(h, 50, 100);
    rect(0, i * 10, width, 10);
  }
}
