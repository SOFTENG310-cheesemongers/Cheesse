/* This component renders the chessboard and its squares. */

// ---------------- Imports ---------------- //
import "./Board.css";
import Square from "./Square";
import { FILES, RANKS, type SquareId } from "./BoardConfig";
import { useMovePiece } from "../board/hooks/useMovePiece";
import { useState } from "react";
import { calculateValidMoves } from "../../referee/moveCalculator";
import { useChessStore } from "../../../app/chessStore";

// ---------------- Board Component ---------------- //

/**
 * Board component - renders the chessboard and handles piece movement.
 * @returns {JSX.Element}
 */

export default function Board({ flipped = false }: { flipped?: boolean }) {
  const { pieces, movePiece } = useMovePiece();
  const { isWhiteTurn } = useChessStore();
   
  // State to track selected square
  const [selectedSquare, setSelectedSquare] = useState<SquareId | null>(null);

  // State to show valid moves of selected piece
  const [validMoves, setValidMoves] = useState<SquareId[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  // Handle square click for selection or movement
  const handleSquareClick = (squareId: SquareId) => {
    // If there's already a selected square
    if (selectedSquare) {
      // If it's the same square, deselect it
      if (selectedSquare === squareId) {
        setSelectedSquare(null);
        setValidMoves([]);
      } 

      // If the clicked square is a valid move destination, move the piece
      else if (validMoves.includes(squareId)) {
        // Execute the move (switches turn in movePiece)
        movePiece(selectedSquare, squareId);
        
        // Clear selection
        setSelectedSquare(null);
        setValidMoves([]);
      }

      // If theres another piece of the same colour, select it instead
      else if (pieces[squareId] && pieces[selectedSquare] &&
                pieces[squareId]?.endsWith(pieces[selectedSquare]!.endsWith("white") ? "white" : "black")) {
        setSelectedSquare(squareId);
        setValidMoves(calculateValidMoves(squareId, pieces));
      }
      
      // If theres no piece, deselect
      else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } 

    // If there's no selected square and the clicked square has a piece, select it
    else if (pieces[squareId]) {
      // Only allow selecting piece if piece color is same as turn
      const pieceColor = pieces[squareId]?.endsWith("white") ? "white" : "black";
      const canSelect = (isWhiteTurn && pieceColor === "white") || (!isWhiteTurn && pieceColor === "black");
      
      if (canSelect) {
        setSelectedSquare(squareId);
        setValidMoves(calculateValidMoves(squareId, pieces));
      }
    }
  };

  // Handle drag start
  const handleDragStart = (squareId: SquareId) => {
    if (!pieces[squareId]) return;

    // Only allow dragging piece if piece color is same as turn
    const pieceColor = pieces[squareId]?.endsWith("white") ? "white" : "black";
    const canDrag = (isWhiteTurn && pieceColor === "white") || (!isWhiteTurn && pieceColor === "black");
    
    if (canDrag) {
      setIsDragging(true);
      setSelectedSquare(squareId);
      setValidMoves(calculateValidMoves(squareId, pieces));
    }
  };

  // Handle drag over (allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  // Handle drop
  const handleDrop = (squareId: SquareId) => {
    setIsDragging(false);

    if (!selectedSquare) return;

    // If dropping on a valid move square, execute the move
    if (validMoves.includes(squareId)) {
      movePiece(selectedSquare, squareId);
    }

    // Clear selection
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Render the board
  return (
    <div className="wrapper">
      <div className="board-wrapper">
        <div className="board">
          {/* Render the squares */}
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const squareId = `${file}${rank}` as SquareId;
              const piece = pieces[squareId];
              const isDark = (rIdx + fIdx) % 2 === 1;
              const isSelected = selectedSquare === squareId;
              const isValidMove = validMoves.includes(squareId);

              // Sets a piece draggable if it's color's turn
              const canDrag = piece && (
                (isWhiteTurn && piece.endsWith("white")) || 
                (!isWhiteTurn && piece.endsWith("black"))
              );

              return (
                <Square
                  key={squareId}
                  id={squareId}
                  isDark={isDark}
                  piece={piece}
                  movePiece={movePiece}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  canDrag={canDrag}
                  onClick={() => handleSquareClick(squareId)}
                  onDragStart={() => handleDragStart(squareId)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(squareId)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
