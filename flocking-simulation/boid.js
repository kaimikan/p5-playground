class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  align(boids) {
    let perceptionRadius = 50;
    let totalBoidsInRange = 0;
    let steeringForce = createVector();

    for (let otherBoid of boids) {
      if (otherBoid != this) {
        let distance = dist(
          this.position.x,
          this.position.y,
          otherBoid.position.x,
          otherBoid.position.y
        );
        if (distance < perceptionRadius) {
          steeringForce.add(otherBoid.velocity);
          totalBoidsInRange++;
        }
      }
    }

    if (totalBoidsInRange > 0) {
      steeringForce.div(totalBoidsInRange);
      steeringForce.setMag(this.maxSpeed);
      steeringForce.sub(this.velocity);
      steeringForce.limit(this.maxForce);
    }
    return steeringForce;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let totalBoidsInRange = 0;
    let steeringForce = createVector();

    for (let otherBoid of boids) {
      if (otherBoid != this) {
        let distance = dist(
          this.position.x,
          this.position.y,
          otherBoid.position.x,
          otherBoid.position.y
        );
        if (distance < perceptionRadius) {
          steeringForce.add(otherBoid.position);
          totalBoidsInRange++;
        }
      }
    }

    if (totalBoidsInRange > 0) {
      steeringForce.div(totalBoidsInRange);
      steeringForce.sub(this.position);
      steeringForce.setMag(this.maxSpeed);
      steeringForce.sub(this.velocity);
      steeringForce.limit(this.maxForce);
    }
    return steeringForce;
  }

  separation(boids) {
    let perceptionRadius = 50;
    let totalBoidsInRange = 0;
    let steeringForce = createVector();

    for (let otherBoid of boids) {
      if (otherBoid != this) {
        let distance = dist(
          this.position.x,
          this.position.y,
          otherBoid.position.x,
          otherBoid.position.y
        );
        if (distance < perceptionRadius) {
          let difference = p5.Vector.sub(this.position, otherBoid.position);
          difference.mult(1 / distance); // difference.div(distance)
          steeringForce.add(difference);
          totalBoidsInRange++;
        }
      }
    }

    if (totalBoidsInRange > 0) {
      steeringForce.div(totalBoidsInRange);
      steeringForce.setMag(this.maxSpeed);
      steeringForce.sub(this.velocity);
      steeringForce.limit(this.maxForce);
    }
    return steeringForce;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignmentSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.set(0, 0); // or this.acceleration.mult(0)
  }

  show() {
    strokeWeight(7);
    stroke(255);
    point(this.position.x, this.position.y);
  }
}
