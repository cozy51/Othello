import { useEffect, useMemo, useState } from "react";
import {
  BLACK,
  WHITE,
  CPU_DELAY,
  createInitialGame,
  getValidMoves,
  placeDisc,
  countDiscs,
  getCpuMove,
  computeNextState,
} from "./gameLogic";
import ScoreBoard from "./components/ScoreBoard";
import Board from "./components/Board";
import GameResult from "./components/GameResult";

function App() {
  const [game, setGame] = useState(createInitialGame);
  const validMoves = useMemo(
    () => (game.gameOver ? [] : getValidMoves(game.board, game.currentPlayer)),
    [game.board, game.currentPlayer, game.gameOver],
  );
  const scores = useMemo(() => countDiscs(game.board), [game.board]);
  const cpuThinking = !game.gameOver && game.currentPlayer === WHITE && validMoves.length > 0;
  const legalMoveKeys = useMemo(
    () => new Set(validMoves.map((move) => `${move.row},${move.column}`)),
    [validMoves],
  );

  useEffect(() => {
    if (game.gameOver) return undefined;

    if (validMoves.length === 0) {
      setGame((current) => computeNextState(current, validMoves.length));
      return undefined;
    }

    if (game.currentPlayer !== WHITE) return undefined;

    const timerId = window.setTimeout(() => {
      const move = getCpuMove(validMoves);
      setGame((current) => {
        const nextBoard = placeDisc(current.board, move, WHITE);
        const tempState = {
          ...current,
          board: nextBoard,
          currentPlayer: BLACK,
          message: "あなたの手番です。",
        };
        const nextPlayerMoves = getValidMoves(tempState.board, BLACK);
        return computeNextState(tempState, nextPlayerMoves.length);
      });
    }, CPU_DELAY);

    return () => window.clearTimeout(timerId);
  }, [game.board, game.currentPlayer, game.gameOver, validMoves]);

  function handlePlayerMove(row, column) {
    if (game.gameOver || cpuThinking || game.currentPlayer !== BLACK) return;

    const move = validMoves.find(
      (candidate) => candidate.row === row && candidate.column === column,
    );
    if (!move) return;

    setGame((current) => {
      const nextBoard = placeDisc(current.board, move, BLACK);
      const tempState = {
        ...current,
        board: nextBoard,
        currentPlayer: WHITE,
        message: "CPUが考えています…",
      };
      const cpuMoves = getValidMoves(tempState.board, WHITE);
      return computeNextState(tempState, cpuMoves.length);
    });
  }

  function restartGame() {
    setGame(createInitialGame());
  }

  return (
    <main className="game">
      <header className="game-header">
        <div>
          <p className="eyebrow">PLAYER VS CPU</p>
          <h1>オセロ</h1>
        </div>
        <button className="restart-button" type="button" onClick={restartGame}>
          もう一度遊ぶ
        </button>
      </header>

      <ScoreBoard scores={scores} currentPlayer={game.currentPlayer} gameOver={game.gameOver} />

      <p className="message" aria-live="polite">
        {game.message}
      </p>

      <Board
        board={game.board}
        currentPlayer={game.currentPlayer}
        cpuThinking={cpuThinking}
        legalMoveKeys={legalMoveKeys}
        handlePlayerMove={handlePlayerMove}
      />

      {game.gameOver && <GameResult scores={scores} restartGame={restartGame} />}
    </main>
  );
}

export default App;
