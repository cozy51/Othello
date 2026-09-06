import { useEffect, useMemo, useState } from "react";

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const SIZE = 8;
const CPU_DELAY = 650;
const INITIAL_MESSAGE = "緑の印がある場所に石を置いてください。";
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function createInitialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

function createInitialGame() {
  return {
    board: createInitialBoard(),
    currentPlayer: BLACK,
    gameOver: false,
    message: INITIAL_MESSAGE,
  };
}

function isInside(row, column) {
  return row >= 0 && row < SIZE && column >= 0 && column < SIZE;
}

function getFlips(board, row, column, player) {
  if (board[row][column] !== EMPTY) return [];

  const opponent = player === BLACK ? WHITE : BLACK;
  const flips = [];

  for (const [rowStep, columnStep] of DIRECTIONS) {
    const line = [];
    let nextRow = row + rowStep;
    let nextColumn = column + columnStep;

    while (isInside(nextRow, nextColumn) && board[nextRow][nextColumn] === opponent) {
      line.push([nextRow, nextColumn]);
      nextRow += rowStep;
      nextColumn += columnStep;
    }

    if (
      line.length > 0 &&
      isInside(nextRow, nextColumn) &&
      board[nextRow][nextColumn] === player
    ) {
      flips.push(...line);
    }
  }

  return flips;
}

function getValidMoves(board, player) {
  const moves = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const flips = getFlips(board, row, column, player);
      if (flips.length > 0) moves.push({ row, column, flips });
    }
  }

  return moves;
}

function placeDisc(board, move, player) {
  const nextBoard = board.map((row) => [...row]);
  nextBoard[move.row][move.column] = player;

  for (const [row, column] of move.flips) {
    nextBoard[row][column] = player;
  }

  return nextBoard;
}

function countDiscs(board) {
  let black = 0;
  let white = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === BLACK) black += 1;
      if (cell === WHITE) white += 1;
    }
  }

  return { black, white };
}

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
      const nextPlayer = game.currentPlayer === BLACK ? WHITE : BLACK;
      const nextMoves = getValidMoves(game.board, nextPlayer);

      if (nextMoves.length === 0) {
        setGame((current) => ({
          ...current,
          gameOver: true,
          message: "両者とも石を置ける場所がないため、ゲーム終了です。",
        }));
      } else {
        setGame((current) => ({
          ...current,
          currentPlayer: nextPlayer,
          message:
            current.currentPlayer === BLACK
              ? "あなたは置ける場所がないため、CPUの手番です。"
              : "CPUは置ける場所がないため、あなたの手番です。",
        }));
      }

      return undefined;
    }

    if (game.currentPlayer !== WHITE) return undefined;

    const timerId = window.setTimeout(() => {
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      setGame((current) => ({
        ...current,
        board: placeDisc(current.board, move, WHITE),
        currentPlayer: BLACK,
        message: "あなたの手番です。",
      }));
    }, CPU_DELAY);

    return () => window.clearTimeout(timerId);
  }, [game.board, game.currentPlayer, game.gameOver, validMoves]);

  function handlePlayerMove(row, column) {
    if (game.gameOver || cpuThinking || game.currentPlayer !== BLACK) return;

    const move = validMoves.find(
      (candidate) => candidate.row === row && candidate.column === column,
    );
    if (!move) return;

    setGame((current) => ({
      ...current,
      board: placeDisc(current.board, move, BLACK),
      currentPlayer: WHITE,
      message: "CPUが考えています…",
    }));
  }

  function restartGame() {
    setGame(createInitialGame());
  }

  const turnText = game.gameOver
    ? "ゲーム終了"
    : game.currentPlayer === BLACK
      ? "あなた（黒）"
      : "CPU（白）";
  const resultTitle =
    scores.black > scores.white
      ? "あなたの勝ち！"
      : scores.white > scores.black
        ? "CPUの勝ち"
        : "引き分け";

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

      <p className="message" aria-live="polite">
        {game.message}
      </p>

      <div className="board-frame">
        <div className="board" role="grid" aria-label="8×8のオセロ盤">
          {game.board.map((row, rowIndex) =>
            row.map((value, columnIndex) => {
              const coordinate = `${rowIndex + 1}行${columnIndex + 1}列`;
              const isLegal =
                game.currentPlayer === BLACK &&
                !cpuThinking &&
                legalMoveKeys.has(`${rowIndex},${columnIndex}`);
              const colorName = value === BLACK ? "黒" : "白";
              const ariaLabel =
                value !== EMPTY
                  ? `${coordinate}、${colorName}の石`
                  : `${coordinate}${isLegal ? "、石を置けます" : "、空き"}`;

              return (
                <button
                  key={`${rowIndex}-${columnIndex}`}
                  className={`cell${isLegal ? " legal" : ""}`}
                  type="button"
                  role="gridcell"
                  aria-label={ariaLabel}
                  disabled={!isLegal}
                  onClick={() => handlePlayerMove(rowIndex, columnIndex)}
                >
                  {value !== EMPTY && (
                    <span
                      className={`disc ${value === BLACK ? "black" : "white"}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {game.gameOver && (
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
      )}
    </main>
  );
}

export default App;