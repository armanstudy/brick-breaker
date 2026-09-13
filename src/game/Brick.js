export class Brick {
  constructor(x, y, width, height, { hits, unbreakable = false, colors }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHits = hits;
    this.hits = hits;
    this.unbreakable = unbreakable;
    this.colors = colors; // آرایه‌ای از جفت [رنگ بالا, رنگ پایین] برای هر مرحله آسیب
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

  getCurrentColors() {
    const colorIndex = this.unbreakable ? 0 : this.maxHits - this.hits;
    return this.colors[Math.min(colorIndex, this.colors.length - 1)];
  }

  draw(ctx) {
    if (this.destroyed) return;

    const [topColor, bottomColor] = this.getCurrentColors();
    const radius = Math.min(5, this.height / 3);

    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // جلوه براق: نوار روشن نیمه‌شفاف در بالای آجر
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height * 0.4);
    ctx.restore();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    if (this.unbreakable) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
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
