import { render, screen } from '@testing-library/react';
import GameMoveLogSidebar from '../../../../main/chess/components/controls/GameMoveLogSidebar';
const { useMoveLog } = require('../../../../main/chess/components/history/moveLogStore');

// Mock MoveList and useMoveLog
jest.mock('../../../../main/chess/components/history/MoveList', () => (props: any) => (
  <div data-testid="mock-move-list">{JSON.stringify(props.moves)}</div>
));
jest.mock('../../../../main/chess/components/history/moveLogStore', () => ({
  useMoveLog: jest.fn(),
}));


describe('GameMoveLogSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sidebar with the correct title', () => {
    useMoveLog.mockReturnValue({ moves: [] });
    render(<GameMoveLogSidebar />);
    expect(screen.getByText('Move Log')).toBeInTheDocument();
  });

  it('renders MoveList with moves from the store', () => {
    const mockMoves = [{ move: 'e4' }, { move: 'e5' }];
    useMoveLog.mockReturnValue({ moves: mockMoves });
    render(<GameMoveLogSidebar />);
    const moveList = screen.getByTestId('mock-move-list');
    expect(moveList).toHaveTextContent(JSON.stringify(mockMoves));
  });

  it('renders empty MoveList when there are no moves', () => {
    useMoveLog.mockReturnValue({ moves: [] });
    render(<GameMoveLogSidebar />);
    const moveList = screen.getByTestId('mock-move-list');
    expect(moveList).toHaveTextContent('[]');
  });

  it('has the correct CSS classes applied', () => {
    useMoveLog.mockReturnValue({ moves: [] });
    const { container } = render(<GameMoveLogSidebar />);
    expect(container.querySelector('.game-log-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.game-move-log-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.move-log-lbl')).toBeInTheDocument();
    expect(container.querySelector('.move-log-wrapper')).toBeInTheDocument();
  });
});
