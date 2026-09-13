import { Brick } from "./Brick.js";
import { LEVELS, BRICK_DEFS, TOTAL_LEVELS } from "./levels.js";
import { BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP, BRICK_OFFSET_LEFT } from "./constants.js";

export { TOTAL_LEVELS };

export function createBricksForLevel(levelIndex, canvasWidth) {
  const level = LEVELS[levelIndex];
  const rows = level.rows;
  const cols = rows[0].length;
  const totalPadding = BRICK_OFFSET_LEFT * 2 + BRICK_PADDING * (cols - 1);
  const brickWidth = (canvasWidth - totalPadding) / cols;

  const bricks = [];
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) return;
      const def = BRICK_DEFS[cell];
      if (!def) return;

      const x = BRICK_OFFSET_LEFT + colIndex * (brickWidth + BRICK_PADDING);
      const y = BRICK_OFFSET_TOP + rowIndex * (BRICK_HEIGHT + BRICK_PADDING);

      bricks.push(
        new Brick(x, y, brickWidth, BRICK_HEIGHT, {
          hits: def.hits,
          unbreakable: !!def.unbreakable,
          colors: def.colors,
        })
      );
    });
  });

  return bricks;
}
