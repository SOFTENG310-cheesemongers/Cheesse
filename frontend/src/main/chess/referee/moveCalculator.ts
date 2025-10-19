/* This file contains logic for calculating valid chess moves */

import { type SquareId, type PieceName, FILES } from "../components/board/BoardConfig";

type Pieces = Partial<Record<SquareId, PieceName>>;

/**
 * Calculate valid moves for a piece at the given square
 */
export function calculateValidMoves(
  squareId: SquareId,
  pieces: Pieces
): SquareId[] {
  const piece = pieces[squareId];
  if (!piece) return [];

  const [file, rank] = [squareId[0], parseInt(squareId[1])];
  const fileIndex = FILES.indexOf(file as any);
  const isWhite = piece.endsWith("white");
  const pieceType = piece.split("_")[0];

  switch (pieceType) {
    case "pawn":
      return calculatePawnMoves(file, rank, pieces, isWhite);
    case "rook":
      return calculateStraightLineMoves(fileIndex, rank, pieces, isWhite,
        [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    case "knight":
      return calculateKnightMoves(fileIndex, rank, pieces, isWhite);
    case "bishop":
      return calculateStraightLineMoves(fileIndex, rank, pieces, isWhite,
        [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    case "queen":
      return calculateStraightLineMoves(fileIndex, rank, pieces, isWhite, [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]);
    case "king":
      return calculateJumpMoves(fileIndex, rank, pieces, isWhite, [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]);
    default:
      return [];
  }
}

/**
 * Check if a square is valid and can be moved to
 */
function canMoveTo(square: SquareId, pieces: Pieces, isWhite: boolean): boolean {
  const targetPiece = pieces[square];
  return !targetPiece || targetPiece.endsWith(isWhite ? "black" : "white");
}

/**
 * Check if coordinates are within the board
 */
function isInBounds(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 1 && rank <= 8;
}

function calculatePawnMoves(file: string, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  const moves: SquareId[] = [];
  const direction = isWhite ? 1 : -1;
  const startRank = isWhite ? 2 : 7;

  // Move forward one
  const oneForward = `${file}${rank + direction}` as SquareId;
  if (!pieces[oneForward]) {
    moves.push(oneForward);

    // Move forward two if at starting pos
    if (rank === startRank) {
      const twoForward = `${file}${rank + direction * 2}` as SquareId;
      if (!pieces[twoForward]) {
        moves.push(twoForward);
      }
    }
  }

  // Capture diagonally (no enpassant)
  const fileIndex = FILES.indexOf(file as any);
  for (const fileDelta of [-1, 1]) {
    const newFileIndex = fileIndex + fileDelta;
    
    if (isInBounds(newFileIndex, rank + direction)) {
      const captureSquare = `${FILES[newFileIndex]}${rank + direction}` as SquareId;
      const targetPiece = pieces[captureSquare];
      if (targetPiece && targetPiece.endsWith(isWhite ? "black" : "white")) {
        moves.push(captureSquare);
      }
    }
  }

  return moves;
}

/**
 * Calculate moves for sliding pieces (rook, bishop, queen)
 */
function calculateStraightLineMoves(
  fileIndex: number, 
  rank: number, 
  pieces: Pieces, 
  isWhite: boolean,
  directions: number[][]
): SquareId[] {
  const moves: SquareId[] = [];

  for (const [fileDelta, rankDelta] of directions) {
    let newFile = fileIndex + fileDelta;
    let newRank = rank + rankDelta;

    while (isInBounds(newFile, newRank)) {
      const square = `${FILES[newFile]}${newRank}` as SquareId;
      const targetPiece = pieces[square];

      if (!targetPiece) {
        moves.push(square);
      } else {
        if (targetPiece.endsWith(isWhite ? "black" : "white")) {
          moves.push(square);
        }
        break;
      }

      newFile += fileDelta;
      newRank += rankDelta;
    }
  }

  return moves;
}

/**
 * Calculate moves for jumping pieces (knight, king)
 */
function calculateJumpMoves(
  fileIndex: number,
  rank: number,
  pieces: Pieces,
  isWhite: boolean,
  offsets: number[][]
): SquareId[] {
  const moves: SquareId[] = [];

  for (const [fileDelta, rankDelta] of offsets) {
    const newFile = fileIndex + fileDelta;
    const newRank = rank + rankDelta;

    if (isInBounds(newFile, newRank)) {
      const square = `${FILES[newFile]}${newRank}` as SquareId;
      if (canMoveTo(square, pieces, isWhite)) {
        moves.push(square);
      }
    }
  }

  return moves;
}

function calculateKnightMoves(fileIndex: number, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  return calculateJumpMoves(fileIndex, rank, pieces, isWhite, [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ]);
}