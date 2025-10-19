/* This component renders the chessboard and its squares. */

// ---------------- Imports ---------------- //
import "./Board.css";
import Square from "./Square";
import { FILES, RANKS, type SquareId } from "./BoardConfig";
import { useMovePiece } from "../board/hooks/useMovePiece";
import { useState } from "react";
import { calculateValidMoves } from "../../referee/moveCalculator";

// ---------------- Board Component ---------------- //

/**
 * Board component - renders the chessboard and handles piece movement.
 * @returns {JSX.Element}
 */

export default function Board({ flipped = false }: { flipped?: boolean }) {
  const { pieces, movePiece } = useMovePiece();
   
  // State to track selected square
  const [selectedSquare, setSelectedSquare] = useState<SquareId | null>(null);
  const [validMoves, setValidMoves] = useState<SquareId[]>([]);

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
      setSelectedSquare(squareId);
      setValidMoves(calculateValidMoves(squareId, pieces));
    }
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

              return (
                <Square
                  key={squareId}
                  id={squareId}
                  isDark={isDark}
                  piece={piece}
                  movePiece={movePiece}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  onClick={() => handleSquareClick(squareId)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
