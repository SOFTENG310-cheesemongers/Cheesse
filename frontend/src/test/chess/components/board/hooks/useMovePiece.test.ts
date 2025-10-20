import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMovePiece } from "../../../../../main/chess/components/board/hooks/useMovePiece";
import { initialPieces } from "../../../../../main/chess/components/board/BoardConfig";

// Mock useRecordMove
vi.mock(
  "../../../../../main/chess/components/board/hooks/useRecordMove",
  () => ({
    useRecordMove: () => vi.fn(),
  })
);

// Mock useMoveLog to avoid needing MoveLogProvider
vi.mock("../../../../../main/chess/components/history/moveLogStore", () => ({
  useMoveLog: () => ({
    undoLastMove: vi.fn(),
    redoLastMove: vi.fn(),
  }),
}));

// Mock useChessStore to avoid needing ChessProvider
vi.mock("../../../../../main/app/chessStore", () => ({
  useChessStore: () => ({
    changeTurn: vi.fn(),
    addMoveDetails: vi.fn(),
    moveDetails: [],
    undoTrigger: 0,
    undoLastMove: vi.fn(),
    redoTrigger: 0,
    redoLastMove: vi.fn(),
    setMenuResult: vi.fn(),
  }),
}));

// Note: We're NOT mocking calculateValidMoves - let it use the real implementation
// This ensures our tests validate actual chess move logic

describe("useMovePiece", () => {
  beforeEach(() => {
    // Clear any mocks if needed
  });

  it("should initialize with initial pieces", () => {
    const { result } = renderHook(() => useMovePiece());
    expect(result.current.pieces).toEqual(initialPieces);
  });

  it("should move a piece from one square to another", () => {
    const { result } = renderHook(() => useMovePiece());
    const from = "e2";
    const to = "e4";
    const piece = result.current.pieces[from];

    act(() => {
      result.current.movePiece(from, to);
    });

    expect(result.current.pieces[to]).toBe(piece);
    expect(result.current.pieces[from]).toBeUndefined();
  });

  it("should not move if from and to are the same", () => {
    const { result } = renderHook(() => useMovePiece());
    const from = "e2";
    const before = { ...result.current.pieces };

    act(() => {
      result.current.movePiece(from, from);
    });

    expect(result.current.pieces).toEqual(before);
  });

  it("should not move if there is no piece at from square", () => {
    const { result } = renderHook(() => useMovePiece());
    const from = "e3"; // empty in initial position
    const to = "e4";
    const before = { ...result.current.pieces };

    act(() => {
      result.current.movePiece(from, to);
    });

    expect(result.current.pieces).toEqual(before);
  });
});