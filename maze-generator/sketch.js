let cols, rows;
let w = 40; // Width of each cell
let grid = [];
let stack = [];
let startPoint, endPoint, player;
let isWin = false;
let hintPath = []; // To store the hint trail

function setup() {
  createCanvas(800, 600);
  cols = floor(width / w);
  rows = floor(height / w);
  resetMaze();

  // Download Button
  downloadButton = createButton('Download Canvas');
  downloadButton.style('background-color', '#1f1f83');
  downloadButton.style('color', 'white');
  downloadButton.mousePressed(() => saveCanvas('maze', 'png'));

  // Reset Button
  resetButton = createButton('Reset Maze');
  resetButton.style('background-color', '#1f1f83');
  resetButton.style('color', 'white');
  resetButton.mousePressed(resetMaze);

  // Show Hint Button
  hintButton = createButton('Show Hint');
  hintButton.style('background-color', '#1f1f83');
  hintButton.style('color', 'white');
  hintButton.mousePressed(showHint);
}

function draw() {
  background(51);

  // Show all cells
  for (let i = 0; i < grid.length; i++) {
    grid[i].show();
  }

  // Show the hint path
  if (hintPath.length > 0) {
    push();
    noStroke();
    fill(255, 165, 0, 150); // Orange color for the hint
    for (let cell of hintPath) {
      rect(cell.x * w, cell.y * w, w, w);
    }
    pop();
  }

  push();
  strokeWeight(0);
  // Highlight start and end points
  fill(0, 255, 0);
  rect(
    startPoint.x * w + w * 0.05,
    startPoint.y * w + w * 0.05,
    w * 0.9,
    w * 0.9
  ); // Start point

  fill(255, 0, 0);
  rect(endPoint.x * w + w * 0.05, endPoint.y * w + w * 0.05, w * 0.9, w * 0.9); // End point

  // Show player
  fill(255, 255, 0);
  rect(player.x * w + w * 0.1, player.y * w + w * 0.1, w * 0.8, w * 0.8);
  pop();

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

  // Check win condition
  if (player.x === endPoint.x && player.y === endPoint.y && !isWin) {
    isWin = true;
    alert('Congratulations! You reached the end of the maze!');
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
    strokeWeight(2);
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

// Reset maze and initialize game
function resetMaze() {
  grid = [];
  stack = [];
  isWin = false;
  hintPath = []; // Clear the hint path

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

  // Define start and end points
  startPoint = start;
  endPoint = grid[floor(random(grid.length))];
  while (endPoint === startPoint) {
    endPoint = grid[floor(random(grid.length))];
  }

  // Set player position to start point
  player = { x: startPoint.x, y: startPoint.y };
}

// Show hint by finding a path
function showHint() {
  hintPath = [];
  let visited = new Set();
  findPath(grid[index(player.x, player.y)], []);

  function findPath(current, path) {
    if (current === grid[index(endPoint.x, endPoint.y)]) {
      hintPath = path.concat(current);
      return true;
    }
    visited.add(current);
    let directions = [
      { x: 0, y: -1, wall: 0 }, // up
      { x: 1, y: 0, wall: 1 }, // right
      { x: 0, y: 1, wall: 2 }, // down
      { x: -1, y: 0, wall: 3 }, // left
    ];

    for (let dir of directions) {
      let neighbor = grid[index(current.x + dir.x, current.y + dir.y)];
      if (neighbor && !visited.has(neighbor) && !current.walls[dir.wall]) {
        if (findPath(neighbor, path.concat(current))) {
          return true;
        }
      }
    }
    return false;
  }
}

// Move player with arrow keys
function keyPressed() {
  if (isWin) return;

  let current = grid[index(player.x, player.y)];
  if (keyCode === UP_ARROW && !current.walls[0]) player.y--;
  if (keyCode === RIGHT_ARROW && !current.walls[1]) player.x++;
  if (keyCode === DOWN_ARROW && !current.walls[2]) player.y++;
  if (keyCode === LEFT_ARROW && !current.walls[3]) player.x--;
}
