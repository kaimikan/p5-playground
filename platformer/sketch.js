let player;
let platforms = [];
let finishStar;
let enemies = [];
let hazards = [];
let gravity = 0.5;
let currentLevel = 0;

// Predefined levels with platform, enemy, and hazard configurations
const levels = [
  {
    platforms: [
      { x: 100, y: 300, width: 200, height: 20 },
      { x: 400, y: 200, width: 200, height: 20 },
      { x: 600, y: 350, width: 200, height: 20 },
    ],
    enemies: [
      { x: 150, y: 270, width: 20, height: 20, speed: 2 },
      { x: 450, y: 170, width: 20, height: 20, speed: 1.5 },
    ],
    hazards: [{ x: 300, y: 380, width: 100, height: 20 }],
    finishStar: { x: 750, y: 250, size: 20 },
  },
  {
    platforms: [
      { x: 50, y: 300, width: 150, height: 20 },
      { x: 300, y: 250, width: 200, height: 20 },
      { x: 550, y: 150, width: 200, height: 20 },
    ],
    enemies: [{ x: 320, y: 220, width: 20, height: 20, speed: 1.5 }],
    hazards: [{ x: 500, y: 380, width: 80, height: 20 }],
    finishStar: { x: 700, y: 100, size: 20 },
  },
  {
    platforms: [
      { x: 100, y: 300, width: 150, height: 20 },
      { x: 400, y: 250, width: 150, height: 20 },
      { x: 650, y: 350, width: 100, height: 20 },
    ],
    enemies: [
      { x: 120, y: 270, width: 20, height: 20, speed: 2 },
      { x: 420, y: 220, width: 20, height: 20, speed: 1 },
    ],
    hazards: [{ x: 550, y: 380, width: 100, height: 20 }],
    finishStar: { x: 750, y: 250, size: 20 },
  },
];

function setup() {
  createCanvas(800, 400);
  loadLevel(currentLevel);
}

function draw() {
  background(135, 206, 235);

  // Update and display player
  player.update();
  player.display();

  // Display all platforms and check collision with player
  for (let platform of platforms) {
    platform.display();
    player.checkPlatformCollision(platform);
  }

  // Display enemies, update their positions, and check collisions with player
  for (let enemy of enemies) {
    enemy.update();
    enemy.display();
    if (player.checkCollision(enemy)) {
      resetLevel(); // Restart level if collision with enemy
    }
  }

  // Display hazards and check collisions with player
  for (let hazard of hazards) {
    hazard.display();
    if (player.checkCollision(hazard)) {
      resetLevel(); // Restart level if collision with hazard
    }
  }

  // Display finish star and check for collision with player
  finishStar.display();
  if (player.checkFinishCollision(finishStar)) {
    nextLevel();
  }
}

function keyPressed() {
  if (key === ' ' && player.onGround) {
    player.jump();
  }
}

// Load a specific level based on index
function loadLevel(levelIndex) {
  platforms = [];
  enemies = [];
  hazards = [];
  const level = levels[levelIndex];

  // Create platforms for the level
  for (let platData of level.platforms) {
    platforms.push(
      new Platform(platData.x, platData.y, platData.width, platData.height)
    );
  }

  // Create enemies for the level
  for (let enemyData of level.enemies) {
    enemies.push(
      new Enemy(
        enemyData.x,
        enemyData.y,
        enemyData.width,
        enemyData.height,
        enemyData.speed
      )
    );
  }

  // Create hazards for the level
  for (let hazardData of level.hazards) {
    hazards.push(
      new Hazard(
        hazardData.x,
        hazardData.y,
        hazardData.width,
        hazardData.height
      )
    );
  }

  // Set the finish star position for the level
  finishStar = new FinishStar(
    level.finishStar.x,
    level.finishStar.y,
    level.finishStar.size
  );

  // Initialize player position
  player = new Player(50, height - 60); // Starting near the bottom left
}

// Move to the next level or restart from the first level
function nextLevel() {
  currentLevel = (currentLevel + 1) % levels.length;
  loadLevel(currentLevel);
}

// Reset the current level
function resetLevel() {
  loadLevel(currentLevel);
}
