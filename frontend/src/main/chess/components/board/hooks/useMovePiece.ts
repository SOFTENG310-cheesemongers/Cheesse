/* This hook manages the movement of chess pieces on the board. */

// ---------------- Imports ---------------- //
import { useState, useRef, useEffect } from "react";
import Referee from "../../../referee/Referee";
import { useChessStore } from '../../../../app/chessStore';
import { type SquareId, type PieceName, initialPieces } from "../BoardConfig";
import { squareToCoords } from "../../../utils/chessUtils";
import { useRecordMove } from "./useRecordMove";
import { useMultiplayer } from '../../../../multiplayer/MultiplayerProvider';
import { useMoveLog } from "../../history/moveLogStore";

/**
 * Custom hook to manage piece movement in the chess game.
 * @returns {object} - An object containing the current pieces and a function to move a piece.
 */
export function useMovePiece() {
  const recordMove = useRecordMove();
  const { undoLastMove: undoMoveLog, redoLastMove: redoMoveLog } = useMoveLog();
  const [pieces, setPieces] = useState(initialPieces);
  const moveInProgress = useRef(false);
  const lastMoveDetailsLength = useRef(0);
  const lastProcessedUndoTrigger = useRef(0);
  const lastProcessedRedoTrigger = useRef(0);

  // Persistent Referee instance
  const referee = useRef(new Referee()).current;

  // chess store functions
  const { changeTurn, addMoveDetails, moveDetails, undoTrigger, undoLastMove, redoTrigger, redoLastMove } = useChessStore();
  const multiplayer = useMultiplayer as unknown as (() => { roomId?: string; myColor?: 'white' | 'black'; lastMoveSeq: number; lastMove?: { from: string; to: string; piece?: string }; makeMove: (from: string, to: string, piece?: string) => void; state?: { activeColor: 'white' | 'black' } });
  let mp: ReturnType<typeof multiplayer> | undefined;
  try { mp = (useMultiplayer as any)(); } catch { mp = undefined; }

  // Persistent move counter
  const moveCountRef = useRef(0);

  // Persistent board representation
  const boardArray = useRef<(string | undefined)[][]>(
    Array(8).fill(null).map(() => Array(8).fill(undefined))
  );

  // Initialize board once
  useEffect(() => {
    for (const [square, piece] of Object.entries(initialPieces)) {
      const [x, y] = squareToCoords(square);
      boardArray.current[y][x] = piece;
    }
    lastMoveDetailsLength.current = 0;
  }, []);

  // Effect to handle undo when trigger changes
  useEffect(() => {
    if (undoTrigger > lastProcessedUndoTrigger.current && moveDetails.length > 0) {
      // Update the processed trigger to prevent repeating
      lastProcessedUndoTrigger.current = undoTrigger;

      // Get the last move details and remove it from history
      const lastMove = undoLastMove();

      if (lastMove) {
        // Create new pieces object with the move reversed
        const newPieces = { ...pieces };

        // Remove piece from its current position (lastMove.to)
        delete newPieces[lastMove.to as SquareId];

        // Put the piece back to its original position (lastMove.from)
        newPieces[lastMove.from as SquareId] = lastMove.piece as PieceName;

        // If there was a captured piece, restore it to the destination square
        if (lastMove.capturedPiece) {
          newPieces[lastMove.to as SquareId] = lastMove.capturedPiece as PieceName;
        }

        // Update the pieces state
        setPieces(newPieces);

        // Update board array to match the new pieces state
        const newBoardArray = Array(8).fill(null).map(() => Array(8).fill(null));
        Object.entries(newPieces).forEach(([square, piece]) => {
          const [x, y] = squareToCoords(square as SquareId);
          newBoardArray[y][x] = piece;
        });
        boardArray.current = newBoardArray;

        // Change turn back to previous player
        changeTurn();

        // Decrement move count
        moveCountRef.current = Math.max(0, moveCountRef.current - 1);

        // Update the move log UI
        undoMoveLog();
      }
    }
  }, [undoTrigger, moveDetails, pieces, changeTurn, undoLastMove, undoMoveLog]);

  // Effect to handle redo when trigger changes
  useEffect(() => {
    if (redoTrigger > lastProcessedRedoTrigger.current) {
      // Update the processed trigger to prevent repeating
      lastProcessedRedoTrigger.current = redoTrigger;

      // Get the move to redo and add it back to history
      const moveToRedo = redoLastMove();

      if (moveToRedo) {
        // Create new pieces object with the move re-applied
        const newPieces = { ...pieces };

        // Remove piece from its original position (moveToRedo.from)
        delete newPieces[moveToRedo.from as SquareId];

        // Put the piece to its destination position (moveToRedo.to)
        newPieces[moveToRedo.to as SquareId] = moveToRedo.piece as PieceName;

        // If there was a captured piece, remove it again
        if (moveToRedo.capturedPiece) {
          // The captured piece was already removed when we re-apply the move
          // No additional action needed here
        }

        // Update the pieces state
        setPieces(newPieces);

        // Update board array to match the new pieces state
        const newBoardArray = Array(8).fill(null).map(() => Array(8).fill(null));
        Object.entries(newPieces).forEach(([square, piece]) => {
          const [x, y] = squareToCoords(square as SquareId);
          newBoardArray[y][x] = piece;
        });
        boardArray.current = newBoardArray;

        // Change turn to next player
        changeTurn();

        // Increment move count
        moveCountRef.current += 1;

        // Update the move log UI
        redoMoveLog(moveToRedo.notation);
      }
    }
  }, [redoTrigger, pieces, changeTurn, redoLastMove, redoMoveLog]);

  // Apply opponent moves from multiplayer
  const lastAppliedSeq = useRef(0);
  useEffect(() => {
    if (!mp || !mp.lastMove || mp.lastMoveSeq === lastAppliedSeq.current) return;
  const { from, to, piece } = mp.lastMove;
    lastAppliedSeq.current = mp.lastMoveSeq;
    // Apply the move to local board without validations (already validated by server)
    setPieces(prev => {
      const next = { ...prev };
      const movingPiece = next[from as SquareId];
      if (!movingPiece) return prev;
      next[to as SquareId] = (piece as PieceName | undefined) || movingPiece as PieceName;
      delete next[from as SquareId];
      return next;
    });
    changeTurn();
    moveCountRef.current += 1;
    // Note: we don't push to move log here to avoid double logging;
  }, [mp?.lastMoveSeq]);

  /**
   * Moves a piece from one square to another.
   */
  function movePiece(from: SquareId, to: SquareId) {
    // Multiplayer: enforce turn and color lock
    if (mp && mp.roomId) {
      const movingPiece = pieces[from];
      if (!movingPiece) return;
      const isWhitePiece = movingPiece.endsWith('_white');
      const myColor = mp.myColor;
      const active = mp.state?.activeColor;
      if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && isWhitePiece)) {
        return; // can't move opponent's pieces
      }
      if (active && myColor && active !== myColor) {
        return; // not your turn according to server state
      }
    }
    setPieces(prev => {
      const piece = prev[from];
      const destPiece = prev[to];

      if (!piece || from === to) return prev;

      const [prevX, prevY] = squareToCoords(from);
      const [newX, newY] = squareToCoords(to);

      referee.setMoveCount(moveCountRef.current);
      if (!referee.isValidMove(boardArray.current, prevX, prevY, newX, newY, piece, destPiece)) {
        console.warn(`Invalid move from ${from} to ${to}`);
        return prev;
      }

      // update board array
      boardArray.current[prevY][prevX] = undefined;
      boardArray.current[newY][newX] = piece;

      const next = { ...prev };
      next[to] = piece;
      delete next[from];

      if (!moveInProgress.current) {
        moveInProgress.current = true;

        // Generate proper chess notation
        const [pieceName, _color] = piece.split('_');
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
        const properNotation = `${pieceSymbol}${to}`;

        // Save move details for undo functionality
        addMoveDetails({
          from,
          to,
          piece,
          capturedPiece: destPiece,
          notation: properNotation
        });

        recordMove(from, to, piece);
        if (mp && mp.roomId) {
          mp.makeMove(from, to, piece);
        } else {
          changeTurn();
        }
        setTimeout(() => { moveInProgress.current = false; }, 0);
      }

      moveCountRef.current += 1;
      return next;
    });
  }

  return { pieces, movePiece };
}
