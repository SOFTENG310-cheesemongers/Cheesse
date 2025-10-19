/* This component represents a chess piece. */

export const ItemTypes = { PIECE: "piece" };

/**
 * Piece component - represents a chess piece.
 *
 * @param {string} id - The unique identifier for the piece.
 * @param {string} src - The source URL for the piece image.
 */
export default function Piece({ id, src }: { id: string; src: string }) {
  // Render the piece
  return (
    <img
      src={src}
      alt={id}
      className="piece"
      draggable={false}
      style={{ pointerEvents: "none" }}
    />
  );
}