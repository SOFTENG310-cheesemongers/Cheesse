import { randomInt } from 'crypto';
import { Color, GameState } from '../types';

// In-memory room state; can be swapped for Redis/DB later
export const rooms = new Map<string, GameState>();

export function generateRoomId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
  let id = '';
  // Use crypto.randomInt for cryptographically secure random room IDs
  for (let i = 0; i < 6; i++) id += alphabet[randomInt(0, alphabet.length)];
  return id;
}

export function createRoom(preferredColor?: Color): GameState {
  const roomId = generateRoomId();
  const state: GameState = {
    roomId,
    players: {},
    activeColor: 'white',
    moves: [],
    reservedColor: preferredColor,
  };
  rooms.set(roomId, state);
  return state;
}

export function getAvailableColor(room: GameState): Color | undefined {
  const whiteTaken = Boolean(room.players.white);
  const blackTaken = Boolean(room.players.black);
  if (!whiteTaken) return 'white';
  if (!blackTaken) return 'black';
  return undefined;
}

export function getPlayerColor(room: GameState, socketId: string): Color | undefined {
  if (room.players.white === socketId) return 'white';
  if (room.players.black === socketId) return 'black';
  return undefined;
}
