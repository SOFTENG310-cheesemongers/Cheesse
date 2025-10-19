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

  const [file, rank] = [squareId[0], Number.parseInt(squareId[1])];
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
 * Check if a piece is an opponent's piece
 */
function isOpponentPiece(piece: PieceName | undefined, isWhite: boolean): boolean {
  return piece?.endsWith(isWhite ? "black" : "white") ?? false;
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

  // Add forward moves
  addPawnForwardMoves(moves, file, rank, direction, startRank, pieces);

  // Add capture moves
  addPawnCaptureMoves(moves, file, rank, direction, pieces, isWhite);

  return moves;
}

/**
 * Add forward pawn moves (one or two squares)
 */
function addPawnForwardMoves(
  moves: SquareId[],
  file: string,
  rank: number,
  direction: number,
  startRank: number,
  pieces: Pieces
): void {
  const oneForward = `${file}${rank + direction}` as SquareId;
  
  if (!pieces[oneForward]) {
    moves.push(oneForward);

    // Move forward two if at starting position
    if (rank === startRank) {
      const twoForward = `${file}${rank + direction * 2}` as SquareId;
      if (!pieces[twoForward]) {
        moves.push(twoForward);
      }
    }
  }
}

/**
 * Add diagonal capture moves for pawns
 */
function addPawnCaptureMoves(
  moves: SquareId[],
  file: string,
  rank: number,
  direction: number,
  pieces: Pieces,
  isWhite: boolean
): void {
  const fileIndex = FILES.indexOf(file as any);
  
  for (const fileDelta of [-1, 1]) {
    const newFileIndex = fileIndex + fileDelta;
    
    if (isInBounds(newFileIndex, rank + direction)) {
      const captureSquare = `${FILES[newFileIndex]}${rank + direction}` as SquareId;
      
      if (isOpponentPiece(pieces[captureSquare], isWhite)) {
        moves.push(captureSquare);
      }
    }
  }
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

      if (targetPiece) {
        if (isOpponentPiece(targetPiece, isWhite)) {
          moves.push(square);
        }
        break;
      } else {
        moves.push(square);
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