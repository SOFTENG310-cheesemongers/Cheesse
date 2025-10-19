/* This component represents a chess piece. */

// ---------------- Imports ---------------- //
import { forwardRef } from "react";


export const ItemTypes = { PIECE: "piece" };

/**
 * Props for the Piece component.
 *
 * @param id - The identifier for the chess piece.
 * @param src - The source path for the piece's image.
 */
interface PieceProps {
  id: string;
  src: string;
}


/**
 * Piece component -  renders a chess piece as an image.
 *
 * @param id - The identifier for the chess piece, used as the alt text.
 * @param src - The source URL of the chess piece image.
 * @param ref - React ref forwarded to the underlying HTMLImageElement.
 *
 * @remarks
 * - The image is not draggable and does not respond to pointer events.
 * - The component uses `forwardRef` to allow parent components to access the image element directly.
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