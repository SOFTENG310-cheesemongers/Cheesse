/* This hook manages the recording of chess moves. */

// ---------------- Imports ---------------- //
import { useMoveLog } from '../../history/moveLogStore';

/**
 * Custom hook to record a chess move.
 * @returns {function} - A function to record a move.
 */
export function useRecordMove() {
    const { addMove } = useMoveLog();
    // Record a move in the history
    return (_from: string, to: string, piece: string) => {
        const [pieceName, _color] = piece.split('_');
        // Use standard chess notation:
        // P = pawn (implicit), N = knight, B = bishop, R = rook, Q = queen, K = king
        let pieceSymbol = '';
        switch (pieceName) {
            case 'knight': pieceSymbol = 'N'; break;
            case 'bishop': pieceSymbol = 'B'; break;
            case 'rook': pieceSymbol = 'R'; break;
            case 'queen': pieceSymbol = 'Q'; break;
            case 'king': pieceSymbol = 'K'; break;
            // Pawns don't have a symbol in standard notation
            default: pieceSymbol = '';
        }
        const moveNotation = `${pieceSymbol}${to}`;
        addMove(moveNotation);
    };
}
