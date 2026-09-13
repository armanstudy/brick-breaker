const STORAGE_KEY = "brickBreakerHighScore";

export function getHighScore() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function setHighScoreIfBetter(score) {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEY, String(score));
      return true;
    }
  } catch {
    // localStorage غیرقابل دسترس است (مثلاً حالت خصوصی مرورگر)
  }
  return false;
}
