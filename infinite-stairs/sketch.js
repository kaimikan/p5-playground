let stepWidth = 50; // Width of each step
let stepHeight = 30; // Height difference between steps
let numSteps = 50; // Total visible steps
let transitionSpeed = 100; // Speed of the motion
let steps = [];

function setup() {
  createCanvas(400, 400);

  // Initialize step positions, each higher than the last
  for (let i = 0; i < numSteps; i++) {
    steps.push({
      x: i * stepWidth,
      y: height - (i + 1) * stepHeight,
      color: i < numSteps / 2 ? i * 10 : (numSteps - i) * 10,
    });
  }
}

function draw() {
  background(155);
  // Draw and update each step
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    fill(step.color);
    noStroke();
    // stepWidth + 3.5 to fill gap while moving and the gap on the last step from the array combining with the first
    rect(step.x, step.y, stepWidth + 3.5, height - step.y);

    // Move steps to simulate horizontal motion
    step.x -= transitionSpeed / stepHeight;
    step.y += transitionSpeed / stepWidth;

    // Recycle step when it moves off the left edge
    if (step.x + stepWidth < 0) {
      // Position the step at the far right and adjust height to loop seamlessly
      let previousStep = steps[(i - 1 + steps.length) % steps.length];
      step.x = previousStep.x + stepWidth;
      step.y = previousStep.y - stepHeight;
    }
  }
}
