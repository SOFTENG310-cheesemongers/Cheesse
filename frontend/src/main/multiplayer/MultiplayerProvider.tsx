import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { MultiplayerClient } from './client';
import type { Color, GameStateDto, JoinedDto, MoveDto } from './types';

interface GameOverState {
  reason: string;
  winner?: Color;
}

interface MultiplayerState {
  connected: boolean;
  connecting: boolean; // Track if actively trying to connect
  connectionError?: string; // Last connection error message
  roomId?: string;
  myColor?: Color;
  opponentColor?: Color;
  opponentConnected: boolean;
  gameStarted: boolean;
  gameOver?: GameOverState;
  state?: GameStateDto;
  lastMove?: MoveDto;
  lastMoveSeq: number;
  createRoom: (preferredColor?: Color) => Promise<JoinedDto>;
  joinRoom: (roomId: string) => Promise<JoinedDto | { error: string }>;
  makeMove: (from: string, to: string, piece?: string, promotion?: string) => void;
  resign: () => void;
  startGame: () => void;
  connect: () => void;
  disconnect: () => void;
  resetGameState: () => void; // Reset room/game state for new game
}

const Ctx = createContext<MultiplayerState | null>(null);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<MultiplayerClient | null>(null);
  if (!clientRef.current) clientRef.current = new MultiplayerClient();
  const client = clientRef.current;

  const [connected, setConnected] = useState<boolean>(client.isConnected());
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string>();
  const [roomId, setRoomId] = useState<string>();
  const [myColor, setMyColor] = useState<Color>();
  const [opponentColor, setOpponentColor] = useState<Color>();
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState<GameOverState | undefined>(undefined);
  const [state, setState] = useState<GameStateDto>();
  const [lastMove, setLastMove] = useState<MoveDto | undefined>(undefined);
  const [lastMoveSeq, setLastMoveSeq] = useState(0);

  // Debug: log on mount
  React.useEffect(() => {
    console.log('[MultiplayerProvider] Provider mounted. Connected:', client.isConnected());
    return () => console.log('[MultiplayerProvider] Provider unmounted');
  }, []);

  // Debug: log connection state changes
  React.useEffect(() => {
    console.log('[MultiplayerProvider] Connection state changed. Connected:', connected, 'Connecting:', connecting);
  }, [connected, connecting]);

  const createRoom = async (preferredColor?: Color) => {
    console.log('[MultiplayerProvider] Creating room with preferred color:', preferredColor);
    console.log('[MultiplayerProvider] Client connected?', client.isConnected());
    const j = await client.createRoom(preferredColor);
    console.log('[MultiplayerProvider] Room created:', j);
    console.log('[MultiplayerProvider] Client connected after create?', client.isConnected());
    setRoomId(j.roomId);
    setMyColor(j.color);
    setState(j.state);
    // Force update connected state
    setConnected(client.isConnected());
    return j;
  };

  const joinRoom = async (id: string) => {
    console.log('[MultiplayerProvider] Joining room:', id);
    const res = await client.joinRoom(id);
    console.log('[MultiplayerProvider] Join result:', res);
    console.log('[MultiplayerProvider] Client connected after join?', client.isConnected());
    if ('error' in res) return res;
    setRoomId(res.roomId);
    setMyColor(res.color);
    setState(res.state);
    // Force update connected state
    setConnected(client.isConnected());
    return res;
  };

  const connect = useCallback(() => {
    setConnecting(true);
    setConnectionError(undefined);
    client.connect(); // Now handles enabling reconnection internally
  }, [client]);

  const disconnectClient = useCallback(() => {
    setConnecting(false);
    client.disconnect(); // Now handles disabling reconnection internally
  }, [client]);

  // register socket event handlers once
  React.useEffect(() => {
    const offs: Array<() => void> = [];
    offs.push(client.on('moveAccepted', (payload) => {
      console.log('[MultiplayerProvider] moveAccepted received:', payload);
      console.log('[MultiplayerProvider] New activeColor:', payload.state.activeColor);
      setState(payload.state);
      setLastMove(payload.lastMove);
      setLastMoveSeq((s) => s + 1);
    }));
    offs.push(client.on('moveRejected', (payload) => {
      console.warn('[MultiplayerProvider] moveRejected:', payload.reason);
    }));
    offs.push(client.on('joined', (payload) => {
      setRoomId(payload.roomId);
      setMyColor(payload.color);
      setState(payload.state);
    }));
    offs.push(client.on('opponentJoined', (payload) => {
      setOpponentColor(payload.opponentColor);
      setOpponentConnected(true);
    }));
    offs.push(client.on('opponentDisconnected', () => {
      setOpponentConnected(false);
    }));
    offs.push(client.on('gameStarted', () => {
      setGameStarted(true);
    }));
    offs.push(client.on('gameOver', (payload) => {
      console.log('[MultiplayerProvider] gameOver received:', payload);
      setGameOver(payload);
    }));
    offs.push(client.onNative('connect', () => {
      console.log('[MultiplayerProvider] Socket CONNECTED event fired');
      setConnected(true);
      setConnecting(false);
      setConnectionError(undefined);
    }));
    offs.push(client.onNative('disconnect', () => {
      console.log('[MultiplayerProvider] Socket DISCONNECTED event fired');
      setConnected(false);
      setConnecting(false);
    }));
    offs.push(client.onNative('connect_error', (err: any) => { 
      setConnected(false);
      setConnecting(true); // Still trying to connect
      setConnectionError(err?.message || 'Connection failed');
    }));

    return () => {
      offs.forEach(off => off());
    };
  }, [client]);

  // Force disconnect when provider unmounts to stop any reconnection attempts
  React.useEffect(() => {
    return () => {
      client.disconnect();
    };
  }, [client]);

  const makeMove = (from: string, to: string, piece?: string, promotion?: string) => {
    if (!roomId) {
      console.warn('[MultiplayerProvider] makeMove called but no roomId');
      return;
    }
    console.log('[MultiplayerProvider] Calling makeMove:', { roomId, from, to, piece });
    client.makeMove(roomId, from, to, piece, promotion);
  };

  const resign = () => {
    if (!roomId) {
      console.warn('[MultiplayerProvider] resign called but no roomId');
      return;
    }
    console.log('[MultiplayerProvider] Calling resign for room:', roomId);
    client.resign(roomId);
  };

  const startGame = () => {
    if (!roomId) return;
    client.startGame(roomId);
  };

  const resetGameState = useCallback(() => {
    console.log('[MultiplayerProvider] Resetting game state');
    setRoomId(undefined);
    setMyColor(undefined);
    setOpponentColor(undefined);
    setOpponentConnected(false);
    setGameStarted(false);
    setGameOver(undefined);
    setState(undefined);
    setLastMove(undefined);
    setLastMoveSeq(0);
  }, []);

  const value = useMemo<MultiplayerState>(() => ({
    connected,
    connecting,
    connectionError,
    roomId,
    myColor,
    opponentColor,
    opponentConnected,
    gameStarted,
    gameOver,
    state,
    lastMove,
    lastMoveSeq,
    createRoom,
    joinRoom,
    makeMove,
    resign,
    startGame,
    // transient controls
    connect,
    disconnect: disconnectClient,
    resetGameState,
  }), [connected, connecting, connectionError, roomId, myColor, opponentColor, opponentConnected, gameStarted, gameOver, state, lastMove, lastMoveSeq, connect, disconnectClient, resetGameState]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMultiplayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return ctx;
}

export function useOptionalMultiplayer() {
  return useContext(Ctx);
}
