export type Color = 'white' | 'black';

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

export interface JoinedDto {
  roomId: string;
  color: Color;
  state: GameStateDto;
}

export interface OpponentJoinedDto {
  opponentColor: Color;
}

export interface MoveAcceptedDto {
  state: GameStateDto;
  lastMove: MoveDto;
}

export interface OpponentJoinedDto {
  opponentColor: Color;
}

export interface GameStartedDto {
  roomId: string;
}

export interface ErrorMessageDto {
  message: string;
}
