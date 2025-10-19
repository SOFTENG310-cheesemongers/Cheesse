import { useChessStore } from "../../../app/chessStore";
import Referee from "../../referee/Referee";

interface GameStatusProps {
  board: string[][];
}

export const GameStatus = ({ board }: GameStatusProps) => {
  const { isWhiteTurn } = useChessStore();
  
  // Get game status using Referee
  const referee = new Referee();
  const gameStatus = referee.getGameStatus(board, isWhiteTurn);
  
  const getStatusMessage = () => {
    switch (gameStatus) {
      case "check":
        return `${isWhiteTurn ? "White" : "Black"} is in Check!`;
      case "checkmate":
        return `Checkmate! ${isWhiteTurn ? "Black" : "White"} wins!`;
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
      case "checkmate":
        return "#ff3333"; // Darker red for checkmate
      case "stalemate":
        return "#ffa500"; // Orange for stalemate
      default:
        return "#4CAF50"; // Green for normal play
    }
  };
  
  return (
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
  );
};
