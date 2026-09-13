export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2;
    this.size = 2 + Math.random() * 2;
    this.color = color;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.02;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.15 * dt;
    this.life -= this.decay * dt;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    if (this.isDead()) return;
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update(dt) {
    this.particles.forEach((p) => p.update(dt));
    this.particles = this.particles.filter((p) => !p.isDead());
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }
}
