// Define variables for the Magic 8 Ball
let responses = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  'Don’t count on it',
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
];
let currentResponse = '';
let generating = false; // Flag to indicate response is being generated
let responseTimer = 0; // Timer for response animation
let textOpacity = 0; // Opacity of the text
let shakeAmount = 0; // Amount to shake the ball

function setup() {
  createCanvas(600, 600); // Increase canvas size
  textAlign(CENTER, CENTER);
  textSize(20);
}

function draw() {
  background(50);

  // Shake the ball if generating a response
  let xOffset = generating ? random(-shakeAmount, shakeAmount) : 0;
  let yOffset = generating ? random(-shakeAmount, shakeAmount) : 0;

  push(); // Save current drawing state
  translate(width / 2 + xOffset, height / 2 + yOffset); // Apply shaking effect
  drawBall();
  pop(); // Restore drawing state

  // Display instructions or the current response
  if (generating) {
    // Show loading dots while generating
    fill(255);
    textSize(16);
    let dots = '.'.repeat(frameCount % 4); // Loading dots animation
    text('...' + dots, width / 2, height / 2);
  } else if (currentResponse) {
    // Gradually increase the text opacity
    textOpacity = min(textOpacity + 5, 255);
    fill(255, 255, 255, textOpacity);
    textSize(16);
    strokeWeight(3);
    text(currentResponse, width / 2, height / 2);
  } else {
    // Default instructions
    fill(255);
    textSize(16);
    text(
      'CLICK or press SPACE to ask the Magic 8 Ball!',
      width / 2,
      height - 30
    );
  }

  // Update the timer for response generation
  if (generating && millis() > responseTimer) {
    currentResponse = random(responses); // Generate the response
    generating = false; // Stop the animation
    textOpacity = 0; // Reset opacity for fade-in effect
  }
}

function drawBall() {
  // Draw the main ball with a gradient
  noStroke();
  for (let r = 200; r > 0; r--) {
    // Increased radius from 150 to 200
    let gray = map(r, 200, 0, 0, 255);
    fill(gray);
    ellipse(0, 0, r * 2);
  }

  // Add a highlight
  fill(255, 255, 255, 150);
  ellipse(-60, -60, 80, 80); // Adjusted position and size of highlight

  // Draw the inner circle for the response area
  fill(0);
  ellipse(0, 0, 200); // Increased size of the inner circle
}

function mousePressed() {
  triggerResponse();
}

function keyPressed() {
  if (key === ' ' || key === 'Space') {
    triggerResponse();
  }
}

function triggerResponse() {
  if (!generating) {
    generating = true; // Start the animation
    currentResponse = ''; // Clear the response
    textOpacity = 0; // Reset the opacity for new response
    responseTimer = millis() + 2000; // Set a 2-second timer for the response
    shakeAmount = 1; // Set the shaking intensity
    setTimeout(() => (shakeAmount = 0), 2000); // Stop shaking after 2 seconds
  }
}
