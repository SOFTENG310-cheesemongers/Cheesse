/* This component renders the chessboard and its squares. */

// ---------------- Imports ---------------- //
import "./Board.css";
import Square from "./Square";
import { FILES, RANKS, type PieceName, type SquareId } from "./BoardConfig";
import { useMovePiece } from "../board/hooks/useMovePiece";
import { useState } from "react";
import { calculateValidMoves } from "../../referee/moveCalculator";
import { useChessStore } from "../../../app/chessStore";
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
  const { isWhiteTurn } = useChessStore();
   
  // State to track selected square
  const [selectedSquare, setSelectedSquare] = useState<SquareId | null>(null);

  // State to show valid moves of selected piece
  const [validMoves, setValidMoves] = useState<SquareId[]>([]);

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  // Check if piece color matches current turn
  const isCurrentPlayersPiece = (piece: PieceName | undefined): boolean => {
    if (!piece) return false;
    const pieceColor = piece.endsWith("white") ? "white" : "black";
    return (isWhiteTurn && pieceColor === "white") || (!isWhiteTurn && pieceColor === "black");
  };

  // Clear selection state
  const clearSelection = () => {
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Select a new square
  const selectSquare = (squareId: SquareId) => {
    setSelectedSquare(squareId);
    setValidMoves(calculateValidMoves(squareId, pieces));
  };

  // Handle click when a square is already selected
  const handleClickWithSelection = (squareId: SquareId) => {
    if (selectedSquare === squareId) {
      clearSelection();
    } else if (validMoves.includes(squareId)) {

      if (selectedSquare !== null) {
        movePiece(selectedSquare, squareId);
      }
      
      clearSelection();
    } else if (pieces[squareId] && isCurrentPlayersPiece(pieces[squareId])) {
      selectSquare(squareId);
    } else {
      clearSelection();
    }
  };

  // Handle square click for selection or movement
  const handleSquareClick = (squareId: SquareId) => {
    if (selectedSquare) {
      handleClickWithSelection(squareId);
    } else if (pieces[squareId] && isCurrentPlayersPiece(pieces[squareId])) {
      selectSquare(squareId);
    }
  };

  // Handle drag start
  const handleDragStart = (squareId: SquareId) => {
    if (pieces[squareId] && isCurrentPlayersPiece(pieces[squareId])) {
      selectSquare(squareId);
    }
  };

  // Handle drag over (allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  // Handle drop
  const handleDrop = (squareId: SquareId) => {
    if (selectedSquare && validMoves.includes(squareId)) {
      movePiece(selectedSquare, squareId);
    }
    clearSelection();
  };

  // Render the board
  return (
    <div className="wrapper">
      <GameStatus board={boardArray} onCheckmate={onCheckmate} />
      <div className="board-wrapper">
        <div className="board">
          {/* Render the squares */}
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const squareId = `${file}${rank}`;
              const piece = pieces[squareId as SquareId];
              const isDark = (rIdx + fIdx) % 2 === 1;
              const isSelected = selectedSquare === squareId;
              const isValidMove = validMoves.includes(squareId as SquareId);

              // Sets a piece draggable if it's color's turn
              const canDrag = piece && (
                (isWhiteTurn && piece.endsWith("white")) || 
                (!isWhiteTurn && piece.endsWith("black"))
              );

              return (
                <Square
                  key={squareId}
                  id={squareId as SquareId}
                  isDark={isDark}
                  piece={piece}
                  movePiece={movePiece}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  canDrag={canDrag}
                  onClick={() => handleSquareClick(squareId as SquareId)}
                  onDragStart={() => handleDragStart(squareId as SquareId)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(squareId as SquareId)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
