import React, { useEffect } from "react";
import confetti from "canvas-confetti";

export default function GameResult({ scores, restartGame }) {
  const isPlayerWinner = scores.black > scores.white;
  const resultTitle = isPlayerWinner
    ? "あなたの勝ち！"
    : scores.white > scores.black
      ? "CPUの勝ち"
      : "引き分け";

  useEffect(() => {
    if (isPlayerWinner) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isPlayerWinner]);

  return (
    <section className="result" aria-live="assertive">
      <p className="result-label">GAME OVER</p>
      <h2>{resultTitle}</h2>
      <p>{`黒 ${scores.black} 対 白 ${scores.white}`}</p>
      <button
        className="restart-button result-button"
        type="button"
        onClick={restartGame}
      >
        もう一度遊ぶ
      </button>
    </section>
  );
}
