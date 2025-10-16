import { Color } from '../types';

// Shared DTOs sent to clients (REST or Socket). Keep minimal and stable.

export interface MoveDto {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
}

export interface GameOverDto {
  reason: string;
  winner?: Color;
}

export interface GameStateDto {
  roomId: string;
  activeColor: Color;
  moves: MoveDto[];
  gameOver?: GameOverDto;
}

// Socket events
export interface JoinedDto {
  roomId: string;
  color: Color;
  state: GameStateDto;
}

export interface MoveAcceptedDto {
  state: GameStateDto;
  lastMove: MoveDto;
}

export interface OpponentJoinedDto {
  color: Color;
}

export interface ErrorMessageDto {
  message: string;
}
