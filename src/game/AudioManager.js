export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ensureContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  _tone({ frequency = 440, duration = 0.1, type = "sine", volume = 0.2, slideTo = null } = {}) {
    if (this.muted) return;
    this._ensureContext();

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  paddleHit() {
    this._tone({ frequency: 220, duration: 0.08, type: "square" });
  }

  brickHit() {
    this._tone({ frequency: 440, duration: 0.06, type: "square" });
  }

  brickBreak() {
    this._tone({ frequency: 660, duration: 0.12, type: "square", slideTo: 220 });
  }

  brickClank() {
    this._tone({ frequency: 150, duration: 0.08, type: "square", volume: 0.15 });
  }

  powerUp() {
    this._tone({ frequency: 523.25, duration: 0.15, type: "sine", slideTo: 1046.5 });
  }

  loseLife() {
    this._tone({ frequency: 200, duration: 0.3, type: "sawtooth", slideTo: 60 });
  }

  gameOver() {
    this._tone({ frequency: 300, duration: 0.5, type: "sawtooth", slideTo: 50 });
  }

  win() {
    this._tone({ frequency: 523.25, duration: 0.4, type: "sine", slideTo: 1046.5 });
  }

  levelComplete() {
    this._tone({ frequency: 392, duration: 0.25, type: "sine", slideTo: 784 });
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
