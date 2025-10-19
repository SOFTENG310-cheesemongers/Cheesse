/* This component represents a square on the chessboard. */

// ---------------- Imports ---------------- //
import Piece from "./Piece";
import { type PieceName, type SquareId, pieceMap } from "./BoardConfig";
import { useRef } from "react";

/**
 * Props for the Square component.
 *
 * @param id - The square ID (e.g., "e4").
 * @param isDark - Whether the square is dark colored.
 * @param piece - The current piece on the square, if any (else marked as undefined).
 * @param movePiece - Function to move a piece from one square to another.
 * @param isSelected - Indicates if the square is currently selected.
 * @param isValidMove - Indicates if the square is a valid move destination, to be taken.
 * @param canDrag - Indicates if the piece on this square can be dragged (your turn).
 * @param onClick - Handler for when the square is clicked.
 * @param onDragStart - Handler for when a drag operation starts on this square.
 * @param onDragOver - Handler for when a dragged item is over this square.
 * @param onDrop - Handler for when a dragged item is dropped on this square.
 */
interface SquareProps {
  readonly id: SquareId;
  readonly isDark: boolean;
  readonly piece?: PieceName;
  readonly movePiece: (from: SquareId, to: SquareId) => void;
  readonly isSelected?: boolean;
  readonly isValidMove?: boolean;
  readonly canDrag?: boolean;
  readonly onClick: () => void;
  readonly onDragStart: () => void;
  readonly onDragOver: (e: React.DragEvent) => void;
  readonly onDrop: () => void;
}

/**
 * Square component - represents a single square on the chessboard.
 * Handles drag-and-drop and displays a piece if present.
 *
 * @param {SquareProps} props - The props for the square.
 * @returns {JSX.Element} - The rendered square component.
 */
export default function Square({ 
  id,
  isDark,
  piece,
  isSelected,
  isValidMove,
  canDrag,
  onClick,
  onDragStart,
  onDragOver,
  onDrop
}: Readonly<SquareProps>) {

  // Makes it so that the image of piece is used when dragging
  const pieceRef = useRef<HTMLImageElement>(null);
  const handleDragStart = (e: React.DragEvent) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }

    // Set custom drag image to just the piece
    if (pieceRef.current && piece) {
      const img = pieceRef.current;
      // Center the drag image on the cursor
      const rect = img.getBoundingClientRect();
      e.dataTransfer.setDragImage(img, rect.width / 2, rect.height / 2);
    }
    onDragStart();
  };


  // Render the square
  return (
    <div
      className={`square ${isDark ? "dark" : "light"} ${isSelected ? "selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`square ${id}${piece ? ` with ${piece.replace('_', ' ')}` : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {piece && <Piece id={id} src={pieceMap[piece]} ref={pieceRef} />}
      {isSelected && <div className="selection-highlight" />}
      {isValidMove && <div className={`valid-move-indicator ${piece ? "capture" : ""}`} />}
    </div>
  );
}
