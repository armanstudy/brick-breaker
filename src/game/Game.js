import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_LIVES,
  SCORE_PER_BRICK,
  SCORE_PER_HIT,
  POWERUP_SIZE,
  POWERUP_CHANCE,
  POWERUP_DURATION_MS,
  POWERUP_TYPES,
  MAX_BALLS,
} from "./constants.js";
import { Paddle } from "./Paddle.js";
import { Ball } from "./Ball.js";
import { createBricksForLevel, TOTAL_LEVELS } from "./Level.js";
import { InputHandler } from "./InputHandler.js";
import { CollisionManager } from "./CollisionManager.js";
import { PowerUp } from "./PowerUp.js";
import { ParticleSystem } from "./Particle.js";
import { AudioManager } from "./AudioManager.js";
import { getHighScore, setHighScoreIfBetter } from "./HighScore.js";

const STATE = {
  MENU: "menu",
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  LEVEL_COMPLETE: "levelcomplete",
  GAME_OVER: "gameover",
  WIN: "win",
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.setupCanvasResolution(canvas);

    this.paddle = new Paddle(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.highScore = getHighScore();

    this.currentLevel = 0;
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.state = STATE.MENU;
    this.newHighScore = false;
    this.ballSpeedMultiplier = 1;
    this.effectTimers = { widepaddle: 0, slowball: 0 };
    this.shakeMagnitude = 0;
    this.shakeTime = 0;
    this.lastTimestamp = null;

    this.bricks = createBricksForLevel(this.currentLevel, CANVAS_WIDTH);
    this.balls = [new Ball(CANVAS_WIDTH, CANVAS_HEIGHT)];
    this.powerUps = [];

    this.input = new InputHandler(canvas, this.paddle, {
      onLaunch: () => this.handleLaunchInput(),
      onPauseToggle: () => this.togglePause(),
      onMuteToggle: () => this.toggleMute(),
    });

    this.pauseButton = document.getElementById("pauseButton");
    if (this.pauseButton) {
      this.pauseButton.addEventListener("click", () => this.togglePause());
    }

    this.muteButton = document.getElementById("muteButton");
    if (this.muteButton) {
      this.muteButton.addEventListener("click", () => this.toggleMute());
    }

    this.hudScale = 1;
    this.updateHudScale();
    window.addEventListener("resize", () => this.updateHudScale());
    window.addEventListener("orientationchange", () => this.updateHudScale());

    this.loop = this.loop.bind(this);
  }

  setupCanvasResolution(canvas) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    this.ctx.scale(dpr, dpr);
  }

  // وقتی canvas روی موبایل/تبلت کوچک‌تر از اندازه منطقی‌اش نمایش داده می‌شود،
  // این ضریب باعث می‌شود متن HUD به همان اندازه فیزیکی (نه نسبی) خوانا بماند.
  updateHudScale() {
    const displayWidth = this.canvas.getBoundingClientRect().width;
    if (displayWidth > 0) {
      this.hudScale = Math.min(CANVAS_WIDTH / displayWidth, 2.5);
    }
  }

  handleLaunchInput() {
    if (this.state === STATE.MENU || this.state === STATE.READY) {
      this.state = STATE.PLAYING;
      this.balls[0].launch();
    } else if (this.state === STATE.LEVEL_COMPLETE) {
      this.loadLevel(this.currentLevel + 1);
    } else if (this.state === STATE.GAME_OVER || this.state === STATE.WIN) {
      this.restart();
    }
  }

  togglePause() {
    if (this.state === STATE.PLAYING) this.state = STATE.PAUSED;
    else if (this.state === STATE.PAUSED) this.state = STATE.PLAYING;
    this.updatePauseButtonLabel();
  }

  toggleMute() {
    const muted = this.audio.toggleMute();
    if (this.muteButton) {
      this.muteButton.textContent = muted ? "🔇 صدا" : "🔊 صدا";
    }
  }

  updatePauseButtonLabel() {
    if (!this.pauseButton) return;
    this.pauseButton.textContent = this.state === STATE.PAUSED ? "▶ ادامه" : "⏸ توقف";
  }

  resetAttempt() {
    this.paddle.reset();
    this.balls = [new Ball(CANVAS_WIDTH, CANVAS_HEIGHT)];
    this.powerUps = [];
    this.ballSpeedMultiplier = 1;
    this.effectTimers = { widepaddle: 0, slowball: 0 };
  }

  loadLevel(index) {
    if (index >= TOTAL_LEVELS) {
      this.state = STATE.WIN;
      this.audio.win();
      this.newHighScore = setHighScoreIfBetter(this.score);
      if (this.newHighScore) this.highScore = this.score;
      return;
    }

    this.currentLevel = index;
    this.bricks = createBricksForLevel(this.currentLevel, CANVAS_WIDTH);
    this.resetAttempt();
    this.state = STATE.READY;
  }

  restart() {
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.newHighScore = false;
    this.currentLevel = 0;
    this.bricks = createBricksForLevel(this.currentLevel, CANVAS_WIDTH);
    this.resetAttempt();
    this.state = STATE.READY;
  }

  loseLife() {
    this.lives -= 1;
    this.audio.loseLife();
    this.triggerShake(8, 300);

    if (this.lives <= 0) {
      this.state = STATE.GAME_OVER;
      this.audio.gameOver();
      this.newHighScore = setHighScoreIfBetter(this.score);
      if (this.newHighScore) this.highScore = this.score;
    } else {
      this.resetAttempt();
      this.state = STATE.READY;
    }
  }

  triggerShake(magnitude, durationMs) {
    this.shakeMagnitude = magnitude;
    this.shakeTime = durationMs;
  }

  maybeSpawnPowerUp(brick) {
    if (Math.random() >= POWERUP_CHANCE) return;
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    this.powerUps.push(
      new PowerUp(brick.x + brick.width / 2 - POWERUP_SIZE / 2, brick.y, type)
    );
  }

  applyPowerUp(type) {
    switch (type) {
      case "extralife":
        this.lives += 1;
        break;
      case "widepaddle":
        this.paddle.setWide(true);
        this.effectTimers.widepaddle = POWERUP_DURATION_MS;
        break;
      case "slowball":
        this.ballSpeedMultiplier = 0.6;
        this.effectTimers.slowball = POWERUP_DURATION_MS;
        break;
      case "multiball":
        this.spawnExtraBalls();
        break;
    }
  }

  spawnExtraBalls() {
    const base = this.balls.find((b) => !b.stuck) || this.balls[0];
    if (!base) return;

    const extraCount = Math.min(2, MAX_BALLS - this.balls.length);
    const speed = Math.hypot(base.dx, base.dy);
    const baseAngle = Math.atan2(base.dy, base.dx);

    for (let i = 0; i < extraCount; i++) {
      const offset = i === 0 ? -0.4 : 0.4;
      const clone = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT);
      clone.stuck = false;
      clone.x = base.x;
      clone.y = base.y;
      clone.dx = speed * Math.cos(baseAngle + offset);
      clone.dy = speed * Math.sin(baseAngle + offset);
      this.balls.push(clone);
    }
  }

  updateEffectTimers(deltaMs) {
    if (this.effectTimers.widepaddle > 0) {
      this.effectTimers.widepaddle -= deltaMs;
      if (this.effectTimers.widepaddle <= 0) {
        this.effectTimers.widepaddle = 0;
        this.paddle.setWide(false);
      }
    }
    if (this.effectTimers.slowball > 0) {
      this.effectTimers.slowball -= deltaMs;
      if (this.effectTimers.slowball <= 0) {
        this.effectTimers.slowball = 0;
        this.ballSpeedMultiplier = 1;
      }
    }
  }

  update(dt, deltaMs) {
    if (this.state === STATE.PAUSED) return;

    this.paddle.update(dt);
    this.balls.forEach((ball) => ball.update(this.paddle, dt, this.ballSpeedMultiplier));
    this.particles.update(dt);
    this.powerUps.forEach((p) => p.update(dt));

    if (this.shakeTime > 0) {
      this.shakeTime -= deltaMs;
      if (this.shakeTime < 0) this.shakeTime = 0;
    }

    if (this.state !== STATE.PLAYING) return;

    this.updateEffectTimers(deltaMs);

    this.balls.forEach((ball) => {
      if (CollisionManager.ballPaddle(ball, this.paddle)) {
        this.audio.paddleHit();
      }

      const result = CollisionManager.ballBricks(ball, this.bricks);
      if (result) {
        const { brick, destroyed } = result;
        const [particleColor] = brick.getCurrentColors();
        this.particles.burst(brick.x + brick.width / 2, brick.y + brick.height / 2, particleColor, 10);

        if (brick.unbreakable) {
          this.audio.brickClank();
        } else if (destroyed) {
          this.score += SCORE_PER_BRICK;
          this.audio.brickBreak();
          this.maybeSpawnPowerUp(brick);
        } else {
          this.score += SCORE_PER_HIT;
          this.audio.brickHit();
        }
      }
    });

    this.balls = this.balls.filter((ball) => !ball.isBelowScreen());
    if (this.balls.length === 0) {
      this.loseLife();
      return;
    }

    this.powerUps = this.powerUps.filter((powerUp) => {
      if (powerUp.collidesWithPaddle(this.paddle)) {
        this.applyPowerUp(powerUp.type);
        this.audio.powerUp();
        return false;
      }
      return !powerUp.isBelowScreen(CANVAS_HEIGHT);
    });

    const allCleared = this.bricks.every((brick) => brick.destroyed || brick.unbreakable);
    if (allCleared) {
      if (this.currentLevel + 1 >= TOTAL_LEVELS) {
        this.state = STATE.WIN;
        this.audio.win();
        this.newHighScore = setHighScoreIfBetter(this.score);
        if (this.newHighScore) this.highScore = this.score;
      } else {
        this.state = STATE.LEVEL_COMPLETE;
        this.audio.levelComplete();
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    if (this.shakeTime > 0) {
      const m = this.shakeMagnitude;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }

    this.bricks.forEach((brick) => brick.draw(ctx));
    this.powerUps.forEach((p) => p.draw(ctx));
    this.particles.draw(ctx);
    this.paddle.draw(ctx);
    this.balls.forEach((ball) => ball.draw(ctx));

    ctx.restore();

    this.drawHud(ctx);
    this.drawStateOverlay(ctx);
  }

  drawHud(ctx) {
    const s = this.hudScale;
    ctx.fillStyle = "#f1faee";
    ctx.font = `${18 * s}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(`امتیاز: ${this.score}`, 20, 30);

    ctx.textAlign = "right";
    ctx.fillText(`جان: ${this.lives}`, CANVAS_WIDTH - 20, 30);

    ctx.textAlign = "center";
    ctx.font = `${14 * s}px sans-serif`;
    ctx.fillText(`مرحله ${this.currentLevel + 1} از ${TOTAL_LEVELS}`, CANVAS_WIDTH / 2, 26);

    const effects = [];
    if (this.effectTimers.widepaddle > 0) {
      effects.push(`پدال بزرگ: ${Math.ceil(this.effectTimers.widepaddle / 1000)}s`);
    }
    if (this.effectTimers.slowball > 0) {
      effects.push(`توپ کند: ${Math.ceil(this.effectTimers.slowball / 1000)}s`);
    }
    if (effects.length > 0) {
      ctx.fillStyle = "#ffd166";
      ctx.font = `${13 * s}px sans-serif`;
      ctx.fillText(effects.join("   |   "), CANVAS_WIDTH / 2, 46);
    }
  }

  drawStateOverlay(ctx) {
    const lines = this.getOverlayLines();
    if (!lines) return;

    const s = this.hudScale;
    const lineHeight = 30 * s;
    const padding = 20 * s;
    const boxHeight = lines.length * lineHeight + padding * 2;
    const boxY = CANVAS_HEIGHT / 2 - boxHeight / 2;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, boxY, CANVAS_WIDTH, boxHeight);

    ctx.textAlign = "center";
    const maxTextWidth = CANVAS_WIDTH - 40;
    lines.forEach((line, i) => {
      let fontSize = (line.size || 20) * s;
      const fontWeight = line.bold ? "bold " : "";
      ctx.font = `${fontWeight}${fontSize}px sans-serif`;

      // اگر متن (مثلاً راهنمای کنترل‌ها در حالت موبایل) از عرض canvas بزرگ‌تر شد، کوچکش کن
      const width = ctx.measureText(line.text).width;
      if (width > maxTextWidth) {
        fontSize *= maxTextWidth / width;
        ctx.font = `${fontWeight}${fontSize}px sans-serif`;
      }

      ctx.fillStyle = line.color || "#ffffff";
      ctx.fillText(line.text, CANVAS_WIDTH / 2, boxY + padding + i * lineHeight + lineHeight / 2 + 6 * s);
    });
    ctx.restore();
  }

  getOverlayLines() {
    switch (this.state) {
      case STATE.MENU:
        return [
          { text: "آجرشکن", size: 30, bold: true, color: "#ffd166" },
          { text: "برای شروع کلیک کنید یا Space را بزنید", size: 18 },
          { text: "حرکت: کلیدهای چپ/راست یا موس  |  پرتاب: کلیک/Space  |  مکث: P  |  بی‌صدا: M", size: 13 },
          { text: `بهترین امتیاز: ${this.highScore}`, size: 15, color: "#f1faee" },
        ];
      case STATE.READY:
        return [{ text: "برای پرتاب توپ کلیک کنید یا Space را بزنید", size: 20 }];
      case STATE.PAUSED:
        return [{ text: "مکث شده - برای ادامه P را بزنید", size: 20 }];
      case STATE.LEVEL_COMPLETE:
        return [
          { text: `مرحله ${this.currentLevel + 1} تمام شد!`, size: 24, bold: true, color: "#ffd166" },
          { text: "برای ادامه کلیک کنید یا Space را بزنید", size: 16 },
        ];
      case STATE.GAME_OVER:
        return [
          { text: "باختی!", size: 26, bold: true, color: "#e63946" },
          { text: `امتیاز نهایی: ${this.score}`, size: 18 },
          {
            text: this.newHighScore ? "رکورد جدید! 🎉" : `بهترین امتیاز: ${this.highScore}`,
            size: 15,
            color: "#ffd166",
          },
          { text: "برای شروع دوباره کلیک کنید", size: 15 },
        ];
      case STATE.WIN:
        return [
          { text: "تبریک! همه مراحل را بردی 🏆", size: 24, bold: true, color: "#ffd166" },
          { text: `امتیاز نهایی: ${this.score}`, size: 18 },
          {
            text: this.newHighScore ? "رکورد جدید! 🎉" : `بهترین امتیاز: ${this.highScore}`,
            size: 15,
            color: "#ffd166",
          },
          { text: "برای بازی دوباره کلیک کنید", size: 15 },
        ];
      default:
        return null;
    }
  }

  loop(timestamp) {
    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    const deltaMs = Math.min(timestamp - this.lastTimestamp, 100);
    this.lastTimestamp = timestamp;
    const dt = Math.min(deltaMs / (1000 / 60), 3);

    this.update(dt, deltaMs);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  start() {
    requestAnimationFrame(this.loop);
  }
}
