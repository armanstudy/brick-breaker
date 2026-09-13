import { POWERUP_SIZE, POWERUP_FALL_SPEED } from "./constants.js";

const STYLES = {
  multiball: { color: "#9d4edd", label: "M" },
  widepaddle: { color: "#457b9d", label: "W" },
  slowball: { color: "#2a9d8f", label: "S" },
  extralife: { color: "#e63946", label: "+1" },
};

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = POWERUP_SIZE;
    this.type = type;
    this.dy = POWERUP_FALL_SPEED;
  }

  update(dt) {
    this.y += this.dy * dt;
  }

  isBelowScreen(canvasHeight) {
    return this.y > canvasHeight;
  }

  collidesWithPaddle(paddle) {
    return (
      this.x + this.size > paddle.x &&
      this.x < paddle.x + paddle.width &&
      this.y + this.size > paddle.y &&
      this.y < paddle.y + paddle.height
    );
  }

  draw(ctx) {
    const style = STYLES[this.type];
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.size, this.size, 6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.label, this.x + this.size / 2, this.y + this.size / 2 + 1);
    ctx.textBaseline = "alphabetic";
  }
}
