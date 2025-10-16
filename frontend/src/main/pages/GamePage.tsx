/* This is the game page component */

// ---------------- Imports ---------------- //
import "./GamePage.css";

import Board from "../chess/components/board/Board";
import GameMoveLogSidebar from '../chess/components/controls/GameMoveLogSidebar';
import GameOptionsSidebar from '../chess/components/controls/GameOptionsSidebar';
import { useState } from 'react';
import Timer from "../chess/components/controls/Timer";
import { useChessStore } from '../app/chessStore';

/**
 * GamePage component - main container for the chess game UI.
 * @returns {JSX.Element}
 */

interface GamePageProps {
  onReturnToMenu?: () => void;
}

export default function GamePage({ onReturnToMenu }: GamePageProps = {}) {
  const { isWhiteTurn, canUndo, requestUndo, canRedo, requestRedo } = useChessStore();

  // State for forfeit functionality
  const [showConfirmForfeit, setShowConfirmForfeit] = useState(false);
  const [gameForfeited, setGameForfeited] = useState(false);
  const [forfeitingPlayer, setForfeitingPlayer] = useState<'White' | 'Black'>('White');
  const [selectedOption, setSelectedOption] = useState('standard');

  // Handler for button clicks
  const handleOptionChange = (option: string) => {
    if (option === 'forfeit') {
      // Show custom confirmation dialog
      setForfeitingPlayer(isWhiteTurn ? 'White' : 'Black');
      setShowConfirmForfeit(true);
    } else if (option === 'undo') {
      // Handle undo - trigger the undo operation
      requestUndo();
      setSelectedOption(option);
      setTimeout(() => setSelectedOption(''), 300);
    } else if (option === 'redo') {
      // Handle redo - trigger the redo operation
      requestRedo();
      setSelectedOption(option);
      setTimeout(() => setSelectedOption(''), 300);
    }
  };

  // Handle forfeit confirmation
  const handleForfeitConfirm = () => {
    setShowConfirmForfeit(false);
    setGameForfeited(true);
    setSelectedOption('forfeit');
  };

  // Handle forfeit cancel
  const handleForfeitCancel = () => {
    setShowConfirmForfeit(false);
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    if (onReturnToMenu) {
      onReturnToMenu();
    }
  };

  const options = [
    { value: 'undo', label: 'Undo', disabled: !canUndo },
    { value: 'redo', label: 'Redo', disabled: !canRedo },
    { value: 'forfeit', label: 'Forfeit' },
  ];

  return (
    <div className="game-page-div">
      {/* Forfeit Confirmation Dialog */}
      {showConfirmForfeit && (
        <div className="forfeit-overlay">
          <div className="forfeit-confirmation">
            <h2>Confirm Forfeit</h2>
            <p>Are you sure you want {forfeitingPlayer} to forfeit the game?</p>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={handleForfeitConfirm}>
                Yes, Forfeit
              </button>
              <button className="cancel-button" onClick={handleForfeitCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over - Forfeit Message */}
      {gameForfeited && (
        <div className="forfeit-overlay">
          <div className="forfeit-message">
            <h2>Game Forfeited!</h2>
            <p className="forfeiting-player">{forfeitingPlayer} has forfeited the game.</p>
            <p className="winner">{forfeitingPlayer === 'White' ? 'Black' : 'White'} Wins!</p>
            <button className="return-to-menu-button" onClick={handleReturnToMenu}>
              Return to Menu
            </button>
          </div>
        </div>
      )}

      <GameMoveLogSidebar />

      <div className="board-timer-wrapper">
        <Board />
        {/** If selectedSeconds in the store is non-null we have a timer */}
        {useChessStore().selectedSeconds !== null ? <Timer /> : <div className="Timerfiller"></div>}
      </div>

      <GameOptionsSidebar
        selectedOption={selectedOption}
        onOptionChange={handleOptionChange}
        options={options}
      />
    </div>
  );
}
