let particles = [];
let numParticles = 10;

function setup() {
  createCanvas(400, 400);

  // Initialize particles with random positions and velocities
  for (let i = 0; i < numParticles; i++) {
    let particle = {
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-2, 2), random(-2, 2)),
      acc: createVector(0, 0),
    };
    particles.push(particle);
  }
}

function draw() {
  background(255, 0.74);

  // Update and display each particle
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // Update physics: velocity and position
    p.vel.add(p.acc);
    p.pos.add(p.vel);

    // Check for bouncing off walls
    if (p.pos.x < 0 || p.pos.x > width) p.vel.x *= -1;
    if (p.pos.y < 0 || p.pos.y > height) p.vel.y *= -1;

    // Reset acceleration for the next frame
    p.acc.mult(0);
  }

  // Draw lines between each particle
  stroke(0, 150); // semi-transparent lines
  strokeWeight(1);
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let p1 = particles[i];
      let p2 = particles[j];
      line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
    }
  }

  // Draw particles
  fill(0);
  noStroke();
  for (let i = 0; i < particles.length; i++) {
    ellipse(particles[i].pos.x, particles[i].pos.y, 8, 8);
  }
}
