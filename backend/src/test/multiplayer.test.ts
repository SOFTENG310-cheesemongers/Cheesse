/**
 * Integration tests for multiplayer socket.io game flow
 * Tests room creation, joining, moves, resign, and disconnect
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server as SocketIOServer } from 'socket.io';
import { io as SocketIOClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';
import { setupSocketHandlers } from '../main/sockets/lobby';
import { rooms } from '../main/state/rooms';

describe('Multiplayer Socket Integration', () => {
  let ioServer: SocketIOServer;
  let httpServer: ReturnType<typeof createServer>;
  let serverPort: number;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;

  beforeEach(async () => {
    // Clear all rooms
    rooms.clear();

    // Create HTTP server and Socket.IO server
    httpServer = createServer();
    ioServer = new SocketIOServer(httpServer, {
      cors: { origin: '*' },
    });
    
    setupSocketHandlers(ioServer);

    // Listen on random available port
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const address = httpServer.address();
        if (address && typeof address === 'object') {
          serverPort = address.port;
          resolve();
        }
      });
    });
  });

  afterEach(() => {
    // Disconnect clients
    if (clientSocket1?.connected) clientSocket1.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
    
    // Close server
    ioServer.close();
    httpServer.close();
    
    // Clear rooms
    rooms.clear();
  });

  describe('Room Creation', () => {
    it('should create a room and return room details', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (response: any) => {
            expect(response).toHaveProperty('roomId');
            expect(response).toHaveProperty('color');
            expect(response).toHaveProperty('state');
            expect(response.color).toBe('white');
            expect(response.state.activeColor).toBe('white');
            expect(response.state.moves).toEqual([]);
            resolve();
          });
        });
      });
    });

    it('should create a room with preferred black color', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'black' }, (response: any) => {
            expect(response.color).toBe('black');
            expect(rooms.get(response.roomId)?.players.black).toBe(clientSocket1.id);
            resolve();
          });
        });
      });
    });

    it('should create a room without preferred color', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', {}, (response: any) => {
            expect(response).toHaveProperty('roomId');
            expect(response).toHaveProperty('color');
            expect(['white', 'black']).toContain(response.color);
            resolve();
          });
        });
      });
    });
  });

  describe('Joining Rooms', () => {
    it('should allow second player to join room', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            // Second player joins
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, (joinResponse: any) => {
                expect(joinResponse).toHaveProperty('roomId');
                expect(joinResponse).toHaveProperty('color');
                expect(joinResponse.roomId).toBe(roomId);
                expect(joinResponse.color).toBe('black');
                resolve();
              });
            });
          });
        });
      });
    });

    it('should emit opponentJoined to first player when second joins', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            // Listen for opponent joined
            clientSocket1.on('opponentJoined', (payload: any) => {
              expect(payload).toHaveProperty('opponentColor');
              expect(payload.opponentColor).toBe('black');
              resolve();
            });
            
            // Second player joins
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId });
            });
          });
        });
      });
    });

    it('should reject joining non-existent room', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('joinRoom', { roomId: 'FAKE99' }, (response: any) => {
            expect(response).toHaveProperty('error');
            expect(response.error).toBe('room_not_found');
            resolve();
          });
        });
      });
    });

    it('should reject joining full room', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            // Second player joins
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // Third player tries to join (should fail)
                const clientSocket3 = SocketIOClient(`http://localhost:${serverPort}`);
                clientSocket3.on('connect', () => {
                  clientSocket3.emit('joinRoom', { roomId }, (response: any) => {
                    expect(response).toHaveProperty('error');
                    expect(response.error).toBe('room_full');
                    clientSocket3.disconnect();
                    resolve();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Making Moves', () => {
    it('should allow white player to make first move', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // White makes move
                clientSocket1.emit('makeMove', {
                  roomId,
                  from: 'e2',
                  to: 'e4',
                  piece: 'pawn_white'
                });
                
                clientSocket1.on('moveAccepted', (payload: any) => {
                  expect(payload).toHaveProperty('state');
                  expect(payload).toHaveProperty('lastMove');
                  expect(payload.state.activeColor).toBe('black');
                  expect(payload.state.moves).toHaveLength(1);
                  expect(payload.lastMove.from).toBe('e2');
                  expect(payload.lastMove.to).toBe('e4');
                  resolve();
                });
              });
            });
          });
        });
      });
    });

    it('should broadcast move to both players', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                let receivedCount = 0;
                const checkDone = () => {
                  receivedCount++;
                  if (receivedCount === 2) resolve();
                };
                
                clientSocket1.on('moveAccepted', () => checkDone());
                clientSocket2.on('moveAccepted', () => checkDone());
                
                // White makes move
                clientSocket1.emit('makeMove', {
                  roomId,
                  from: 'e2',
                  to: 'e4',
                  piece: 'pawn_white'
                });
              });
            });
          });
        });
      });
    });

    it('should reject move when not player turn', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // Black tries to move first (should fail)
                clientSocket2.emit('makeMove', {
                  roomId,
                  from: 'e7',
                  to: 'e5',
                  piece: 'pawn_black'
                });
                
                clientSocket2.on('moveRejected', (payload: any) => {
                  expect(payload).toHaveProperty('reason');
                  expect(payload.reason).toBe('not_your_turn');
                  resolve();
                });
              });
            });
          });
        });
      });
    });

    it('should alternate turns after each move', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // Track how many moveAccepted events clientSocket2 receives
                let movesReceived = 0;
                
                // White moves
                clientSocket1.emit('makeMove', {
                  roomId,
                  from: 'e2',
                  to: 'e4',
                  piece: 'pawn_white'
                });
                
                clientSocket1.once('moveAccepted', (payload1: any) => {
                  expect(payload1.state.activeColor).toBe('black');
                  
                  // Black moves
                  clientSocket2.emit('makeMove', {
                    roomId,
                    from: 'e7',
                    to: 'e5',
                    piece: 'pawn_black'
                  });
                });
                
                // ClientSocket2 receives moveAccepted for BOTH moves (white's and black's)
                // We need to wait for the second one
                clientSocket2.on('moveAccepted', (payload: any) => {
                  movesReceived++;
                  
                  if (movesReceived === 1) {
                    // First move (white's) - activeColor should now be black
                    expect(payload.state.activeColor).toBe('black');
                    expect(payload.state.moves).toHaveLength(1);
                  } else if (movesReceived === 2) {
                    // Second move (black's) - activeColor should now be white
                    expect(payload.state.activeColor).toBe('white');
                    expect(payload.state.moves).toHaveLength(2);
                    resolve();
                  }
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Resignation', () => {
    it('should allow player to resign and broadcast gameOver', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // White resigns
                clientSocket1.emit('resign', { roomId });
                
                clientSocket1.on('gameOver', (payload: any) => {
                  expect(payload).toHaveProperty('reason');
                  expect(payload).toHaveProperty('winner');
                  expect(payload.reason).toBe('resign');
                  expect(payload.winner).toBe('black');
                  resolve();
                });
              });
            });
          });
        });
      });
    });

    it('should broadcast gameOver to both players on resign', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Test timeout')), 3000);
        const cleanup = () => clearTimeout(timeout);
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                let receivedCount = 0;
                const checkDone = () => {
                  receivedCount++;
                  if (receivedCount === 2) {
                    cleanup();
                    resolve();
                  }
                };
                
                clientSocket1.once('gameOver', (payload: any) => {
                  expect(payload.winner).toBe('white');
                  checkDone();
                });
                
                clientSocket2.once('gameOver', (payload: any) => {
                  expect(payload.winner).toBe('white');
                  checkDone();
                });
                
                // Black resigns (white wins)
                clientSocket2.emit('resign', { roomId });
              });
            });
          });
        });
      });
    });
  });

  describe('Disconnection', () => {
    it('should emit opponentDisconnected when player leaves', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                // Listen for disconnect
                clientSocket1.on('opponentDisconnected', () => {
                  resolve();
                });
                
                // Disconnect second player
                clientSocket2.disconnect();
              });
            });
          });
        });
      });
    });

    it('should remove empty rooms after both players disconnect', async () => {
      clientSocket1 = SocketIOClient(`http://localhost:${serverPort}`);
      
      await new Promise<void>((resolve) => {
        clientSocket1.on('connect', () => {
          clientSocket1.emit('createRoom', { preferredColor: 'white' }, (createResponse: any) => {
            const roomId = createResponse.roomId;
            
            clientSocket2 = SocketIOClient(`http://localhost:${serverPort}`);
            clientSocket2.on('connect', () => {
              clientSocket2.emit('joinRoom', { roomId }, () => {
                
                expect(rooms.has(roomId)).toBe(true);
                
                // Disconnect both
                clientSocket1.disconnect();
                clientSocket2.disconnect();
                
                // Wait for cleanup
                setTimeout(() => {
                  expect(rooms.has(roomId)).toBe(false);
                  resolve();
                }, 100);
              });
            });
          });
        });
      });
    });
  });
});
