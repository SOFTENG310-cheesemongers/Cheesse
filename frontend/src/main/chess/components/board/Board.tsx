/* This component renders the chessboard and its squares. */

// ---------------- Imports ---------------- //
import "./Board.css";
import Square from "./Square";
import { FILES, RANKS, type SquareId } from "./BoardConfig";
import { useMovePiece } from "../board/hooks/useMovePiece";
import { GameStatus } from "../status/GameStatus";

// ---------------- Board Component ---------------- //

/**
 * Board component - renders the chessboard and handles piece movement.
 * @returns {JSX.Element}
 */

export default function Board({ flipped = false, onCheckmate }: {
  flipped?: boolean;
  onCheckmate?: (losingPlayer: 'White' | 'Black') => void;
}) {
  const { pieces, movePiece, boardArray } = useMovePiece();

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  // Render the board
  return (
    <div className="wrapper">
      <GameStatus board={boardArray} onCheckmate={onCheckmate} />
      <div className="board-wrapper">
        <div className="board">
          {/* Render the squares */}
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const squareId = `${file}${rank}` as SquareId;
              const piece = pieces[squareId];
              const isDark = (rIdx + fIdx) % 2 === 1;
              return (
                <Square
                  key={squareId}
                  id={squareId}
                  isDark={isDark}
                  piece={piece}
                  movePiece={movePiece}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
