
class Star {
  constructor() {
    this.init();
  }

  init() {
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.z = random(width); // Distance in 3D space
    this.pz = this.z; // Previous z-position
  }

  update() {
    this.z -= speed; // Simulate motion towards the viewer
    if (this.z < 1) {
      this.init(); // Reset star when it passes the viewer
    }
  }

  show() {
    // Map 3D position to 2D space
    let sx = map(this.x / this.z, 0, 1, 0, width);
    let sy = map(this.y / this.z, 0, 1, 0, height);

    // Previous position for drawing motion trails
    let px = map(this.x / this.pz, 0, 1, 0, width);
    let py = map(this.y / this.pz, 0, 1, 0, height);

    // Update previous z-position
    this.pz = this.z;

    // Calculate star brightness and size based on proximity
    let brightness = map(this.z, 0, width, 255, 0);
    let size = map(this.z, 0, width, 8, 0);

    stroke(brightness);
    strokeWeight(size);
    line(px, py, sx, sy); // Create motion trails
  }
}
