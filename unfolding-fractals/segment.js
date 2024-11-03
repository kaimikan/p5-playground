let rotationSpeed = 0.1;

class Segment {
  constructor(a, b, origin) {
    this.startA = a;
    this.startB = b;
    this.a = a;
    this.b = b;
    this.completed = false;
    this.angle = 0;
    this.origin = origin.copy();
  }

  show() {
    stroke(255);
    strokeWeight(2 / zoom);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  duplicate(origin) {
    return new Segment(this.a.copy(), this.b.copy(), origin);
  }

  update() {
    this.angle = lerp(0, PI / 2, amount);
    if (this.angle >= PI / 2) {
      this.angle = PI / 2;
      this.completed = true;
    }
    let va = p5.Vector.sub(this.startA, this.origin);
    let vb = p5.Vector.sub(this.startB, this.origin);
    va.rotate(-this.angle);
    vb.rotate(-this.angle);
    this.a = p5.Vector.add(this.origin, va);
    this.b = p5.Vector.add(this.origin, vb);
  }
}
