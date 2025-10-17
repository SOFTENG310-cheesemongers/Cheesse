/* This file contains types related to the chess move log. */

/**
 * Represents a chess move in the game.
 */
export interface ChessMove {
    white?: string;
    black?: string;
}

/**
 * Represents the state of the move log.
 */
export interface MoveLogState {
    moves: ChessMove[];
    addMove: (move: string) => void;
    undoLastMove: () => void;
    redoLastMove: (move: string) => void;
}
