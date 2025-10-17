/* This hook manages the movement of chess pieces on the board. */

// ---------------- Imports ---------------- //
import { useState, useRef, useEffect } from "react";
import Referee from "../../../referee/Referee";
import { useChessStore } from '../../../../app/chessStore';
import { type SquareId, initialPieces } from "../BoardConfig";
import { squareToCoords } from "../../../utils/chessUtils";
import { useRecordMove } from "./useRecordMove";

/**
 * Custom hook to manage piece movement in the chess game.
 * @returns {object} - An object containing the current pieces and a function to move a piece.
 */
export function useMovePiece() {
  const recordMove = useRecordMove();
  const [pieces, setPieces] = useState(initialPieces);
  const moveInProgress = useRef(false);

  // Persistent Referee instance
  const referee = useRef(new Referee()).current;

  // change turn function and menu result helper from global chess store
  const { changeTurn, setMenuResult } = useChessStore();

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
  }, []);

  /**
   * Moves a piece from one square to another.
   */
  function movePiece(from: SquareId, to: SquareId) {
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
        recordMove(from, to, piece);
        changeTurn();
        setTimeout(() => { moveInProgress.current = false; }, 0);
      }

      // If the destination id contains 'king', trigger the result modal with the piece color
      // piece format expected like '<type>_<color>' so split and take index 1
      try {
        console.log('Checking for king on move:', destPiece);
        if (String(destPiece).includes('king')) {
          const color = String(piece).split('_')[1] ?? '';
          setMenuResult(color);
        }
      } catch (e) {
        // ignore any unexpected format
        console.warn('Failed to check for king on move:', e);
      }

      moveCountRef.current += 1;
      return next;
    });
  }

  return { pieces, movePiece };
}
