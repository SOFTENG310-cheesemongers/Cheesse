// Shared backend types for the multiplayer server

export type Color = 'white' | 'black';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
}

export interface GameOver {
  reason: string;
  winner?: Color;
}

export interface GameState {
  roomId: string;
  players: Partial<Record<Color, string>>; // color -> socketId
  activeColor: Color;
  moves: Move[];
  gameOver?: GameOver;
  reservedColor?: Color;
}
