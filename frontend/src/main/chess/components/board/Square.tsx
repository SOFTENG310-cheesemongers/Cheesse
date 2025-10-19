/* This component represents a square on the chessboard. */

// ---------------- Imports ---------------- //
import { useDrop } from "react-dnd";
import Piece, { ItemTypes } from "./Piece";
import { type PieceName, type SquareId, pieceMap } from "./BoardConfig";

/**
 * Props for the Square component.
 *
 * @param id - The square ID (e.g., "e4").
 * @param isDark - Whether the square is dark colored.
 * @param piece - The current piece on the square, if any (else marked as undefined).
 * @param movePiece - Function to move a piece from one square to another.
 */ 
interface SquareProps {
  readonly id: SquareId;
  readonly isDark: boolean;
  readonly piece?: PieceName;
  readonly movePiece: (from: SquareId, to: SquareId) => void;
  readonly isSelected?: boolean;
  readonly onClick: () => void;
}

/**
 * Square component - represents a single square on the chessboard.
 * Handles drag-and-drop and displays a piece if present.
 *
 * @param {SquareProps} props - The props for the square.
 * @returns {JSX.Element} - The rendered square component.
 */
export default function Square({ id, isDark, piece, isSelected, onClick }: Readonly<SquareProps>) {

  // Render the square
  return (
    <div
      className={`square ${isDark ? "dark" : "light"} ${isSelected ? "selected" : ""}`}
      aria-label={`square ${id}`}
      onClick={onClick}
    >
      {piece && <Piece id={id} src={pieceMap[piece]} />}
      {isSelected && <div className="selection-highlight" />}
    </div>
  );
}
