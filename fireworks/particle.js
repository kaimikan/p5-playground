class Particle {
  constructor(x, y, firework, color) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.color = color; // Store the color for both the firework and explosion particles
    this.trail = []; // Trail effect positions for each particle

    if (firework) {
      // Launch upwards with a controlled velocity
      this.vel = createVector(0, random(-15, -8));
    } else {
      // Explosion particles spread out
      let angle = random(TWO_PI);
      let speed = random(2, 10);
      this.vel = p5.Vector.fromAngle(angle).mult(speed);
    }
    this.acc = createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;

      // Store positions for trail effect
      if (this.trail.length < 10) {
        this.trail.push(this.pos.copy());
      } else {
        this.trail.shift();
        this.trail.push(this.pos.copy());
      }
    } else {
      // Small initial trail for the launching firework
      if (this.trail.length < 5) {
        // Shorter trail for the projectile
        this.trail.push(this.pos.copy());
      } else {
        this.trail.shift();
        this.trail.push(this.pos.copy());
      }
    }

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);

    // Draw the trail effect with the particle's assigned color
    for (let i = 0; i < this.trail.length; i++) {
      let pos = this.trail[i];
      let trailColor = color(
        hue(this.color),
        (saturation = 50),
        brightness(this.color),
        (this.lifespan / 255) * (i / this.trail.length) * 255
      );

      stroke(trailColor);
      // stroke('grey');
      strokeWeight(2 - i / 5);
      point(pos.x, pos.y);
    }

    // Draw the particle itself with the assigned color
    if (!this.firework) {
      strokeWeight(2);
      stroke(this.color, this.lifespan);
    } else {
      strokeWeight(4);
      stroke(this.color);
    }
    point(this.pos.x, this.pos.y);
  }
}
