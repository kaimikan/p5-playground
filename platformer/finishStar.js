class FinishStar {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  display() {
    fill(255, 223, 0); // Yellow color
    ellipse(this.x + this.size / 2, this.y + this.size / 2, this.size);
  }
}
