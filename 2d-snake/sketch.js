let snake;
let food;
let baseSpeed = 2; // Initial speed of the snake
let speed = baseSpeed; // Current speed of the snake, increases with each food eaten
let speedIncrease = 0.2; // Amount to increase the speed after each food eaten
let maxSpeed = 5; // Maximum speed limit
let score = 0;
let highScore = 0;
let gameOver = false;
let showHint = true;

function setup() {
  createCanvas(400, 400);
  snake = new Snake();
  placeFood();
}

function draw() {
  background(220);

  if (gameOver) {
    displayGameOver();
    return;
  }

  if (showHint) {
    displayHint();
  }

  // Check for snake eating the food
  if (snake.eat(food)) {
    score++; // Increase score each time food is eaten
    placeFood(); // Move food to a new location

    // Increase snake speed with each food eaten
    speed = min(speed + speedIncrease, maxSpeed); // Limit the speed to `maxSpeed`
  }

  snake.update();
  snake.show();

  // Show food
  fill(255, 0, 0);
  ellipse(food.x, food.y, 10, 10);

  // Show score and high score
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 10, 10);
  text('High Score: ' + highScore, 10, 30);

  if (snake.endGame()) {
    gameOver = true;
    if (score > highScore) {
      highScore = score; // Update high score if current score is higher
    }
  }
}

function displayHint() {
  textSize(20);
  fill(100);
  textAlign(CENTER, CENTER);
  text('Press the arrow keys to move the snake', width / 2, height / 2 - 20);
}

function placeFood() {
  let validLocation = false;
  while (!validLocation) {
    food = createVector(random(width), random(height));
    validLocation = true;

    for (let i = 0; i < snake.body.length; i++) {
      let part = snake.body[i];
      if (dist(food.x, food.y, part.x, part.y) < 10) {
        validLocation = false;
        break;
      }
    }
  }
}

function displayGameOver() {
  textSize(32);
  fill(0);
  textAlign(CENTER, CENTER);
  text('Game Over', width / 2, height / 2 - 20);
  textSize(16);
  text('Score: ' + score, width / 2, height / 2 + 10);
  text('High Score: ' + highScore, width / 2, height / 2 + 30);

  fill(200);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 70, 100, 30);
  fill(0);
  text('Restart', width / 2, height / 2 + 70);
}

function mousePressed() {
  if (gameOver) {
    if (
      mouseX > width / 2 - 50 &&
      mouseX < width / 2 + 50 &&
      mouseY > height / 2 + 55 &&
      mouseY < height / 2 + 85
    ) {
      restartGame();
    }
  }
}

function restartGame() {
  snake = new Snake();
  score = 0;
  speed = baseSpeed; // Reset speed to initial speed
  gameOver = false;
  showHint = true;
  placeFood();
  loop();
}

function keyPressed() {
  if (
    keyCode === UP_ARROW ||
    keyCode === DOWN_ARROW ||
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW
  ) {
    showHint = false;
  }

  if (keyCode === UP_ARROW && snake.ydir === 0) {
    snake.setDirection(0, -speed);
  } else if (keyCode === DOWN_ARROW && snake.ydir === 0) {
    snake.setDirection(0, speed);
  } else if (keyCode === RIGHT_ARROW && snake.xdir === 0) {
    snake.setDirection(speed, 0);
  } else if (keyCode === LEFT_ARROW && snake.xdir === 0) {
    snake.setDirection(-speed, 0);
  }
}
