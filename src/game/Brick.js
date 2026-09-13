export class Brick {
  constructor(x, y, width, height, { hits, unbreakable = false, colors }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHits = hits;
    this.hits = hits;
    this.unbreakable = unbreakable;
    this.colors = colors;
    this.destroyed = false;
  }

  hit() {
    if (this.unbreakable) return false;
    this.hits -= 1;
    if (this.hits <= 0) {
      this.destroyed = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (this.destroyed) return;

    const colorIndex = this.unbreakable ? 0 : this.maxHits - this.hits;
    ctx.fillStyle = this.colors[Math.min(colorIndex, this.colors.length - 1)];
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    if (this.unbreakable) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      const r = 2.5;
      ctx.beginPath();
      ctx.arc(this.x + 6, this.y + 6, r, 0, Math.PI * 2);
      ctx.arc(this.x + this.width - 6, this.y + 6, r, 0, Math.PI * 2);
      ctx.arc(this.x + 6, this.y + this.height - 6, r, 0, Math.PI * 2);
      ctx.arc(this.x + this.width - 6, this.y + this.height - 6, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
