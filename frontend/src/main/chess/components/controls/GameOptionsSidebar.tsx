import './GameOptionsSidebar.css';

/**
 * GameOptionsSidebar component - Displays selectable game options.
 * @param {Object} props
 * @param {string} props.selectedOption - The currently selected option value.
 * @param {function} props.onOptionChange - Callback when an option is selected.
 * @param {Array<{value: string, label: string}>} props.options - List of options.
 * @returns {JSX.Element}
 */
interface GameOption {
  value: string;
  label: string;
}

interface GameOptionsSidebarProps {
  selectedOption: string;
  onOptionChange: (value: string) => void;
  options: GameOption[];
}

export default function GameOptionsSidebar({ selectedOption, onOptionChange, options }: GameOptionsSidebarProps) {
  return (
    <div className="game-options-wrapper">
      <div className="game-options-sidebar">
        <h1>Game Options</h1>
        <div className="button-col">
          {options && options.length > 0 ? (
            options.map((opt: GameOption) => (
              <button
                key={opt.value}
                className={opt.value === selectedOption ? 'selected' : ''}
                onClick={() => {
                  if (opt.value !== selectedOption) onOptionChange(opt.value);
                }}
              >
                {opt.label}
              </button>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}
