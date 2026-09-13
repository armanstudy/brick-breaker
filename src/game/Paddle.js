import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDE_MULTIPLIER } from "./constants.js";

export class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.baseWidth = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.speed = PADDLE_SPEED;
    this.y = canvasHeight - this.height - 20;
    this.movingLeft = false;
    this.movingRight = false;
    this.reset();
  }

  reset() {
    this.width = this.baseWidth;
    this.wide = false;
    this.x = (this.canvasWidth - this.width) / 2;
    this.movingLeft = false;
    this.movingRight = false;
  }

  setMovingLeft(value) {
    this.movingLeft = value;
  }

  setMovingRight(value) {
    this.movingRight = value;
  }

  setWide(active) {
    this.wide = active;
    const newWidth = active ? this.baseWidth * PADDLE_WIDE_MULTIPLIER : this.baseWidth;
    const center = this.x + this.width / 2;
    this.width = newWidth;
    this.x = Math.min(Math.max(center - this.width / 2, 0), this.canvasWidth - this.width);
  }

  setPositionByX(x) {
    this.x = Math.min(Math.max(x - this.width / 2, 0), this.canvasWidth - this.width);
  }

  update(dt) {
    let dx = 0;
    if (this.movingLeft) dx -= this.speed * dt;
    if (this.movingRight) dx += this.speed * dt;

    this.x += dx;
    this.x = Math.min(Math.max(this.x, 0), this.canvasWidth - this.width);
  }

  draw(ctx) {
    ctx.fillStyle = "#f1faee";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
