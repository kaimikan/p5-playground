class Droplet {
  constructor() {
    this.x = random(width); // Random x position
    this.y = random(-height, 0); // Random y position
    this.speed = random(5, 10); // Random speed for variation
    this.length = random(10, 20); // Random length of the droplet
    this.blueness = random(180, 240);
    this.color = color(this.blueness, 83, 100, 1); // Random color between blue and white, with some transparency
  }

  // Update droplet position
  update() {
    this.y += this.speed;

    // Reset droplet to the top once it reaches the bottom
    if (this.y > height) {
      this.y = random(-100, 0);
      this.x = random(width);
      this.speed = random(5, 10);
      this.length = random(10, 20);
    }
  }

  // Draw droplet
  show() {
    stroke(this.color); // Light gray color with some transparency
    strokeWeight(this.blueness / 50);
    line(this.x, this.y, this.x, this.y + this.length);
  }
}
