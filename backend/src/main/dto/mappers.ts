import { GameState } from '../types';
import { GameStateDto, MoveDto } from './types';

export function toMoveDto(m: { from: string; to: string; promotion?: string; piece?: string }): MoveDto {
  return { from: m.from, to: m.to, promotion: m.promotion, piece: m.piece };
}

export function toGameStateDto(state: GameState): GameStateDto {
  return {
    roomId: state.roomId,
    activeColor: state.activeColor,
    moves: state.moves.map(toMoveDto),
    gameOver: state.gameOver ? { reason: state.gameOver.reason, winner: state.gameOver.winner } : undefined,
  };
}
