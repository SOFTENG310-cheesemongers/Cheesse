/* This component renders the chessboard and its squares. */

// ---------------- Imports ---------------- //
import "./Board.css";
import Square from "./Square";
import { FILES, RANKS, type SquareId } from "./BoardConfig";
import { useMovePiece } from "../board/hooks/useMovePiece";

// ---------------- Board Component ---------------- //

/**
 * Board component - renders the chessboard and handles piece movement.
 * @returns {JSX.Element}
 */
export default function Board() {
  const { pieces, movePiece } = useMovePiece();

  // Render the board
  return (
    <div className="wrapper">
      <div className="board-wrapper">
        <div className="board">
          {/* Render the squares */}
          {RANKS.map((rank, rIdx) =>
            FILES.map((file, fIdx) => {
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
