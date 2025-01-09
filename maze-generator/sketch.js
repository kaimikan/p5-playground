let cols, rows;
let w = 40; // Width of each cell
let grid = [];
let stack = [];

function setup() {
  createCanvas(800, 600);
  cols = floor(width / w);
  rows = floor(height / w);
  // Create grid of cells
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push(new Cell(x, y));
    }
  }
  // Start at a random cell
  let start = grid[floor(random(grid.length))];
  stack.push(start);
  start.visited = true;

  // Download Button
  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#1f1f83');
  downloadButton.style('color', 'white');
  downloadButton.mousePressed(() => saveCanvas('maze', 'png'));
}

function draw() {
  background(51);
  for (let i = 0; i < grid.length; i++) {
    grid[i].show();
  }

  // Recursive backtracking maze generation
  if (stack.length > 0) {
    let current = stack[stack.length - 1];
    let next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(next);
      current.removeWalls(next);
    } else {
      stack.pop();
    }
  }
}

// Cell class for the grid
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited = false;
  }

  // Show the cell
  show() {
    let x = this.x * w;
    let y = this.y * w;
    stroke(255);
    if (this.walls[0]) line(x, y, x + w, y); // top
    if (this.walls[1]) line(x + w, y, x + w, y + w); // right
    if (this.walls[2]) line(x + w, y + w, x, y + w); // bottom
    if (this.walls[3]) line(x, y + w, x, y); // left

    if (this.visited) {
      noStroke();
      fill(0, 0, 255, 100);
      rect(x, y, w, w);
    }
  }

  // Check unvisited neighbors
  checkNeighbors() {
    let neighbors = [];
    let top = grid[index(this.x, this.y - 1)];
    let right = grid[index(this.x + 1, this.y)];
    let bottom = grid[index(this.x, this.y + 1)];
    let left = grid[index(this.x - 1, this.y)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      return random(neighbors);
    } else {
      return undefined;
    }
  }

  // Remove walls between two cells
  removeWalls(next) {
    let x = this.x - next.x;
    if (x === 1) {
      this.walls[3] = false;
      next.walls[1] = false;
    } else if (x === -1) {
      this.walls[1] = false;
      next.walls[3] = false;
    }

    let y = this.y - next.y;
    if (y === 1) {
      this.walls[0] = false;
      next.walls[2] = false;
    } else if (y === -1) {
      this.walls[2] = false;
      next.walls[0] = false;
    }
  }
}

// Index for the grid cell
function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) {
    return -1;
  }
  return x + y * cols;
}
