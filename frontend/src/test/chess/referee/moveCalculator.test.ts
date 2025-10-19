import { describe, it, expect } from "vitest";
import { calculateValidMoves } from "../../../main/chess/referee/moveCalculator";

type PieceName = "pawn_white" | "pawn_black" | "rook_white" | "rook_black" | "knight_white" | "knight_black" | "bishop_white" | "bishop_black" | "queen_white" | "queen_black" | "king_white" | "king_black";

// Sort chess squares consistently
function sortSquares(a: string, b: string): number {
  // First compare files (columns)
  if (!a.startsWith(b[0])) {
    return a[0].localeCompare(b[0]);
  }
  // Then compare ranks (rows)
  return Number(a[1]) - Number(b[1]);
}

describe("calculateValidMoves", () => {
    it("returns [] for empty square", () => {
        expect(calculateValidMoves("e4", {})).toEqual([]);
    });

    it("calculates white pawn moves (empty ahead)", () => {
        const pieces = { "e2": "pawn_white" } as const;
        const actual = calculateValidMoves("e2", pieces).sort(sortSquares);
        const expected = ["e3", "e4"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("calculates black pawn moves (empty ahead)", () => {
        const pieces = { "d7": "pawn_black" } as const;
        const actual = calculateValidMoves("d7", pieces).sort(sortSquares);
        const expected = ["d6", "d5"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("white pawn blocked by piece ahead", () => {
        const pieces = { "e2": "pawn_white", "e3": "pawn_black" } as const;
        expect(calculateValidMoves("e2", pieces)).toEqual([]);
    });

    it("white pawn can capture diagonally", () => {
        const pieces = {
            "e4": "pawn_white",
            "d5": "pawn_black",
            "f5": "pawn_black"
        } as const;
        const actual = calculateValidMoves("e4", pieces).sort(sortSquares);
        const expected = ["e5", "d5", "f5"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("black pawn can capture diagonally", () => {
        const pieces = {
            "d5": "pawn_black",
            "c4": "pawn_white",
            "e4": "pawn_white"
        } as const;
        const actual = calculateValidMoves("d5", pieces).sort(sortSquares);
        const expected = ["d4", "c4", "e4"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("rook moves are blocked by own piece", () => {
        const pieces = {
            "a1": "rook_white",
            "a2": "pawn_white",
            "b1": "pawn_white"
        } as const;
        expect(calculateValidMoves("a1", pieces)).toEqual([]);
    });

    it("rook moves include captures", () => {
        const pieces = {
            "a1": "rook_white",
            "a3": "pawn_black",
            "c1": "pawn_black"
        } as const;
        const actual = calculateValidMoves("a1", pieces).sort(sortSquares);
        const expected = ["a2", "a3", "b1", "c1"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("knight moves (center)", () => {
        const pieces = { "e4": "knight_white" } as const;
        const actual = calculateValidMoves("e4", pieces).sort(sortSquares);
        const expected = ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("knight moves blocked by own piece", () => {
        const pieces = {
            "e4": "knight_white",
            "d6": "pawn_white",
            "f6": "pawn_black"
        } as const;
        expect(calculateValidMoves("e4", pieces)).toContain("f6");
        expect(calculateValidMoves("e4", pieces)).not.toContain("d6");
    });

    it("bishop moves (no blocking)", () => {
        const pieces = { "c1": "bishop_white" } as const;
        const actual = calculateValidMoves("c1", pieces).sort(sortSquares);
        const expected = ["d2", "e3", "f4", "g5", "h6", "b2", "a3"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("queen moves (center)", () => {
        const pieces = { "d4": "queen_white" } as const;
        const moves = calculateValidMoves("d4", pieces);
        expect(moves).toContain("d5");
        expect(moves).toContain("e5");
        expect(moves).toContain("c3");
        expect(moves).toContain("d1");
        expect(moves).toContain("h8");
    });

    it("king moves (center)", () => {
        const pieces = { "e4": "king_white" } as const;
        const actual = calculateValidMoves("e4", pieces).sort(sortSquares);
        const expected = ["e5", "f5", "f4", "f3", "e3", "d3", "d4", "d5"].sort(sortSquares);
        expect(actual).toEqual(expected);
    });

    it("king moves blocked by own piece", () => {
        const pieces = {
            "e4": "king_white",
            "e5": "pawn_white",
            "f4": "pawn_black"
        } as const;
        const moves = calculateValidMoves("e4", pieces);
        expect(moves).toContain("f4");
        expect(moves).not.toContain("e5");
    });

    it("returns [] for unknown piece type", () => {
        const pieces = { "a1": "dragon_white" as PieceName } as const;
        expect(calculateValidMoves("a1", pieces)).toEqual([]);
    });
});