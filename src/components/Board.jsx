import React from "react";
import { EMPTY, BLACK } from "../gameLogic";

export default function Board({ board, currentPlayer, cpuThinking, legalMoveKeys, handlePlayerMove }) {
  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="8×8のオセロ盤">
        {board.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const coordinate = `${rowIndex + 1}行${columnIndex + 1}列`;
            const isLegal =
              currentPlayer === BLACK &&
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
  );
}
