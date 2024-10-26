function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);

    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

let grid;
let w = 5;
let cols, rows;
let hueValue = 200;

function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function setup() {
  createCanvas(800, 300);
  colorMode(HSB, 360, 255, 255);
  cols = width / w;
  rows = height / w;
  grid = make2DArray(cols, rows);
}

function mouseDragged() {
  let mouseCol = floor(mouseX / w);
  let mouseRow = floor(mouseY / w);

  let matrix = 3;
  let range = floor(matrix / 2);
  for (let i = -range; i < range; i++) {
    for (let j = -range; j < range; j++) {
      if (random(1) < 0.75) {
        let col = mouseCol + i;
        let row = mouseRow + j;
        if (withinCols(col) && withinRows(row)) {
          grid[col][row] = hueValue;
        }
      }
    }
  }
  hueValue += 1;
  if (hueValue > 360) {
    hueValue = 0;
  }
}

function draw() {
  background(51);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // stroke(255);
      noStroke();
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        let x = i * w;
        let y = j * w;
        square(x, y, w);
      }
    }
  }

  let nextGrid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      if (state > 0) {
        let below = grid[i][j + 1];

        let direction = random([-1, 1]);

        let belowA = -1;
        let belowB = -1;
        if (withinCols(i + direction)) {
          belowA = grid[i + direction][j + 1];
        }
        if (withinCols(i - direction)) {
          belowB = grid[i - direction][j + 1];
        }

        if (j === rows - 1) {
          nextGrid[i][j] = state;
        } else if (below === 0) {
          nextGrid[i][j] = 0;
          nextGrid[i][j + 1] = state;
        } else if (belowA === 0) {
          nextGrid[i + direction][j + 1] = state;
        } else if (belowB === 0) {
          nextGrid[i - direction][j + 1] = state;
        } else {
          nextGrid[i][j] = state;
        }
      }
    }
  }
  grid = nextGrid;
}
