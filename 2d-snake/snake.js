class Snake {
  constructor() {
    this.body = [];
    this.body[0] = createVector(width / 2, height / 2);
    this.xdir = 0;
    this.ydir = 0;
    this.length = 1;
  }

  setDirection(x, y) {
    this.xdir = x;
    this.ydir = y;
  }

  update() {
    let head = this.body[this.body.length - 1].copy();
    this.body.shift();
    head.x += this.xdir;
    head.y += this.ydir;
    this.body.push(head);
  }

  grow() {
    let head = this.body[this.body.length - 1].copy();
    this.length++;
    this.body.push(head);
  }

  endGame() {
    let head = this.body[this.body.length - 1];
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
      return true;
    }
    for (let i = 0; i < this.body.length - 1; i++) {
      let part = this.body[i];
      if (dist(head.x, head.y, part.x, part.y) < 1) {
        return true;
      }
    }
    return false;
  }

  eat(pos) {
    let head = this.body[this.body.length - 1];
    if (dist(head.x, head.y, pos.x, pos.y) < 10) {
      this.grow();
      return true;
    }
    return false;
  }

  show() {
    for (let i = 0; i < this.body.length; i++) {
      fill(0);
      noStroke();
      ellipse(this.body[i].x, this.body[i].y, 10, 10);
    }
  }
}
