// Game settings
let cols = 10;
let rows = 10;
let cellSize = 40;
let grid = [];
let totalMines = 15;
let gameState = 'playing'; // Can be "playing", "win", or "lose"
let triggeredMine = null; // To store the location of the mine that caused game over

function setup() {
  createCanvas(cols * cellSize, rows * cellSize);
  initializeGame();

  // Prevent right-click from showing context menu
  document.oncontextmenu = function () {
    return false;
  };
  // Display control hints below the canvas
  createP(
    'Controls: Left-click to reveal a cell, Right-click to flag/unflag a cell. Avoid all mines to win!'
  ).style('color', 'white');
}

function initializeGame() {
  // Reset game state and create grid
  grid = [];
  gameState = 'playing';
  triggeredMine = null;

  // Initialize grid with cells
  for (let x = 0; x < cols; x++) {
    grid[x] = [];
    for (let y = 0; y < rows; y++) {
      grid[x][y] = new Cell(x, y, cellSize);
    }
  }

  // Randomly place mines
  placeMines();

  // Calculate neighboring mines for each cell
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y].countMines();
    }
  }
}

function draw() {
  background(255);

  // Display each cell
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y].show();
    }
  }

  // Check if the player has won
  if (gameState === 'playing' && checkWin()) {
    gameState = 'win';
  }

  // Display end screen if game is over
  if (gameState === 'win') {
    displayMessage('You Win!');
  } else if (gameState === 'lose') {
    displayMessage('Game Over');
  }
}

function mousePressed() {
  if (gameState === 'playing') {
    let x = floor(mouseX / cellSize);
    let y = floor(mouseY / cellSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      let cell = grid[x][y];
      if (mouseButton === LEFT) {
        if (!cell.flagged) {
          // Prevent revealing if flagged
          cell.reveal();
          if (cell.mine) {
            triggeredMine = cell; // Store the mine that triggered game over
            gameOver();
          }
        }
      } else if (mouseButton === RIGHT) {
        cell.toggleFlag();
      }
    }
  } else {
    // If game is over, click to restart
    initializeGame();
  }
  return false; // Prevent default context menu
}

// Function to place mines randomly
function placeMines() {
  let options = [];
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      options.push([x, y]);
    }
  }
  for (let n = 0; n < totalMines; n++) {
    let index = floor(random(options.length));
    let choice = options[index];
    let x = choice[0];
    let y = choice[1];
    grid[x][y].mine = true;
    options.splice(index, 1);
  }
}

// Check if all non-mine cells are revealed
function checkWin() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let cell = grid[x][y];
      if (!cell.mine && !cell.revealed) {
        return false;
      }
    }
  }
  return true;
}

// Game over function
function gameOver() {
  gameState = 'lose';
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y].revealed = true;
    }
  }
}

// Display win or lose message and reset prompt
function displayMessage(message) {
  push();
  // Draw a semi-transparent background box
  fill(0, 150); // Black with 150 alpha for transparency
  rect(0, height / 2 - 50, width, 100);

  // Display the message
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text(message, width / 2, height / 2);
  textSize(16);
  text('Click to Restart', width / 2, height / 2 + 40);
  pop();
}
