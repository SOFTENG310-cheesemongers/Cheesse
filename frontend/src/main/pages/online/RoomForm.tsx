import { useState } from 'react';
import type { Color } from '../../multiplayer/types';
import './RoomForm.css';

export interface RoomFormProps {
  connected: boolean;
  onCreateRoom: (preferredColor: Color) => Promise<void>;
  onJoinRoom: (roomId: string) => Promise<void>;
}

/**
 * RoomForm component - Create or join a multiplayer room.
 * @param {RoomFormProps} props - The room form props.
 * @returns {JSX.Element} - The rendered room form component.
 */
export default function RoomForm({ connected, onCreateRoom, onJoinRoom }: RoomFormProps) {
  const [preferred, setPreferred] = useState<Color>('white');
  const [roomId, setRoomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await onCreateRoom(preferred);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      await onJoinRoom(roomId.trim());
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="room-form">
      <div className="room-form-panel">
        <h3 className="room-form-title">Create Room</h3>
        <div className="room-form-radio-row">
          <label className="room-form-radio">
            <input
              type="radio"
              checked={preferred === 'white'}
              onChange={() => setPreferred('white')}
            />
            White
          </label>
          <label className="room-form-radio">
            <input
              type="radio"
              checked={preferred === 'black'}
              onChange={() => setPreferred('black')}
            />
            Black
          </label>
        </div>
        <button
          className="option-button room-form-action"
          onClick={handleCreate}
          disabled={creating || !connected}
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div className="room-form-panel">
        <h3 className="room-form-title">Join Room</h3>
        <input
          className="room-form-input"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />
        <button
          className="option-button room-form-action"
          onClick={handleJoin}
          disabled={!roomId || joining || !connected}
        >
          {joining ? 'Joining...' : 'Join'}
        </button>
      </div>
    </div>
  );
}
