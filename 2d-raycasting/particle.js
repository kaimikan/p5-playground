class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let angle = 0; angle < 360; angle += 2) {
      this.rays.push(new Ray(this.pos, radians(angle)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let ray of this.rays) {
      let recordDistance = Infinity;
      let closestPoint = null;
      for (let wall of walls) {
        const pnt = ray.cast(wall);
        if (pnt) {
          const distance = p5.Vector.dist(this.pos, pnt);
          if (distance < recordDistance) {
            recordDistance = distance;
            closestPoint = pnt;
          }
        }
      }
      if (closestPoint) {
        stroke('rgba(100%, 100%, 75%, 0.25)');
        strokeWeight(3);
        line(this.pos.x, this.pos.y, closestPoint.x, closestPoint.y);
      }
    }
  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 3);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
