class Cell {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.mine = false;
    this.revealed = false;
    this.flagged = false;
    this.neighborCount = 0;
  }

  show() {
    stroke(0);
    fill(200);
    rect(this.x * this.size, this.y * this.size, this.size, this.size);

    if (this.revealed) {
      if (this === triggeredMine) {
        fill(127, 0, 0);
        ellipse(
          this.x * this.size + this.size / 2,
          this.y * this.size + this.size / 2,
          this.size * 0.5
        );
      } else if (this.mine) {
        fill(127);
        ellipse(
          this.x * this.size + this.size / 2,
          this.y * this.size + this.size / 2,
          this.size * 0.5
        );
      } else {
        fill(255);
        rect(this.x * this.size, this.y * this.size, this.size, this.size);
        if (this.neighborCount > 0) {
          fill(0);
          textAlign(CENTER);
          textSize(16);
          text(
            this.neighborCount,
            this.x * this.size + this.size / 2,
            this.y * this.size + this.size - 10
          );
        }
      }
    } else if (this.flagged) {
      fill(255, 0, 0);
      textAlign(CENTER);
      textSize(20);
      text(
        '🚩',
        this.x * this.size + this.size / 2,
        this.y * this.size + this.size - 10
      );
    }
  }

  reveal() {
    this.revealed = true;
    if (this.neighborCount === 0 && !this.mine) {
      this.floodFill();
    }
  }

  toggleFlag() {
    if (!this.revealed) {
      this.flagged = !this.flagged;
    }
  }

  countMines() {
    if (this.mine) {
      this.neighborCount = -1;
      return;
    }
    let total = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let nx = this.x + dx;
        let ny = this.y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          let neighbor = grid[nx][ny];
          if (neighbor.mine) {
            total++;
          }
        }
      }
    }
    this.neighborCount = total;
  }

  floodFill() {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let nx = this.x + dx;
        let ny = this.y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          let neighbor = grid[nx][ny];
          if (!neighbor.revealed && !neighbor.mine) {
            neighbor.reveal();
          }
        }
      }
    }
  }
}
