let ball, paddle, tiles;
let ballSpeedX = 4;
let ballSpeedY = 4;
let lives = 3;
let score = 0;
let gameState = 'playing'; // "playing", "won", "lost"

function setup() {
  createCanvas(600, 400);
  resetGame();
}

function draw() {
  background(30);

  if (gameState === 'playing') {
    playGame();
  } else if (gameState === 'lost') {
    displayLoseUI();
  } else if (gameState === 'won') {
    displayWinUI();
  }
}

function playGame() {
  drawUI();

  // Draw the paddle
  paddle.x = mouseX - paddle.width / 2;
  paddle.x = constrain(paddle.x, 0, width - paddle.width);
  fill(200, 100, 50);
  rect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Update ball position
  ball.x += ballSpeedX;
  ball.y += ballSpeedY;

  // Ball collision with walls
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
    ballSpeedX *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ballSpeedY *= -1;
  }

  // Ball collision with paddle
  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ballSpeedY *= -1;
    ball.y = paddle.y - ball.radius; // Prevent sticking
  }

  // Ball falls below paddle
  if (ball.y > height) {
    lives--;
    if (lives <= 0) {
      gameState = 'lost';
    } else {
      resetBall();
    }
  }

  // Ball collision with tiles
  for (let i = tiles.length - 1; i >= 0; i--) {
    let tile = tiles[i];

    // Check if the ball overlaps with a tile
    if (
      ball.x + ball.radius > tile.x &&
      ball.x - ball.radius < tile.x + tile.width &&
      ball.y + ball.radius > tile.y &&
      ball.y - ball.radius < tile.y + tile.height
    ) {
      // Determine the collision side
      let overlapLeft = ball.x - (tile.x + tile.width); // Overlap on the left
      let overlapRight = ball.x - tile.x; // Overlap on the right
      let overlapTop = ball.y - (tile.y + tile.height); // Overlap on the top
      let overlapBottom = ball.y - tile.y; // Overlap on the bottom

      // Find the smallest absolute overlap to determine the collision direction
      let minOverlap = Math.min(
        Math.abs(overlapLeft),
        Math.abs(overlapRight),
        Math.abs(overlapTop),
        Math.abs(overlapBottom)
      );

      if (
        minOverlap === Math.abs(overlapLeft) ||
        minOverlap === Math.abs(overlapRight)
      ) {
        // Side collision
        ballSpeedX *= -1;
      } else {
        // Top or bottom collision
        ballSpeedY *= -1;
      }

      tiles.splice(i, 1); // Remove the tile
      score++;
      if (tiles.length === 0) {
        gameState = 'won';
      }
      break; // Exit loop after one collision
    }
  }

  // Draw the ball
  fill(255, 100, 100);
  ellipse(ball.x, ball.y, ball.radius * 2);

  // Draw tiles
  for (let tile of tiles) {
    fill(100, 200, 100);
    rect(tile.x, tile.y, tile.width, tile.height);
  }
}

function drawUI() {
  fill(255);
  textSize(20);
  text(`Lives: ${lives}`, width / 10, 30);
}

function displayLoseUI() {
  background(30);
  fill(255, 50, 50);
  textSize(32);
  textAlign(CENTER);
  text('Game Over', width / 2, height / 2 - 20);
  textSize(20);
  text('Press R to Restart', width / 2, height / 2 + 20);
}

function displayWinUI() {
  background(30);
  fill(50, 255, 50);
  textSize(32);
  textAlign(CENTER);
  text('You Win!', width / 2, height / 2 - 20);
  textSize(20);
  text('Press R to Restart', width / 2, height / 2 + 20);
}

function resetGame() {
  lives = 3;
  score = 0;
  gameState = 'playing';

  // Create ball
  ball = { x: width / 2, y: height / 2, radius: 10 };

  // Create paddle
  paddle = { x: width / 2 - 50, y: height - 30, width: 100, height: 10 };

  // Create tiles
  tiles = [];
  let cols = 8;
  let rows = 3;
  let tileWidth = width / cols;
  let tileHeight = 20;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      tiles.push({
        x: j * tileWidth,
        y: i * tileHeight + 50,
        width: tileWidth - 2,
        height: tileHeight - 2,
      });
    }
  }

  resetBall();
}

function resetBall() {
  ball.x = width / 2;
  ball.y = height / 2;
  ballSpeedX = random([-4, 4]);
  ballSpeedY = 4;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    resetGame();
  }
}
