export class CollisionManager {
  static ballPaddle(ball, paddle) {
    const hits =
      ball.dy > 0 &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height;

    if (!hits) return false;

    const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2); // -1..1
    const angle = hitPos * (Math.PI / 3); // max 60 degrees
    const speed = Math.hypot(ball.dx, ball.dy);

    ball.dx = speed * Math.sin(angle);
    ball.dy = -Math.abs(speed * Math.cos(angle));
    ball.y = paddle.y - ball.radius;

    return true;
  }

  /** @returns {{brick: import("./Brick.js").Brick, destroyed: boolean} | null} */
  static ballBricks(ball, bricks) {
    for (const brick of bricks) {
      if (brick.destroyed) continue;

      const overlaps =
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height;

      if (!overlaps) continue;

      const overlapLeft = ball.x + ball.radius - brick.x;
      const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
      const overlapTop = ball.y + ball.radius - brick.y;
      const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop || minOverlap === overlapBottom) {
        ball.dy *= -1;
      } else {
        ball.dx *= -1;
      }

      const destroyed = brick.hit();
      return { brick, destroyed };
    }

    return null;
  }
}
