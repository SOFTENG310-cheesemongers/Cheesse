// type.test.ts
import { describe, it, expect } from 'vitest';

// Example type to test
type Move = {
  from: string;
  to: string;
  piece: string;
  captured?: string;
};

function isValidMove(move: Move): boolean {
  // Example validation: from and to must be different and not empty
  return (
    typeof move.from === 'string' &&
    typeof move.to === 'string' &&
    move.from !== '' &&
    move.to !== '' &&
    move.from !== move.to &&
    typeof move.piece === 'string' &&
    move.piece !== ''
  );
}

describe('Move type', () => {
  it('should validate a correct move', () => {
    const move: Move = { from: 'e2', to: 'e4', piece: 'pawn' };
    expect(isValidMove(move)).toBe(true);
  });

  it('should invalidate a move with same from and to', () => {
    const move: Move = { from: 'e2', to: 'e2', piece: 'pawn' };
    expect(isValidMove(move)).toBe(false);
  });

  it('should invalidate a move with empty from', () => {
    const move: Move = { from: '', to: 'e4', piece: 'pawn' };
    expect(isValidMove(move)).toBe(false);
  });

  it('should invalidate a move with empty to', () => {
    const move: Move = { from: 'e2', to: '', piece: 'pawn' };
    expect(isValidMove(move)).toBe(false);
  });

  it('should invalidate a move with empty piece', () => {
    const move: Move = { from: 'e2', to: 'e4', piece: '' };
    expect(isValidMove(move)).toBe(false);
  });

  it('should validate a move with captured piece', () => {
    const move: Move = { from: 'e4', to: 'd5', piece: 'pawn', captured: 'pawn' };
    expect(isValidMove(move)).toBe(true);
  });
});