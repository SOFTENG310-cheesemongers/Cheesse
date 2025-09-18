import { render, screen } from '@testing-library/react';
import MoveList from '../../../../main/chess/components/history/MoveList';

describe('MoveList', () => {
  it('renders without crashing with empty moves', () => {
    render(<MoveList moves={[]} />);
    expect(screen.getByRole('list', { hidden: true })).toBeInTheDocument();
  });

  it('renders a single move with only white', () => {
    render(<MoveList moves={[{ white: 'e4' }]} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
  });

  it('renders a single move with both white and black', () => {
    render(<MoveList moves={[{ white: 'e4', black: 'e5' }]} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();
  });

  it('renders multiple moves', () => {
    const moves = [
      { white: 'e4', black: 'e5' },
      { white: 'Nf3', black: 'Nc6' },
      { white: 'Bb5' },
    ];
    render(<MoveList moves={moves} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
    expect(screen.getByText('Bb5')).toBeInTheDocument();
    expect(screen.queryByText('Nc6')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const style = { backgroundColor: 'red' };
    const { container } = render(<MoveList moves={[]} style={style} />);
    expect(container.firstChild).toHaveStyle('background-color: red');
  });

  it('renders empty span for missing black move', () => {
    render(<MoveList moves={[{ white: 'e4' }]} />);
    // There should be two spans in the move-entry: move-number and white move, plus an empty span
    const moveEntry = screen.getByText('e4').closest('.move-entry');
    expect(moveEntry?.querySelectorAll('span').length).toBe(3);
  });

  it('renders correct number of move entries', () => {
    const moves = [
      { white: 'e4', black: 'e5' },
      { white: 'Nf3', black: 'Nc6' },
      { white: 'Bb5' },
    ];
    render(<MoveList moves={moves} />);
    expect(document.querySelectorAll('.move-entry').length).toBe(3);
  });
});
