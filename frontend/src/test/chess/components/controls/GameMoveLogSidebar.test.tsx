import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameMoveLogSidebar from '../../../../main/chess/components/controls/GameMoveLogSidebar';
import { useMoveLog } from '../../../../main/chess/components/history/moveLogStore';

// Mock MoveList and useMoveLog
vi.mock('../../../../main/chess/components/history/MoveList', () => ({
  default: (props: any) => <div data-testid="mock-move-list">{JSON.stringify(props.moves)}</div>
}));
vi.mock('../../../../main/chess/components/history/moveLogStore', () => ({
  useMoveLog: vi.fn(),
}));


describe('GameMoveLogSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar with the correct title', () => {
    (useMoveLog as ReturnType<typeof vi.fn>).mockReturnValue({ moves: [] });
    render(<GameMoveLogSidebar />);
    expect(screen.getByText('Move Log')).toBeInTheDocument();
  });

  it('renders MoveList with moves from the store', () => {
    const mockMoves = [{ move: 'e4' }, { move: 'e5' }];
    (useMoveLog as ReturnType<typeof vi.fn>).mockReturnValue({ moves: mockMoves });
    render(<GameMoveLogSidebar />);
    const moveList = screen.getByTestId('mock-move-list');
    expect(moveList).toHaveTextContent(JSON.stringify(mockMoves));
  });

  it('renders empty MoveList when there are no moves', () => {
    (useMoveLog as ReturnType<typeof vi.fn>).mockReturnValue({ moves: [] });
    render(<GameMoveLogSidebar />);
    const moveList = screen.getByTestId('mock-move-list');
    expect(moveList).toHaveTextContent('[]');
  });

  it('has the correct CSS classes applied', () => {
    (useMoveLog as ReturnType<typeof vi.fn>).mockReturnValue({ moves: [] });
    const { container } = render(<GameMoveLogSidebar />);
    expect(container.querySelector('.game-log-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.game-move-log-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.move-log-lbl')).toBeInTheDocument();
    expect(container.querySelector('.move-log-wrapper')).toBeInTheDocument();
  });
});
