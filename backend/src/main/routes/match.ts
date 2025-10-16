import { Router, Request, Response } from 'express';
import { Color } from '../types';
import { createRoom, rooms } from '../state/rooms';

export const matchRouter = Router();

// POST /match/create -> returns { gameId, code }
matchRouter.post('/create', (req: Request, res: Response) => {
  const preferredColor = (req.body?.preferredColor as Color | undefined) ?? undefined;
  const state = createRoom(preferredColor);
  res.status(201).json({ gameId: state.roomId, code: state.roomId, color: preferredColor ?? null });
});

// POST /match/join -> body: { code }
matchRouter.post('/join', (req: Request, res: Response) => {
  const code: string | undefined = req.body?.code;
  if (!code) return res.status(400).json({ error: 'missing_code' });
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'room_not_found' });
  const whiteTaken = Boolean(room.players.white);
  const blackTaken = Boolean(room.players.black);
  if (whiteTaken && blackTaken) return res.status(409).json({ error: 'room_full' });
  res.json({ gameId: room.roomId, code: room.roomId, slots: { white: !whiteTaken, black: !blackTaken } });
});
