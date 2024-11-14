class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.diameter = 20;
    this.xSpeed = random(3, 5) * (random(1) > 0.5 ? 1 : -1);
    this.ySpeed = random(3, 5) * (random(1) > 0.5 ? 1 : -1);
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Bounce off top and bottom edges
    if (this.y <= 0 || this.y >= height) {
      this.ySpeed *= -1;
    }
  }

  checkPaddleCollision(paddle) {
    if (
      this.x - this.diameter / 2 < paddle.x + paddle.width &&
      this.x + this.diameter / 2 > paddle.x &&
      this.y > paddle.y &&
      this.y < paddle.y + paddle.height
    ) {
      this.xSpeed *= -1.05; // Increase speed slightly on bounce
      this.x =
        paddle === leftPaddle
          ? paddle.x + paddle.width + this.diameter / 2
          : paddle.x - this.diameter / 2; // Adjust ball position
    }
  }

  checkScore() {
    if (this.x < 0) {
      rightScore++;
      this.reset();
      checkWin();
    } else if (this.x > width) {
      leftScore++;
      this.reset();
      checkWin();
    }
  }
}
