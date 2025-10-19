/* This is the game page component */

// ---------------- Imports ---------------- //
import "./GamePage.css";

import Board from "../chess/components/board/Board";
import GameMoveLogSidebar from '../chess/components/controls/GameMoveLogSidebar';
import GameOptionsSidebar from '../chess/components/controls/GameOptionsSidebar';
import { useState, useEffect } from 'react';
import Timer from "../chess/components/controls/Timer";
import { useChessStore } from '../app/chessStore';
import InGameMenu from '../chess/components/controls/InGameMenu'
import InGameMenuPause from '../chess/components/controls/InGameMenuPause'
import InGameMenuResult from "../chess/components/controls/InGameMenuResult";
import { useOptionalMultiplayer } from '../multiplayer/MultiplayerProvider';

/**
 * GamePage component - main container for the chess game UI.
 * @returns {JSX.Element}
 */

interface GamePageProps {
  onReturnToMenu?: () => void;
}

export default function GamePage({ onReturnToMenu }: GamePageProps = {}) {
  const { isWhiteTurn, canUndo, requestUndo, canRedo, requestRedo } = useChessStore();
  const mp = useOptionalMultiplayer();

  // State for forfeit functionality
  const [showConfirmForfeit, setShowConfirmForfeit] = useState(false);
  const [gameForfeited, setGameForfeited] = useState(false);
  const [forfeitingPlayer, setForfeitingPlayer] = useState<'White' | 'Black'>('White');
  const [winner, setWinner] = useState<'White' | 'Black'>('White');
  const [selectedOption, setSelectedOption] = useState('standard');
  const { menuOpen, setMenuOpen, selectedSeconds, setRunning, menuMode, menuMessage } = useChessStore();

  // Debug: log on mount
  useEffect(() => {
    console.log('[GamePage] Component mounted. Multiplayer:', mp ? 'ACTIVE' : 'INACTIVE');
    if (mp) {
      console.log('[GamePage] Room ID:', mp.roomId, 'My Color:', mp.myColor);
    }
  }, []);

  // Listen for multiplayer gameOver
  useEffect(() => {
    console.log('[GamePage] gameOver state changed:', mp?.gameOver);
    if (mp?.gameOver) {
      // Map Color to 'White' | 'Black'
      const winnerColor = mp.gameOver.winner === 'white' ? 'White' : mp.gameOver.winner === 'black' ? 'Black' : undefined;
      const loserColor = winnerColor === 'White' ? 'Black' : 'White';
      console.log('[GamePage] Setting game forfeited. Winner:', winnerColor, 'Loser:', loserColor);
      setForfeitingPlayer(loserColor);
      setWinner(winnerColor || 'White');
      setGameForfeited(true); // This will show the game over overlay
    }
  }, [mp?.gameOver]);

  const inMultiplayerGame = Boolean(mp && mp.roomId);

  // Handler for button clicks
  const handleOptionChange = (option: string) => {
    if (option === 'forfeit') {
      // Show custom confirmation dialog
      // In multiplayer, determine who is forfeiting based on myColor, not turn
      if (inMultiplayerGame && mp?.myColor) {
        setForfeitingPlayer(mp.myColor === 'white' ? 'White' : 'Black');
      } else {
        setForfeitingPlayer(isWhiteTurn ? 'White' : 'Black');
      }
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

  // Handle checkmate detection
  const handleCheckmate = (losingPlayer: 'White' | 'Black') => {
    console.log('[GamePage] Checkmate detected:', losingPlayer, 'has been checkmated');
    const winningPlayer = losingPlayer === 'White' ? 'Black' : 'White';

    setForfeitingPlayer(losingPlayer);
    setWinner(winningPlayer);
    setGameForfeited(true); // This will show the game over overlay with "checkmate" context
    setSelectedOption('checkmate'); // Use a different option to distinguish from forfeit
  };

  // Handle forfeit confirmation
  const handleForfeitConfirm = () => {
    console.log('[GamePage] Forfeit confirmed. In multiplayer:', inMultiplayerGame);
    setShowConfirmForfeit(false);

    if (inMultiplayerGame) {
      // In multiplayer, send resign and immediately return to menu
      console.log('[GamePage] Calling mp.resign()');
      mp?.resign();

      // Return to menu immediately - don't wait for server response
      // This prevents getting stuck if connection is lost
      setTimeout(() => {
        if (onReturnToMenu) {
          onReturnToMenu();
        }
      }, 500); // Small delay to allow resign request to be sent
    } else {
      // Local game forfeit
      console.log('[GamePage] Local game forfeit');
      setGameForfeited(true);
      setWinner(forfeitingPlayer === 'White' ? 'Black' : 'White');
      setSelectedOption('forfeit');
    }
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
    { value: 'undo', label: 'Undo', disabled: inMultiplayerGame || !canUndo },
    { value: 'redo', label: 'Redo', disabled: inMultiplayerGame || !canRedo },
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

      {/* Game Over - Forfeit/Checkmate Message */}
      {gameForfeited && (
        <div className="forfeit-overlay">
          <div className="forfeit-message">
            <h2>{selectedOption === 'checkmate' ? 'Checkmate!' : 'Game Forfeited!'}</h2>
            <p className="forfeiting-player">
              {selectedOption === 'checkmate'
                ? `${forfeitingPlayer} has been checkmated.`
                : `${forfeitingPlayer} has forfeited the game.`
              }</p>
            <p className="winner">{winner} Wins!</p>
            <button className="return-to-menu-button" onClick={handleReturnToMenu}>
              Return to Menu
            </button>
          </div>
        </div>
      )}

      <GameMoveLogSidebar />


      <div className="board-timer-wrapper">
        <Board
          flipped={!!(mp && mp.roomId && mp.myColor === 'black')}
          onCheckmate={handleCheckmate}
        />
        {/** If selectedSeconds in the store is non-null we have a timer */}
        {useChessStore().selectedSeconds !== null ? <Timer /> : <div className="Timerfiller"></div>}
      </div>

      <GameOptionsSidebar
        selectedOption={selectedOption}
        onOptionChange={handleOptionChange}
        options={options}
      />

      <InGameMenu open={menuOpen} onClose={() => {
        // close menu
        setMenuOpen(false);
        // resume timer only when a timer is configured
        if (selectedSeconds !== null) setRunning(true);
      }}>
        {menuMode === 'result' ? <InGameMenuResult message={menuMessage ?? ''} /> : <InGameMenuPause />}
      </InGameMenu>
    </div>
  );
}
