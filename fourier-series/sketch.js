let time = 0; // Tracks the time for the wave
let wave = []; // Stores the points of the Fourier series
let waves = 1; // Number of harmonics
let wavesSlider; // Slider for adjusting harmonics
let wavesLabel; // Label for the slider

function setup() {
  createCanvas(800, 400);

  // Create slider for the number of waves
  wavesSlider = createSlider(1, 20, 1); // Range: 1 to 20, Default: 1

  // Create a label for the slider
  wavesLabel = createP('Number of Waves: 1'); // Initial text
  wavesLabel.style('color', 'white'); // Style the label for visibility
}

function draw() {
  background(0);
  translate(200, 200); // Shift the origin to make it easier to visualize

  // Get the current value from the slider
  waves = wavesSlider.value();

  // Update the label to display the current value
  wavesLabel.html(`Number of Waves: ${waves}`);

  let x = 0;
  let y = 0;

  // Draw the Fourier series (a sum of sine waves)
  for (let i = 0; i < waves; i++) {
    let harmonics = i * 2 + 1; // Harmonics: 1, 3, 5, 7, etc.
    let radius = 100 * (4 / (harmonics * PI)); // Coefficient for square wave Fourier series

    // Save the previous x, y
    let prevX = x;
    let prevY = y;

    // Calculate the current x, y using sine and cosine
    x += radius * cos(harmonics * time);
    y += radius * sin(harmonics * time);

    // Draw the circle representing the current harmonic
    stroke(255, 100);
    noFill();
    ellipse(prevX, prevY, radius * 2);

    // Draw the connecting line between circles
    stroke(255);
    line(prevX, prevY, x, y);
  }

  // Draw a horizontal line from the Fourier drawing point to the wave plot
  stroke(255, 0, 0); // Red color for horizontal line
  line(x, y, 200, y); // End the line at the current point in the wave

  // Store the wave
  wave.unshift(y);

  // Draw the wave
  translate(200, 0); // Move to the right to plot the wave
  beginShape();
  noFill();
  stroke(255);
  for (let i = 0; i < wave.length; i++) {
    vertex(i, wave[i]);
  }
  endShape();

  // Remove old points to keep the wave continuous
  if (wave.length > 600) {
    wave.pop();
  }

  // Increment time
  time += 0.05;
}
