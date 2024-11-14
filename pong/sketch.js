let leftPaddle, rightPaddle;
let ball;
let leftScore = 0;
let rightScore = 0;
let gameOver = false;
let winner = '';

function setup() {
  createCanvas(600, 400);
  leftPaddle = new Paddle(20);
  rightPaddle = new Paddle(width - 30);
  ball = new Ball();
  // Display instructions
  displayInstructions();
}

function draw() {
  background(55);

  // Display middle border line
  stroke(255);
  strokeWeight(2);
  for (let i = 0; i < height; i += 20) {
    line(width / 2, i, width / 2, i + 10);
  }

  // Display score
  displayScore();

  if (gameOver) {
    displayWinner();
    return;
  }

  // Move and display paddles
  leftPaddle.display();
  rightPaddle.display();
  leftPaddle.move();
  rightPaddle.move();

  // Move and display ball
  ball.move();
  ball.display();

  // Check for collisions with paddles
  ball.checkPaddleCollision(leftPaddle);
  ball.checkPaddleCollision(rightPaddle);

  // Check for scoring
  ball.checkScore();
}

function displayScore() {
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text(leftScore, width * 0.25, 30);
  text(rightScore, width * 0.75, 30);
}

function displayInstructions() {
  textSize(16);
  createP(
    'Left Paddle: W/S | Best Of 5 | Right Paddle: UP/DOWN',
    width / 2,
    height - 20
  ).style('color', 'lightgrey');
}

function displayWinner() {
  noStroke();
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text(winner + ' Wins!', width / 2, height / 2);

  // Display Restart Button
  fill(0, 200, 0);
  rect(width / 2 - 50, height / 2 + 40, 100, 40);
  fill(255);
  textSize(20);
  text('Restart', width / 2, height / 2 + 60);
}

function mousePressed() {
  if (
    gameOver &&
    mouseX > width / 2 - 50 &&
    mouseX < width / 2 + 50 &&
    mouseY > height / 2 + 40 &&
    mouseY < height / 2 + 80
  ) {
    // Restart game
    leftScore = 0;
    rightScore = 0;
    gameOver = false;
    ball.reset();
  }
}

function checkWin() {
  if (leftScore === 5) {
    gameOver = true;
    winner = 'Left Player';
  } else if (rightScore === 5) {
    gameOver = true;
    winner = 'Right Player';
  }
}
