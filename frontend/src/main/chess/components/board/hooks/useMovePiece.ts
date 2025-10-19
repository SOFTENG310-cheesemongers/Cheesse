/* This hook manages the movement of chess pieces on the board. */

// ---------------- Imports ---------------- //
import { useState, useRef, useEffect } from "react";
import { useChessStore } from '../../../../app/chessStore';
import { type SquareId, type PieceName, initialPieces } from "../BoardConfig";
import { squareToCoords } from "../../../utils/chessUtils";
import { useRecordMove } from "./useRecordMove";
import { useOptionalMultiplayer } from '../../../../multiplayer/MultiplayerProvider';
import { useMoveLog } from "../../history/moveLogStore";
import { calculateValidMoves } from "../../../referee/moveCalculator";


/**
 * Custom hook to manage piece movement in the chess game.
 * @returns {object} - An object containing the current pieces and a function to move a piece.
 */
export function useMovePiece() {
  const recordMove = useRecordMove();
  const { undoLastMove: undoMoveLog, redoLastMove: redoMoveLog } = useMoveLog();
  const mp = useOptionalMultiplayer();

  // Initialize pieces - if in multiplayer, reconstruct from server state
  const [pieces, setPieces] = useState(() => {
    if (mp && mp.state) {
      const moves = (mp.state as any).moves || [];
      if (moves.length > 0) {
        let board: Partial<Record<SquareId, PieceName>> = { ...initialPieces };
        for (const move of moves) {
          const from = move.from as SquareId;
          const to = move.to as SquareId;
          const piece = board[from];
          if (piece) {
            board[to] = piece;
            delete board[from];
          }
        }
        return board;
      }
    }
    return initialPieces;
  });

  const moveInProgress = useRef(false);
  const lastMoveDetailsLength = useRef(0);
  const lastProcessedUndoTrigger = useRef(0);
  const lastProcessedRedoTrigger = useRef(0);

  // chess store functions
  const { changeTurn, addMoveDetails, moveDetails, undoTrigger, undoLastMove, redoTrigger, redoLastMove, setMenuResult } = useChessStore();

  // Keep a ref to latest pieces to avoid stale closures in movePiece
  const piecesRef = useRef(pieces);
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);



  // Persistent move counter
  const moveCountRef = useRef(0);

  // Persistent board representation
  // TODO: Consider refactoring - boardArray is manually updated in 5 places:
  // 1. Initialization (below), 2. Multiplayer sync, 3. Local moves, 4. Undo, 5. Redo
  // Could use a single useEffect(() => { sync from pieces }, [pieces]) instead.
  // Current approach works correctly but is less maintainable.
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
    // Skip undo in multiplayer - server is source of truth
    if (mp && mp.roomId) {
      return;
    }

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
        const newBoardArray = Array(8).fill(undefined).map(() => Array(8).fill(undefined));
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
  }, [mp, undoTrigger, moveDetails, pieces, changeTurn, undoLastMove, undoMoveLog]);

  // Effect to handle redo when trigger changes
  useEffect(() => {
    // Skip redo in multiplayer - server is source of truth
    if (mp && mp.roomId) {
      return;
    }

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
        const newBoardArray = Array(8).fill(undefined).map(() => Array(8).fill(undefined));
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
  }, [mp, redoTrigger, pieces, changeTurn, redoLastMove, redoMoveLog]);

  // Apply moves from multiplayer - reconstruct entire board state from server moves
  const lastRecordedMoveCount = useRef(0);
  useEffect(() => {
    if (!mp || !mp.state) {
      return;
    }

    const moves = (mp.state as any).moves || [];
    if (moves.length === 0) {
      return;
    }

    // Reconstruct entire board from scratch using server's move list
    let board: Partial<Record<SquareId, PieceName>> = { ...initialPieces };

    // Apply each move in sequence
    for (const move of moves) {
      const from = move.from as SquareId;
      const to = move.to as SquareId;
      const piece = board[from];

      if (piece) {
        board[to] = piece;
        delete board[from];
      }
    }

    // Update pieces state with reconstructed board
    setPieces(board);

    // Rebuild board array from reconstructed board
    const newBoardArray = Array(8).fill(undefined).map(() => Array(8).fill(undefined));
    Object.entries(board).forEach(([square, piece]) => {
      if (piece) {
        const [x, y] = squareToCoords(square as SquareId);
        newBoardArray[y][x] = piece;
      }
    });
    boardArray.current = newBoardArray;

    // Update move count
    moveCountRef.current = moves.length;

    // Update turn
    if (mp.state.activeColor) {
      const isWhiteTurn = mp.state.activeColor === 'white';
      changeTurn(isWhiteTurn);
    }

    // Record only NEW moves in move log (to avoid duplicates on remount)
    if (moves.length > lastRecordedMoveCount.current) {
      const newMoves = moves.slice(lastRecordedMoveCount.current);
      for (const move of newMoves) {
        recordMove(move.from, move.to, move.piece);
      }
      lastRecordedMoveCount.current = moves.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp?.lastMoveSeq]);

  /**
   * Moves a piece from one square to another.
   */
  function movePiece(from: SquareId, to: SquareId) {
    // Multiplayer: enforce color lock (can't move opponent's pieces)
    if (mp && mp.roomId) {
      // Use ref to get latest pieces (avoid stale closure)
      const currentPieces = piecesRef.current;
      const movingPiece = currentPieces[from];
      if (!movingPiece) {
        return;
      }
      const isWhitePiece = movingPiece.endsWith('_white');
      const myColor = mp.myColor;

      // Only check that you're moving YOUR color pieces
      // Turn enforcement is handled by the server
      if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && isWhitePiece)) {
        console.warn('[useMovePiece] Cannot move opponent piece');
        return;
      }
      
      // Also validate move using moveCalculator
      const validMoves = calculateValidMoves(from, currentPieces);
      if (!validMoves.includes(to)) {
        console.warn(`[useMovePiece] Invalid move from ${from} to ${to}`);
        return;
      }
    }

    // In multiplayer, just validate and send to server - don't update local state
    if (mp && mp.roomId) {
      // Use ref to get latest pieces (avoid stale closure)
      const currentPieces = piecesRef.current;
      const piece = currentPieces[from];
      
      if (!piece || from === to) return;
      
      // Validate move before sending to server
      const validMoves = calculateValidMoves(from, currentPieces);
      if (!validMoves.includes(to)) {
        console.warn(`[useMovePiece] Invalid move from ${from} to ${to}`);
        return;
      }

      // Send to server - board will update when server responds with moveAccepted
      // Move log will be updated in sync effect when server confirms
      mp.makeMove(from, to, piece);

      return; // Don't update local state - wait for server
    }

    // Local game: update state immediately
    setPieces(prev => {
      const piece = prev[from];
      const destPiece = prev[to];

      if (!piece || from === to) return prev;

      const [prevX, prevY] = squareToCoords(from);
      const [newX, newY] = squareToCoords(to);

      console.log('[useMovePiece] Validating move:', { from, to, piece, prevX, prevY, newX, newY, moveCount: moveCountRef.current });
      console.log('[useMovePiece] Board state:', boardArray.current);

      // Validate move using moveCalculator
      const validMoves = calculateValidMoves(from, prev);
      if (!validMoves.includes(to)) {
        console.warn(`[useMovePiece] Invalid move from ${from} to ${to}. Piece: ${piece}, DestPiece: ${destPiece}`);
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

        // Save move details for undo functionality (local game only)
        addMoveDetails({
          from,
          to,
          piece,
          capturedPiece: destPiece,
          notation: properNotation
        });

        recordMove(from, to, piece);
        changeTurn(); // Local game: change turn immediately
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

  return { pieces, movePiece, boardArray: boardArray.current };
}
