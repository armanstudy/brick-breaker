import { CANVAS_WIDTH } from "./constants.js";

const LEFT_KEYS = ["ArrowLeft", "a", "A"];
const RIGHT_KEYS = ["ArrowRight", "d", "D"];

export class InputHandler {
  constructor(canvas, paddle, callbacks = {}) {
    this.canvas = canvas;
    this.paddle = paddle;
    this.onLaunch = callbacks.onLaunch || (() => {});
    this.onPauseToggle = callbacks.onPauseToggle || (() => {});
    this.onMuteToggle = callbacks.onMuteToggle || (() => {});

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("click", () => this.onLaunch());
    canvas.addEventListener("touchstart", () => this.onLaunch());
    canvas.addEventListener("touchmove", this.handleTouchMove, { passive: true });
  }

  // مختصات نمایشی canvas (بعد از مقیاس‌دهی ریسپانسیو با CSS) را به فضای منطقی بازی تبدیل می‌کند
  toLogicalX(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    return (clientX - rect.left) * scaleX;
  }

  handleKeyDown(e) {
    if (LEFT_KEYS.includes(e.key)) this.paddle.setMovingLeft(true);
    if (RIGHT_KEYS.includes(e.key)) this.paddle.setMovingRight(true);
    if (e.key === " ") this.onLaunch();
    if (e.key === "p" || e.key === "P") this.onPauseToggle();
    if (e.key === "m" || e.key === "M") this.onMuteToggle();
  }

  handleKeyUp(e) {
    if (LEFT_KEYS.includes(e.key)) this.paddle.setMovingLeft(false);
    if (RIGHT_KEYS.includes(e.key)) this.paddle.setMovingRight(false);
  }

  handleMouseMove(e) {
    this.paddle.setPositionByX(this.toLogicalX(e.clientX));
  }

  handleTouchMove(e) {
    const touch = e.touches[0];
    this.paddle.setPositionByX(this.toLogicalX(touch.clientX));
  }
}
