import { render, fireEvent, screen } from '@testing-library/react';
import GameOptionSidebar from '../../../../main/chess/components/controls/GameOptionsSidebar';

describe('GameOptionSidebar', () => {
  const mockOnOptionChange = jest.fn();

  const defaultProps = {
    selectedOption: 'standard',
    onOptionChange: mockOnOptionChange,
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'blitz', label: 'Blitz' },
      { value: 'bullet', label: 'Bullet' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all options', () => {
    render(<GameOptionSidebar {...defaultProps} />);
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Blitz')).toBeInTheDocument();
    expect(screen.getByText('Bullet')).toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    render(<GameOptionSidebar {...defaultProps} selectedOption="blitz" />);
    const blitzOption = screen.getByText('Blitz');
    expect(blitzOption).toHaveClass('selected');
  });

  it('calls onOptionChange when an option is clicked', () => {
    render(<GameOptionSidebar {...defaultProps} />);
    const bulletOption = screen.getByText('Bullet');
    fireEvent.click(bulletOption);
    expect(mockOnOptionChange).toHaveBeenCalledWith('bullet');
  });

  it('does not call onOptionChange when the selected option is clicked', () => {
    render(<GameOptionSidebar {...defaultProps} selectedOption="standard" />);
    const standardOption = screen.getByText('Standard');
    fireEvent.click(standardOption);
    expect(mockOnOptionChange).not.toHaveBeenCalled();
  });

  it('renders with no options', () => {
    render(<GameOptionSidebar {...defaultProps} options={[]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
