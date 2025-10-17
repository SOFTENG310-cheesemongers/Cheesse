import { Server, Socket } from 'socket.io';
import { Color } from '../types';
import { rooms, createRoom, getPlayerColor, getAvailableColor } from '../state/rooms';
import { toGameStateDto } from '../dto/mappers';
import { OpponentJoinedDto, MoveDto, JoinedDto } from '../dto/types';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    // Create a new room via socket (alternative to REST)
    socket.on('createRoom', (payload: { preferredColor?: Color } | undefined, cb?: (data: any) => void) => {
      const state = createRoom(payload?.preferredColor);
      const color: Color = payload?.preferredColor ?? (Math.random() < 0.5 ? 'white' : 'black');
      // Attach creator to their chosen or random color if free
      if (!state.players[color]) state.players[color] = socket.id;
      socket.join(state.roomId);
      const joinedPayload: JoinedDto = { roomId: state.roomId, color, state: toGameStateDto(state) };
      cb?.(joinedPayload);
      socket.emit('roomCreated', joinedPayload);
    });

    // Join an existing room via code
    socket.on('joinRoom', (payload: { roomId: string }, cb?: (data: any) => void) => {
      const room = rooms.get(payload.roomId);
      if (!room) {
        cb?.({ error: 'room_not_found' });
        socket.emit('errorMessage', { message: 'Room not found' });
        return;
      }
      // If this socket is already in the room, return its current color/state
      const myColor = getPlayerColor(room, socket.id);
      if (myColor) {
        // Ensure the socket is in the room (in case of reconnects)
        socket.join(room.roomId);
        const joinedPayload: JoinedDto = { roomId: room.roomId, color: myColor, state: toGameStateDto(room) };
        cb?.(joinedPayload);
        socket.emit('joined', joinedPayload);
        return;
      }

      // Assign remaining color, prefer reserved host color for the very first joiner
      let joiningPlayerColor = getAvailableColor(room);
      if (!room.players.white && !room.players.black && room.reservedColor) {
        joiningPlayerColor = room.reservedColor;
      }
      if (!joiningPlayerColor) {
        cb?.({ error: 'room_full' });
        socket.emit('errorMessage', { message: 'Room is full' });
        return;
      }
      room.players[joiningPlayerColor] = socket.id;
      socket.join(room.roomId);
      const joinedPayload: JoinedDto = { roomId: room.roomId, color: joiningPlayerColor, state: toGameStateDto(room) };
      cb?.(joinedPayload);
      socket.emit('joined', joinedPayload);

      // Notify the other player in the room of the opponent's color
      const opponentPayload: OpponentJoinedDto = { opponentColor: joiningPlayerColor };
      socket.to(room.roomId).emit('opponentJoined', opponentPayload);
    });

    socket.on('makeMove', (payload: { roomId: string; from: string; to: string; promotion?: string; piece?: string }) => {
      const room = rooms.get(payload.roomId);
      if (!room) {
        socket.emit('moveRejected', { reason: 'room_not_found' });
        return;
      }
      const playerColor: Color | undefined = Object.entries(room.players).find(([, id]) => id === socket.id)?.[0] as Color | undefined;
      if (!playerColor) {
        socket.emit('moveRejected', { reason: 'not_in_room' });
        return;
      }
      if (playerColor !== room.activeColor) {
        socket.emit('moveRejected', { reason: 'not_your_turn' });
        return;
      }
      // TODO: validate moves using server chess logic
      room.moves.push({ from: payload.from, to: payload.to, promotion: payload.promotion, piece: payload.piece });
      room.activeColor = room.activeColor === 'white' ? 'black' : 'white';
      const lastMove: MoveDto = { from: payload.from, to: payload.to, promotion: payload.promotion, piece: payload.piece };
      io.to(room.roomId).emit('moveAccepted', {
        state: toGameStateDto(room),
        lastMove
      });
    });

    socket.on('resign', (payload: { roomId: string }) => {
      const room = rooms.get(payload.roomId);
      if (!room) return;
      const color = (Object.entries(room.players).find(([, id]) => id === socket.id)?.[0] as Color | undefined);
      if (!color) {
        socket.emit('errorMessage', { message: 'Not in room' });
        return;
      }
      const winner: Color = color === 'white' ? 'black' : 'white';
      room.gameOver = { reason: 'resign', winner };
      io.to(room.roomId).emit('gameOver', room.gameOver);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const [roomId, room] of rooms.entries()) {
        const wasInRoom = Object.values(room.players).includes(socket.id);
        if (wasInRoom) {
          if (room.players.white === socket.id) delete room.players.white;
          if (room.players.black === socket.id) delete room.players.black;
          io.to(roomId).emit('opponentDisconnected');
          if (!room.players.white && !room.players.black) {
            rooms.delete(roomId);
          }
        }
      }
    });
  });
}
