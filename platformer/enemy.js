class Enemy {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1; // Moving right initially
  }

  update() {
    this.x += this.speed * this.direction;
    if (this.x <= 0 || this.x + this.width >= width) {
      this.direction *= -1; // Reverse direction when hitting edges
    }
  }

  display() {
    fill(255, 155, 0); // Blue for enemies
    rect(this.x, this.y, this.width, this.height);
  }
}
