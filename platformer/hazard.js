class Hazard {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  display() {
    fill(255, 0, 0); // Red for hazards
    rect(this.x, this.y, this.width, this.height);
  }
}
