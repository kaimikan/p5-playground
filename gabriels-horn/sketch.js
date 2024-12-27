let angleX = 0;
let angleY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;
let maxX = 10; // Maximum x-value for the horn
let currentX = 1; // Current x-value for the animation

// Define two colors for the gradient (start and end colors)
let startColor;
let endColor;

function setup() {
  createCanvas(500, 500, WEBGL);
  startColor = color(255, 255, 125); // Yellow for the start color
  endColor = color(255, 0, 0); // Red for the end color

  // Create the tooltip with createP()
  createTooltip();
}

function draw() {
  background(30);

  // Apply rotation based on mouse drag
  if (isDragging) {
    let dx = (mouseX - lastMouseX) * 0.01;
    let dy = (mouseY - lastMouseY) * 0.01;
    angleY += dx;
    angleX += dy;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }

  rotateX(angleX);
  rotateY(angleY);

  scale(50); // Zoom in
  strokeWeight(2);
  noFill();

  // Draw and rotate the initial curve with gradient color
  for (let theta = 0; theta < TWO_PI; theta += radians(5)) {
    beginShape();
    for (let x = 1; x < currentX; x += 0.1) {
      let y = 1 / x;

      // Interpolate the color based on x
      let lerpedColor = lerpColor(startColor, endColor, map(x, 1, maxX, 0, 1));
      stroke(lerpedColor);

      let z = y * sin(theta);
      let py = y * cos(theta);
      vertex(x, py, z);
    }
    endShape();
  }

  // Increment currentX to animate the drawing
  if (currentX < maxX) {
    currentX += 0.05; // Adjust speed of animation here
  }
}

// Function to create the tooltip using createP()
function createTooltip() {
  let tooltip = createDiv(); // Create a div container for the tooltip
  tooltip.size(width - 20, 50); // Set the size of the tooltip box

  let title = createP('Rotate with the mouse');
  title.parent(tooltip); // Attach to the div
  title.style('color', 'white');
  title.style('font-size', '16px');
  title.style('text-align', 'center');

  let description = createP(
    "This is an approximation of Gabriel's Horn. It is a mathematical shape that has infinite surface area but finite volume."
  );
  description.parent(tooltip); // Attach to the div
  description.style('color', 'white');
  description.style('font-size', '12px');
  description.style('text-align', 'center');
}

function mousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  isDragging = false;
}
