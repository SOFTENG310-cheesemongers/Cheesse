import { render, screen } from '@testing-library/react';
import TopControlBar from '../../../../main/chess/components/controls/TopControlBar';

describe('TopControlBar', () => {
  it('renders without crashing', () => {
    render(<TopControlBar />);
    expect(screen.getByText('Restart')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('renders a div with class "top-control-bar"', () => {
    const { container } = render(<TopControlBar />);
    const div = container.querySelector('.top-control-bar');
    expect(div).toBeInTheDocument();
  });

  it('renders exactly three buttons', () => {
    render(<TopControlBar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('buttons have correct text', () => {
    render(<TopControlBar />);
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
  });
});
