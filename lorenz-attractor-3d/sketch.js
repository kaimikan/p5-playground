let x = 0.01;
let y = 0;
let z = 0;
let a = 10;
let b = 28;
let c = 8 / 3;
let points = [];
let cam;
let hueValue = 0;

function setup() {
  createCanvas(800, 500, WEBGL);
  cam = createEasyCam(); // Add an easy camera for mouse controls
  document.oncontextmenu = () => false; // Disable right-click menu for easy cam

  colorMode(HSB); // Use HSB for smooth color transitions
  background(0);

  // Add paragraph with instructions
  createP(
    '<strong>Controls:</strong> ' +
      '<ul>' +
      '<li>Left-click and drag: Rotate the view</li>' +
      '<li>Right-click and drag / Mouse wheel: Pan the view</li>' +
      '</ul>'
  ).style('color', 'white'); // Set text color to white for better visibility
}

function draw() {
  background(0);

  strokeWeight(1.5);
  noFill();

  // Draw the Lorenz attractor
  scale(10); // Scale the points to fit in the canvas
  beginShape();
  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
    stroke(p1.color); // Use the color stored in the point
    line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  }
  endShape();

  // Update the Lorenz attractor
  for (let i = 0; i < 5; i++) {
    // Fast rendering with multiple steps per frame
    let dt = 0.01;
    let dx = a * (y - x) * dt;
    let dy = (x * (b - z) - y) * dt;
    let dz = (x * y - c * z) * dt;
    x += dx;
    y += dy;
    z += dz;

    // Create a new point with a color based on the current hueValue
    let newPoint = createVector(x, y, z);
    newPoint.color = color(hueValue % 360, 255, 255);
    points.push(newPoint);

    // Limit the number of points to improve performance
    if (points.length > 2500) {
      points.shift();
    }
  }

  // Update hue for color transitions
  hueValue = (hueValue + 1) % 360;
}
