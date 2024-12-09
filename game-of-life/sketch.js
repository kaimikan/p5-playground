let cols, rows;
let grid;
let next;
let cellSize = 10;

function setup() {
  createCanvas(600, 420); // Extra space for instructions
  cols = floor(width / cellSize);
  rows = floor((height - 20) / cellSize);

  grid = create2DArray(cols, rows);
  next = create2DArray(cols, rows);

  // Initialize grid with random values
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = floor(random(2));
    }
  }
}

function draw() {
  background(220);

  // Draw the grid
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(0);
      } else {
        fill(255);
      }
      stroke(200);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Display instructions
  fill(0);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text('Click on a tile to add life to the cell', width / 2, height - 5);

  // Compute next generation
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let state = grid[x][y];
      let neighbors = countNeighbors(grid, x, y);

      if (state === 0 && neighbors === 3) {
        next[x][y] = 1; // Reproduction
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        next[x][y] = 0; // Underpopulation or Overpopulation
      } else {
        next[x][y] = state; // Stasis
      }
    }
  }

  // Swap grids
  let temp = grid;
  grid = next;
  next = temp;
}

// Create a 2D array
function create2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

// Count neighbors
function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  sum -= grid[x][y]; // Subtract the cell's own state
  return sum;
}

// Add life to a cell on mouse click
function mousePressed() {
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);

  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    grid[x][y] = 1; // Add life to the cell
  }
}
