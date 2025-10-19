import { useChessStore } from "../../../app/chessStore";
import Referee from "../../referee/Referee";
import { useEffect, useState, useRef } from 'react';
import { CheckNotification } from '../notifications/CheckNotification';

interface GameStatusProps {
  board: (string | undefined)[][];
  onCheckmate?: (losingPlayer: 'White' | 'Black') => void;
}

export const GameStatus = ({ board, onCheckmate }: GameStatusProps) => {
  const { isWhiteTurn } = useChessStore();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const previousGameStatusRef = useRef<string>('normal');

  // Get game status using Referee
  const referee = new Referee();
  const gameStatus = referee.getGameStatus(board, isWhiteTurn);

  // Check for state changes and trigger notifications
  useEffect(() => {
    const previousStatus = previousGameStatusRef.current;

    // Handle checkmate - trigger forfeit system instead of notification
    if (gameStatus === 'checkmate' && previousStatus !== 'checkmate') {
      const losingPlayer = isWhiteTurn ? "White" : "Black";
      console.log(`Checkmate detected! ${losingPlayer} has been checkmated.`);

      // Trigger the forfeit callback if provided
      if (onCheckmate) {
        onCheckmate(losingPlayer);
      }
    }
    // Handle check - show notification
    else if (gameStatus === 'check' && previousStatus !== 'check') {
      const playerInCheck = isWhiteTurn ? "White" : "Black";
      console.log(`Check detected! ${playerInCheck} is in check.`);
      setNotificationMessage(`${playerInCheck} is in Check!`);
      setShowNotification(true);
    }

    // Update the previous status
    previousGameStatusRef.current = gameStatus;
  }, [gameStatus, isWhiteTurn, onCheckmate]); // Need isWhiteTurn to determine correct player

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case "check":
        return `${isWhiteTurn ? "White" : "Black"} is in Check!`;
      case "stalemate":
        return "Stalemate! Game is a draw.";
      default:
        return `${isWhiteTurn ? "White" : "Black"}'s turn`;
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case "check":
        return "#ff6b6b"; // Red for check
      case "stalemate":
        return "#ffa500"; // Orange for stalemate
      default:
        return "#4CAF50"; // Green for normal play
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 100,
        border: `2px solid ${getStatusColor()}`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ color: getStatusColor() }}>
          {getStatusMessage()}
        </div>
      </div>

      <CheckNotification
        isVisible={showNotification}
        message={notificationMessage}
        onClose={handleCloseNotification}
      />
    </>
  );
};
