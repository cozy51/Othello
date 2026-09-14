import React from "react";

export default function GameResult({ scores, restartGame }) {
  const resultTitle =
    scores.black > scores.white
      ? "あなたの勝ち！"
      : scores.white > scores.black
        ? "CPUの勝ち"
        : "引き分け";

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
