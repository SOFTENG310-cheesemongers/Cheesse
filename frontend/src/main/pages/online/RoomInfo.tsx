import { useState } from 'react';
import type { Color } from '../../multiplayer/types';
import './RoomInfo.css';

export interface RoomInfoProps {
  roomId: string;
  myColor?: Color;
  opponentConnected?: boolean;
  isHost?: boolean;
  onStartGame?: () => void;
}

/**
 * RoomInfo component - Displays room ID with copy-to-clipboard functionality.
 * @param {RoomInfoProps} props - The room info props.
 * @returns {JSX.Element} - The rendered room info component.
 */
export default function RoomInfo({ roomId, myColor, opponentConnected, isHost, onStartGame }: RoomInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: create temporary input and select
        const input = document.createElement('input');
        input.value = roomId;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  return (
    <div className="room-info">
      <div className="room-info-panel">
        <h3 className="room-info-title">Room Created</h3>
        
        <div className="room-info-field">
          <label className="room-info-label">Room ID:</label>
          <div className="room-info-row">
            <code className="room-info-code">{roomId}</code>
            <button 
              className="room-info-copy-btn"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {myColor && (
          <div className="room-info-field">
            <label className="room-info-label">Your Color:</label>
            <span className="room-info-value">{myColor.charAt(0).toUpperCase() + myColor.slice(1)}</span>
          </div>
        )}

        {opponentConnected !== undefined && (
          <div className="room-info-field">
            <label className="room-info-label">Opponent:</label>
            <span className={`room-info-status ${opponentConnected ? 'connected' : 'waiting'}`}>
              {opponentConnected ? 'Connected' : 'Waiting...'}
            </span>
          </div>
        )}

        {isHost && onStartGame && (
          <div className="room-info-field">
            <button
              className="room-info-start-btn"
              onClick={onStartGame}
              disabled={!opponentConnected}
            >
              {opponentConnected ? 'Start Game' : 'Waiting for opponent...'}
            </button>
          </div>
        )}

        {!isHost && (
          <div className="room-info-field">
            <span className="room-info-waiting-text">Waiting for host to start...</span>
          </div>
        )}
      </div>
    </div>
  );
}
