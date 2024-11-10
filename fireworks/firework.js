class Firework {
  constructor(x, y) {
    // Assign a random color to the entire firework
    this.color = color(random(360), 255, 255);
    this.firework = new Particle(x, y, true, this.color); // Pass color to the main particle
    this.exploded = false;
    this.particles = [];
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();

      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    let particleCount = int(random(25, 100)); // Variable explosion size
    for (let i = 0; i < particleCount; i++) {
      let p = new Particle(
        this.firework.pos.x,
        this.firework.pos.y,
        false,
        this.color
      ); // Pass color to explosion particles
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }

    for (let p of this.particles) {
      p.show();
    }
  }
}
