import { io, Socket } from 'socket.io-client';
import type { JoinedDto, MoveAcceptedDto, OpponentJoinedDto, ErrorMessageDto } from './types';

export type SocketEvents = {
  roomCreated: (payload: JoinedDto) => void;
  joined: (payload: JoinedDto) => void;
  opponentJoined: (payload: OpponentJoinedDto) => void;
  gameStarted: (payload: { roomId: string }) => void;
  opponentDisconnected: () => void;
  moveAccepted: (payload: MoveAcceptedDto) => void;
  moveRejected: (payload: { reason: string }) => void;
  gameOver: (payload: any) => void;
  errorMessage: (payload: ErrorMessageDto) => void;
};

export interface MultiplayerClientOptions {
  baseUrl?: string; // e.g., http://localhost:8080
  timeoutMs?: number; // request timeout for create/join callbacks
}

export class MultiplayerClient {
  private socket: Socket;
  private timeoutMs: number;

  constructor(opts: MultiplayerClientOptions = {}) {
    const url = opts.baseUrl || (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8080';
    this.timeoutMs = opts.timeoutMs ?? 5000;
    this.socket = io(url, {
      autoConnect: false, // Don't connect immediately - wait for explicit connect() call
      reconnection: true, // Allow reconnection (we'll control it via connect/disconnect)
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 2000,
    });
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  connect() {
    // Re-enable reconnection when explicitly connecting from UI (in case it was disabled)
    const mgr = (this.socket as any).io;
    if (mgr && mgr.opts) {
      mgr.opts.reconnection = true;
      mgr.opts.reconnectionAttempts = Infinity;
      mgr.opts.reconnectionDelay = 1000;
      mgr.opts.reconnectionDelayMax = 5000;
      mgr.reconnecting = false; // Clear any stale reconnecting flag
    } else {
      console.warn('[MultiplayerClient] Could not access socket manager!');
    }
    if (!this.socket.connected) {
      console.log('[MultiplayerClient] Connecting to server...');
      this.socket.connect();
    }
  }

  // Wait for connection to be established
  async waitForConnection(timeoutMs: number = 5000): Promise<void> {
    if (this.socket.connected) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeoutMs);
      
      const onConnect = () => {
        clearTimeout(timeout);
        this.socket.off('connect', onConnect);
        this.socket.off('connect_error', onError);
        resolve();
      };
      
      const onError = (err: any) => {
        clearTimeout(timeout);
        this.socket.off('connect', onConnect);
        this.socket.off('connect_error', onError);
        reject(err);
      };
      
      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onError);
      
      // Start connection if not already connecting
      if (!this.socket.connected) {
        this.connect();
      }
    });
  }

  disconnect() {
    // Forcibly close the socket to stop all reconnection attempts
    const mgr = (this.socket as any).io;
    if (mgr) {
      // Disable reconnection
      if (mgr.opts) {
        mgr.opts.reconnection = false;
        mgr.opts.reconnectionAttempts = 0;
      }
      // Clear any pending reconnection timers
      if (mgr.reconnecting) {
        mgr.reconnecting = false;
      }
      if (mgr.skipReconnect) {
        mgr.skipReconnect();
      }
      // Close the engine/transport
      if (mgr.engine && typeof mgr.engine.close === 'function') {
        mgr.engine.close();
      }
    } else {
      console.warn('[MultiplayerClient] Could not access socket manager!');
    }
    
    // Disconnect the socket itself
    if (this.socket.connected) {
      this.socket.disconnect();
    } else {
      this.socket.close();
    }
  }

  // Subscribe to typed events we expect from the server
  on<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]) {
    this.socket.on(event as string, handler as any);
    return () => this.socket.off(event as string, handler as any);
  }

  // Subscribe to lower-level native socket events (connect/disconnect/connect_error)
  onNative(event: string, handler: (...args: any[]) => void) {
    this.socket.on(event, handler);
    return () => this.socket.off(event, handler as any);
  }

  private withTimeout<T>(p: Promise<T>) {
    const t = new Promise<T>((_res, rej) => setTimeout(() => rej(new Error('timeout')), this.timeoutMs));
    return Promise.race([p, t]);
  }

  async createRoom(preferredColor?: 'white' | 'black') {
    // Wait for connection if not already connected
    if (!this.isConnected()) {
      console.log('[MultiplayerClient] Not connected, waiting for connection...');
      await this.waitForConnection();
    }
    
    console.log('[MultiplayerClient] Creating room...');
    const p = new Promise<JoinedDto>((resolve, reject) => {
      this.socket.emit('createRoom', { preferredColor }, (payload: JoinedDto | { error: string }) => {
        if (!payload) return reject(new Error('no_response'));
        if ((payload as any).error) return reject(new Error((payload as any).error));
        resolve(payload as JoinedDto);
      });
    });
    return this.withTimeout(p);
  }

  async joinRoom(roomId: string) {
    // Wait for connection if not already connected
    if (!this.isConnected()) {
      console.log('[MultiplayerClient] Not connected, waiting for connection...');
      await this.waitForConnection();
    }
    
    console.log('[MultiplayerClient] Joining room:', roomId);
    const p = new Promise<JoinedDto | { error: string }>((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId }, (payload: any) => {
        if (!payload) return reject(new Error('no_response'));
        resolve(payload);
      });
    });
    return this.withTimeout(p);
  }

  makeMove(roomId: string, from: string, to: string, piece?: string, promotion?: string) {
    this.socket.emit('makeMove', { roomId, from, to, piece, promotion });
  }

  resign(roomId: string) {
    this.socket.emit('resign', { roomId });
  }

  startGame(roomId: string) {
    this.socket.emit('startGame', { roomId });
  }
}
