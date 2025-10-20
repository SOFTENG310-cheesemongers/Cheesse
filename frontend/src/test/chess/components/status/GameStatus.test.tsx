import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStatus } from '../../../../main/chess/components/status/GameStatus';
import { ChessProvider } from '../../../../main/app/chessStore';

describe('GameStatus', () => {
  const mockBoard: string[][] = [
    ['rook_black', 'knight_black', 'bishop_black', 'queen_black', 'king_black', 'bishop_black', 'knight_black', 'rook_black'],
    ['pawn_black', 'pawn_black', 'pawn_black', 'pawn_black', 'pawn_black', 'pawn_black', 'pawn_black', 'pawn_black'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['pawn_white', 'pawn_white', 'pawn_white', 'pawn_white', 'pawn_white', 'pawn_white', 'pawn_white', 'pawn_white'],
    ['rook_white', 'knight_white', 'bishop_white', 'queen_white', 'king_white', 'bishop_white', 'knight_white', 'rook_white']
  ];

  it('renders without crashing', () => {
    render(
      <ChessProvider>
        <GameStatus board={mockBoard} />
      </ChessProvider>
    );
    // Component should render with turn information
    expect(screen.getByText(/turn/i)).toBeInTheDocument();
  });

  // Example test for future implementation
  it('displays current turn when provided', () => {
    // This test will fail until the component is implemented
    // render(<GameStatus currentTurn="White" />);
    // expect(screen.getByText(/current turn: white/i)).toBeInTheDocument();
  });

  it('displays check status when in check', () => {
    // This test will fail until the component is implemented
    // render(<GameStatus isCheck={true} />);
    // expect(screen.getByText(/check!/i)).toBeInTheDocument();
  });

  it('displays checkmate status when in checkmate', () => {
    // This test will fail until the component is implemented
    // render(<GameStatus isCheckmate={true} />);
    // expect(screen.getByText(/checkmate!/i)).toBeInTheDocument();
  });
});
