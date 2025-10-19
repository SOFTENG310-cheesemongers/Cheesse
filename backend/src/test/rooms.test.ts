/**
 * Tests for room state management functions
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { rooms, generateRoomId, createRoom, getAvailableColor, getPlayerColor } from '../main/state/rooms';

describe('Room Management', () => {
  beforeEach(() => {
    // Clear all rooms before each test
    rooms.clear();
  });

  describe('generateRoomId', () => {
    it('should generate a 6-character room ID', () => {
      const roomId = generateRoomId();
      expect(roomId).toHaveLength(6);
    });

    it('should only contain uppercase letters and numbers (no ambiguous chars)', () => {
      const roomId = generateRoomId();
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
      expect(roomId).toMatch(validChars);
    });

    it('should not contain ambiguous characters (I, O, 0, 1)', () => {
      // Run multiple times to increase confidence
      for (let i = 0; i < 100; i++) {
        const roomId = generateRoomId();
        expect(roomId).not.toContain('I');
        expect(roomId).not.toContain('O');
        expect(roomId).not.toContain('0');
        expect(roomId).not.toContain('1');
      }
    });

    it('should generate unique room IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateRoomId());
      }
      // Should generate at least 999 unique IDs out of 1000
      expect(ids.size).toBeGreaterThan(990);
    });
  });

  describe('createRoom', () => {
    it('should create a room with default settings', () => {
      const room = createRoom();
      
      expect(room).toHaveProperty('roomId');
      expect(room.roomId).toHaveLength(6);
      expect(room.players).toEqual({});
      expect(room.activeColor).toBe('white');
      expect(room.moves).toEqual([]);
      expect(room.reservedColor).toBeUndefined();
    });

    it('should add the room to the rooms map', () => {
      const room = createRoom();
      expect(rooms.has(room.roomId)).toBe(true);
      expect(rooms.get(room.roomId)).toEqual(room);
    });

    it('should create a room with reserved color (white)', () => {
      const room = createRoom('white');
      
      expect(room.reservedColor).toBe('white');
      expect(room.players).toEqual({});
    });

    it('should create a room with reserved color (black)', () => {
      const room = createRoom('black');
      
      expect(room.reservedColor).toBe('black');
      expect(room.players).toEqual({});
    });

    it('should create multiple rooms with unique IDs', () => {
      const room1 = createRoom();
      const room2 = createRoom();
      const room3 = createRoom();
      
      expect(room1.roomId).not.toBe(room2.roomId);
      expect(room2.roomId).not.toBe(room3.roomId);
      expect(rooms.size).toBe(3);
    });
  });

  describe('getAvailableColor', () => {
    it('should return white if no players', () => {
      const room = createRoom();
      expect(getAvailableColor(room)).toBe('white');
    });

    it('should return black if white is taken', () => {
      const room = createRoom();
      room.players.white = 'socket-123';
      expect(getAvailableColor(room)).toBe('black');
    });

    it('should return white if black is taken', () => {
      const room = createRoom();
      room.players.black = 'socket-456';
      expect(getAvailableColor(room)).toBe('white');
    });

    it('should return undefined if both colors are taken', () => {
      const room = createRoom();
      room.players.white = 'socket-123';
      room.players.black = 'socket-456';
      expect(getAvailableColor(room)).toBeUndefined();
    });
  });

  describe('getPlayerColor', () => {
    it('should return white for white player socket ID', () => {
      const room = createRoom();
      room.players.white = 'socket-123';
      expect(getPlayerColor(room, 'socket-123')).toBe('white');
    });

    it('should return black for black player socket ID', () => {
      const room = createRoom();
      room.players.black = 'socket-456';
      expect(getPlayerColor(room, 'socket-456')).toBe('black');
    });

    it('should return undefined for unknown socket ID', () => {
      const room = createRoom();
      room.players.white = 'socket-123';
      room.players.black = 'socket-456';
      expect(getPlayerColor(room, 'socket-999')).toBeUndefined();
    });

    it('should return undefined for empty room', () => {
      const room = createRoom();
      expect(getPlayerColor(room, 'socket-123')).toBeUndefined();
    });
  });
});
