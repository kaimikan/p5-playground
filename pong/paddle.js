class Paddle {
  constructor(x) {
    this.x = x;
    this.y = height / 2 - 40;
    this.width = 10;
    this.height = 80;
    this.speed = 5;
  }

  display() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }

  move() {
    if (this === leftPaddle) {
      if (keyIsDown(87)) this.y -= this.speed; // 'W' key
      if (keyIsDown(83)) this.y += this.speed; // 'S' key
    } else {
      if (keyIsDown(UP_ARROW)) this.y -= this.speed;
      if (keyIsDown(DOWN_ARROW)) this.y += this.speed;
    }
    this.y = constrain(this.y, 0, height - this.height);
  }
}
