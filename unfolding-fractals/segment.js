class Segment {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  show() {
    stroke(255);
    strokeWeight(2);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  rotate(origin) {
    let va = p5.Vector.sub(this.a, origin);
    let vb = p5.Vector.sub(this.b, origin);
    va.rotate(-PI / 2);
    vb.rotate(-PI / 2);
    let newA = p5.Vector.add(origin, va);
    let newB = p5.Vector.add(origin, vb);
    let newS = new Segment(newA, newB);
    return newS;
  }
}
