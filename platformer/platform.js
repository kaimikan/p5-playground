class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  display() {
    fill(50, 205, 50); // Green color for platforms
    rect(this.x, this.y, this.width, this.height);
  }
}
