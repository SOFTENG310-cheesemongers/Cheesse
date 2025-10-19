/* This component represents a chess piece. */

// ---------------- Imports ---------------- //
import { forwardRef } from "react";


export const ItemTypes = { PIECE: "piece" };

interface PieceProps {
  id: string;
  src: string;
}

/**
 * Piece component - represents a chess piece.
 *
 * @param {string} id - The unique identifier for the piece.
 * @param {string} src - The source URL for the piece image.
 */
const Piece = forwardRef<HTMLImageElement, PieceProps>(({ id, src }, ref) => {
  return (
    <img
      ref={ref}
      src={src}
      alt={id}
      className="piece"
      draggable={false}
      style={{ pointerEvents: "none" }}
    />
  );
});

Piece.displayName = "Piece";

export default Piece;