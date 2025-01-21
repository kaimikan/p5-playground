let words = []; // Store word objects
let curseWords = ['damn', 'hell', 'crap', 'shit', 'fuck']; // Add your curse words here

function setup() {
  createCanvas(800, 500);
  textAlign(CENTER, CENTER);
  textSize(32);

  // Create a guideline paragraph below the canvas
  let instructions = createP('Click anywhere on the canvas!');
  instructions.style('font-size', '16px');
  instructions.style('text-align', 'center');
  instructions.style('color', '#FFFFFF');
  instructions.center('horizontal');
}

function draw() {
  background(0, 254); // Semi-transparent background for fade effect

  // Display and update all words
  for (let i = words.length - 1; i >= 0; i--) {
    let word = words[i];
    fill(word.color[0], word.color[1], word.color[2], word.opacity); // Use random color
    textSize(word.size);
    push();
    translate(word.x, word.y);
    rotate(word.rotation);
    text(word.text, 0, 0);
    pop();

    // Update word properties for animation
    word.y -= word.speed; // Move upwards
    word.opacity -= 2; // Fade out
    word.rotation += word.rotationSpeed; // Rotate
    word.size += word.growth; // Change size

    // Remove words that are completely faded
    if (word.opacity <= 0) {
      words.splice(i, 1);
    }
  }
}

function mousePressed() {
  // Add a new word at the mouse position
  let newWord = {
    text: random(curseWords), // Pick a random word
    x: mouseX,
    y: mouseY,
    size: random(24, 48), // Random initial size
    opacity: 255, // Fully visible
    speed: random(1, 3), // Speed of movement
    rotation: 0, // Initial rotation
    rotationSpeed: random(-0.05, 0.05), // Speed of rotation
    growth: random(-0.1, 0.2), // Size growth/shrink rate
    color: [random(255), random(255), random(255)], // Random color
  };
  words.push(newWord);
}
