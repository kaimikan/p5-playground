let grid;
let cols, rows;
let ant;
let cellSize = 10; // Size of each cell

function setup() {
  createCanvas(400, 400);

  // Calculate grid size based on cell size
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // Initialize grid as a 2D array
  grid = new Array(cols).fill(0).map(() => new Array(rows).fill(0));

  // Initialize the ant in the center of the grid
  ant = new Ant(floor(cols / 2), floor(rows / 2));
}

function draw() {
  background(255);

  // Display the grid
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(0); // Black for flipped cells
      } else {
        fill(255); // White for default cells
      }
      noStroke();
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Update and display the ant
  ant.update();
  ant.show();
}

// Ant class
class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dir = 0; // 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
  }

  turnRight() {
    this.dir = (this.dir + 1) % 4;
  }

  turnLeft() {
    this.dir = (this.dir + 3) % 4; // Equivalent to subtracting 1 and wrapping
  }

  moveForward() {
    if (this.dir === 0) this.y--; // UP
    else if (this.dir === 1) this.x++; // RIGHT
    else if (this.dir === 2) this.y++; // DOWN
    else if (this.dir === 3) this.x--; // LEFT

    // Wrap around edges
    this.x = (this.x + cols) % cols;
    this.y = (this.y + rows) % rows;
  }

  update() {
    // Flip the current cell's color
    if (grid[this.x][this.y] === 0) {
      this.turnRight();
      grid[this.x][this.y] = 1;
    } else {
      this.turnLeft();
      grid[this.x][this.y] = 0;
    }

    // Move forward
    this.moveForward();
  }

  show() {
    fill(255, 0, 0); // Red for the ant
    noStroke();
    rect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
  }
}
