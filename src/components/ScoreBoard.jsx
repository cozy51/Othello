import React from "react";
import { BLACK } from "../gameLogic";

export default function ScoreBoard({ scores, currentPlayer, gameOver }) {
  const turnText = gameOver
    ? "ゲーム終了"
    : currentPlayer === BLACK
      ? "あなた（黒）"
      : "CPU（白）";

  return (
    <section className="game-info" aria-label="ゲーム情報">
      <div className="score">
        <span className="disc disc-small black" aria-hidden="true" />
        <span>あなた（黒）</span>
        <strong>{scores.black}</strong>
      </div>
      <div className="turn-panel" aria-live="polite">
        <span className="turn-label">手番</span>
        <strong>{turnText}</strong>
      </div>
      <div className="score">
        <span className="disc disc-small white" aria-hidden="true" />
        <span>CPU（白）</span>
        <strong>{scores.white}</strong>
      </div>
    </section>
  );
}
