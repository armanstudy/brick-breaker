import { BALL_RADIUS, BALL_SPEED } from "./constants.js";

export class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.radius = BALL_RADIUS;
    this.reset();
  }

  reset() {
    this.stuck = true;
    const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
    this.dx = BALL_SPEED * Math.cos(angle);
    this.dy = BALL_SPEED * Math.sin(angle);
  }

  launch() {
    this.stuck = false;
  }

  update(paddle, dt = 1, speedMultiplier = 1) {
    if (this.stuck) {
      this.x = paddle.x + paddle.width / 2;
      this.y = paddle.y - this.radius;
      return;
    }

    this.x += this.dx * dt * speedMultiplier;
    this.y += this.dy * dt * speedMultiplier;

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx *= -1;
    } else if (this.x + this.radius > this.canvasWidth) {
      this.x = this.canvasWidth - this.radius;
      this.dx *= -1;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy *= -1;
    }
  }

  isBelowScreen() {
    return this.y - this.radius > this.canvasHeight;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffb703";
    ctx.fill();
    ctx.closePath();
  }
}
