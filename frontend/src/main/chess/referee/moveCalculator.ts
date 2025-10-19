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

  const validMoves: SquareId[] = [];

  switch (pieceType) {
    case "pawn":
      return calculatePawnMoves(file, rank, pieces, isWhite);
    case "rook":
      return calculateRookMoves(fileIndex, rank, pieces, isWhite);
    case "knight":
      return calculateKnightMoves(fileIndex, rank, pieces, isWhite);
    case "bishop":
      return calculateBishopMoves(fileIndex, rank, pieces, isWhite);
    case "queen":
      return [
        ...calculateRookMoves(fileIndex, rank, pieces, isWhite),
        ...calculateBishopMoves(fileIndex, rank, pieces, isWhite)
      ];
    case "king":
      return calculateKingMoves(fileIndex, rank, pieces, isWhite);
  }

  return validMoves;
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
    
    if (newFileIndex >= 0 && newFileIndex < 8) { // In board
      const captureSquare = `${FILES[newFileIndex]}${rank + direction}` as SquareId;
      const targetPiece = pieces[captureSquare];
      if (targetPiece && targetPiece.endsWith(isWhite ? "black" : "white")) {
        moves.push(captureSquare);
      }
    }
  }

  return moves;
}

function calculateRookMoves(fileIndex: number, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  const moves: SquareId[] = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  for (const [fileDelta, rankDelta] of directions) {
    let newFile = fileIndex + fileDelta;
    let newRank = rank + rankDelta;

    while (newFile >= 0 && newFile < 8 && newRank >= 1 && newRank <= 8) {
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

function calculateKnightMoves(fileIndex: number, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  const moves: SquareId[] = [];
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];

  for (const [fileDelta, rankDelta] of knightMoves) {
    const newFile = fileIndex + fileDelta;
    const newRank = rank + rankDelta;

    if (newFile >= 0 && newFile < 8 && newRank >= 1 && newRank <= 8) {
      const square = `${FILES[newFile]}${newRank}` as SquareId;
      const targetPiece = pieces[square];

      if (!targetPiece || targetPiece.endsWith(isWhite ? "black" : "white")) {
        moves.push(square);
      }
    }
  }

  return moves;
}

function calculateBishopMoves(fileIndex: number, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  const moves: SquareId[] = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  for (const [fileDelta, rankDelta] of directions) {
    let newFile = fileIndex + fileDelta;
    let newRank = rank + rankDelta;

    while (newFile >= 0 && newFile < 8 && newRank >= 1 && newRank <= 8) {
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

function calculateKingMoves(fileIndex: number, rank: number, pieces: Pieces, isWhite: boolean): SquareId[] {
  const moves: SquareId[] = [];
  const kingMoves = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (const [fileDelta, rankDelta] of kingMoves) {
    const newFile = fileIndex + fileDelta;
    const newRank = rank + rankDelta;

    if (newFile >= 0 && newFile < 8 && newRank >= 1 && newRank <= 8) {
      const square = `${FILES[newFile]}${newRank}` as SquareId;
      const targetPiece = pieces[square];

      if (!targetPiece || targetPiece.endsWith(isWhite ? "black" : "white")) {
        moves.push(square);
      }
    }
  }

  return moves;
}