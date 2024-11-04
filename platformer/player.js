class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 40;
    this.velocityY = 0;
    this.onGround = false;
  }

  update() {
    this.velocityY += gravity;
    this.y += this.velocityY;

    if (this.y + this.height > height) {
      this.y = height - this.height;
      this.velocityY = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 5;
    }

    // Constrain player within the screen bounds horizontally
    this.x = constrain(this.x, 0, width - this.width);
  }

  jump() {
    this.velocityY = -10;
    this.onGround = false;
  }

  checkCollision(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }

  checkPlatformCollision(platform) {
    const withinXBounds =
      this.x + this.width > platform.x && this.x < platform.x + platform.width;
    const withinYBounds =
      this.y + this.height > platform.y &&
      this.y < platform.y + platform.height;

    if (withinXBounds && withinYBounds) {
      const overlapBottom = platform.y + platform.height - this.y;
      const overlapTop = this.y + this.height - platform.y;
      const overlapLeft = this.x + this.width - platform.x;
      const overlapRight = platform.x + platform.width - this.x;

      // Determine the minimum overlap side (direction of collision)
      const minOverlap = Math.min(
        overlapBottom,
        overlapTop,
        overlapLeft,
        overlapRight
      );

      if (minOverlap === overlapBottom) {
        this.y = platform.y + platform.height;
        this.velocityY = 0; // Stop upwards movement
      } else if (minOverlap === overlapTop) {
        this.y = platform.y - this.height;
        this.velocityY = 0; // Stop falling
        this.onGround = true;
      } else if (minOverlap === overlapLeft) {
        this.x = platform.x - this.width;
      } else if (minOverlap === overlapRight) {
        this.x = platform.x + platform.width;
      }
    }
  }

  checkFinishCollision(finishStar) {
    return (
      this.x < finishStar.x + finishStar.size &&
      this.x + this.width > finishStar.x &&
      this.y < finishStar.y + finishStar.size &&
      this.y + this.height > finishStar.y
    );
  }

  display() {
    fill(0, 155, 255);
    rect(this.x, this.y, this.width, this.height);
  }
}
