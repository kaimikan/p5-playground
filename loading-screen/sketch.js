let loading = true; // Tracks if the app is still "loading"
let loadingTime = 4000; // Simulated loading time in milliseconds
let startTime;

function setup() {
  createCanvas(400, 400);
  startTime = millis(); // Record the start time
}

function draw() {
  background(30);

  if (loading) {
    // Calculate elapsed time and progress
    let elapsedTime = millis() - startTime;
    let progress = constrain(elapsedTime / loadingTime, 0, 1);

    // Minimal Title
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(200);
    noStroke();
    text('Loading...', width / 2, height / 2 - 40);

    // Progress Bar
    let barWidth = 300;
    let barHeight = 8;
    let barX = width / 2 - barWidth / 2;
    let barY = height / 2;
    fill(50);
    rect(barX, barY, barWidth, barHeight, 4); // Background bar
    fill(100, 200, 100);
    rect(barX, barY, barWidth * progress, barHeight, 4); // Progress

    // Subtle Pulsing Circle
    noFill();
    stroke(100 + 100 * sin(millis() / 500), 200, 200);
    strokeWeight(2);
    ellipse(width / 2, height / 2 + 60, 20 + 10 * sin(millis() / 300));

    // Check if "loading" is complete
    if (elapsedTime > loadingTime) {
      loading = false; // Exit loading state
    }
  } else {
    // Main content after loading
    background(20);
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Let's go!", width / 2, height / 2);

    // Subtle fade-in effect for elegance
    noStroke();
    for (let i = 0; i < 100; i++) {
      fill(255, 255, 255, 5 - i / 20);
      ellipse(random(width), random(height), 1, 1);
    }
  }
}
