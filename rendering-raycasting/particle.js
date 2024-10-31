class Particle {
  constructor() {
    this.fov = 45;
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    this.heading = 0;
    for (let angle = -this.fov / 2; angle < this.fov / 2; angle += 1) {
      this.rays.push(new Ray(this.pos, radians(angle)));
    }
  }

  updateFOV(fov) {
    this.fov = fov;
    this.rays = [];
    for (let angle = -this.fov / 2; angle < this.fov / 2; angle += 1) {
      this.rays.push(new Ray(this.pos, radians(angle) + this.heading));
    }
  }

  rotate(angle) {
    this.heading += angle;
    let index = 0;
    for (let angle = -this.fov / 2; angle < this.fov / 2; angle += 1) {
      this.rays[index].setAngle(radians(angle) + this.heading);
      index++;
    }
  }

  move(amount) {
    const velocity = p5.Vector.fromAngle(this.heading);
    velocity.setMag(amount);
    this.pos.add(velocity);
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    let scene = [];
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let recordDistance = Infinity;
      let closestPoint = null;
      for (let wall of walls) {
        const pnt = ray.cast(wall);
        if (pnt) {
          let distance = p5.Vector.dist(this.pos, pnt);
          const angl = ray.dir.heading() - this.heading;
          distance *= cos(angl);
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
      scene[i] = recordDistance;
    }
    return scene;
  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 3);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
