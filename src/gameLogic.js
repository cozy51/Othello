export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export const SIZE = 8;
export const CPU_DELAY = 650;
export const INITIAL_MESSAGE = "緑の印がある場所に石を置いてください。";

export const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function createInitialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

export function createInitialGame() {
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

export function getFlips(board, row, column, player) {
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

export function getValidMoves(board, player) {
  const moves = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const flips = getFlips(board, row, column, player);
      if (flips.length > 0) moves.push({ row, column, flips });
    }
  }

  return moves;
}

export function placeDisc(board, move, player) {
  const nextBoard = board.map((row) => [...row]);
  nextBoard[move.row][move.column] = player;

  for (const [row, column] of move.flips) {
    nextBoard[row][column] = player;
  }

  return nextBoard;
}

export function countDiscs(board) {
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

export function getCpuMove(validMoves) {
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export function computeNextState(game, validMovesLength) {
  if (game.gameOver) return game;

  if (validMovesLength === 0) {
    const nextPlayer = game.currentPlayer === BLACK ? WHITE : BLACK;
    const nextMoves = getValidMoves(game.board, nextPlayer);

    if (nextMoves.length === 0) {
      return {
        ...game,
        gameOver: true,
        message: "両者とも石を置ける場所がないため、ゲーム終了です。",
      };
    } else {
      return {
        ...game,
        currentPlayer: nextPlayer,
        message:
          nextPlayer === WHITE
            ? "あなたは置ける場所がないため、CPUの手番です。"
            : "CPUは置ける場所がないため、あなたの手番です。",
      };
    }
  }

  return game;
}
