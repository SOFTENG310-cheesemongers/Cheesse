import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { MultiplayerClient } from './client';
import type { Color, GameStateDto, JoinedDto, MoveDto } from './types';

interface MultiplayerState {
  connected: boolean;
  connecting: boolean; // Track if actively trying to connect
  connectionError?: string; // Last connection error message
  roomId?: string;
  myColor?: Color;
  opponentColor?: Color;
  opponentConnected: boolean;
  gameStarted: boolean;
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
  const [state, setState] = useState<GameStateDto>();
  const [lastMove, setLastMove] = useState<MoveDto | undefined>(undefined);
  const [lastMoveSeq, setLastMoveSeq] = useState(0);

  const createRoom = async (preferredColor?: Color) => {
    const j = await client.createRoom(preferredColor);
    setRoomId(j.roomId);
    setMyColor(j.color);
    setState(j.state);
    return j;
  };

  const joinRoom = async (id: string) => {
    const res = await client.joinRoom(id);
    if ('error' in res) return res;
    setRoomId(res.roomId);
    setMyColor(res.color);
    setState(res.state);
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
      setState(payload.state);
      setLastMove(payload.lastMove);
      setLastMoveSeq((s) => s + 1);
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
    offs.push(client.onNative('connect', () => { 
      setConnected(true);
      setConnecting(false);
      setConnectionError(undefined);
    }));
    offs.push(client.onNative('disconnect', () => {
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
    if (!roomId) return;
    client.makeMove(roomId, from, to, piece, promotion);
  };

  const resign = () => {
    if (!roomId) return;
    client.resign(roomId);
  };

  const startGame = () => {
    if (!roomId) return;
    client.startGame(roomId);
  };

  const value = useMemo<MultiplayerState>(() => ({
    connected,
    connecting,
    connectionError,
    roomId,
    myColor,
    opponentColor,
    opponentConnected,
    gameStarted,
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
  }), [connected, connecting, connectionError, roomId, myColor, opponentColor, opponentConnected, gameStarted, state, lastMove, lastMoveSeq, connect, disconnectClient]);

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
