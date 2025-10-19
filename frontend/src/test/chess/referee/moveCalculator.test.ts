import { describe, it, expect } from "vitest";
import { calculateValidMoves } from "../../../main/chess/referee/moveCalculator";
import type { SquareId, PieceName } from "../../../main/chess/components/board/BoardConfig";

// Sort chess squares consistently
function sortSquares(a: string, b: string): number {
  if (a.startsWith(b[0])) {
    return a[0].localeCompare(b[0]);
  }
  return Number(a[1]) - Number(b[1]);
}

function getSortedMoves(square: SquareId, pieces: Partial<Record<SquareId, PieceName>>): SquareId[] {
  return calculateValidMoves(square, pieces).sort(sortSquares);
}

function expectMovesToEqual(square: SquareId, pieces: Partial<Record<SquareId, PieceName>>, expected: SquareId[]) {
  expect(getSortedMoves(square, pieces)).toEqual(expected.sort(sortSquares));
}

describe("calculateValidMoves", () => {
    it("returns [] for empty square", () => {
        expect(calculateValidMoves("e4", {})).toEqual([]);
    });

    it("calculates white pawn moves (empty ahead)", () => {
        expectMovesToEqual("e2", { "e2": "pawn_white" }, ["e3", "e4"]);
    });

    it("calculates black pawn moves (empty ahead)", () => {
        expectMovesToEqual("d7", { "d7": "pawn_black" }, ["d6", "d5"]);
    });

    it("white pawn blocked by piece ahead", () => {
        expect(calculateValidMoves("e2", { "e2": "pawn_white", "e3": "pawn_black" })).toEqual([]);
    });

    it("white pawn can capture diagonally", () => {
        expectMovesToEqual("e4", {
            "e4": "pawn_white",
            "d5": "pawn_black",
            "f5": "pawn_black"
        }, ["e5", "d5", "f5"]);
    });

    it("black pawn can capture diagonally", () => {
        expectMovesToEqual("d5", {
            "d5": "pawn_black",
            "c4": "pawn_white",
            "e4": "pawn_white"
        }, ["d4", "c4", "e4"]);
    });

    it("rook moves are blocked by own piece", () => {
        expect(calculateValidMoves("a1", {
            "a1": "rook_white",
            "a2": "pawn_white",
            "b1": "pawn_white"
        })).toEqual([]);
    });

    it("rook moves include captures", () => {
        expectMovesToEqual("a1", {
            "a1": "rook_white",
            "a3": "pawn_black",
            "c1": "pawn_black"
        }, ["a2", "a3", "b1", "c1"]);
    });

    it("knight moves (center)", () => {
        expectMovesToEqual("e4", { "e4": "knight_white" }, 
            ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"]);
    });

    it("knight moves blocked by own piece", () => {
        const moves = calculateValidMoves("e4", {
            "e4": "knight_white",
            "d6": "pawn_white",
            "f6": "pawn_black"
        });
        expect(moves).toContain("f6");
        expect(moves).not.toContain("d6");
    });

    it("bishop moves (no blocking)", () => {
        expectMovesToEqual("c1", { "c1": "bishop_white" }, 
            ["d2", "e3", "f4", "g5", "h6", "b2", "a3"]);
    });

    it("queen moves (center)", () => {
        const moves = calculateValidMoves("d4", { "d4": "queen_white" });
        expect(moves).toContain("d5");
        expect(moves).toContain("e5");
        expect(moves).toContain("c3");
        expect(moves).toContain("d1");
        expect(moves).toContain("h8");
    });

    it("returns [] for unknown piece type", () => {
        expect(calculateValidMoves("a1", { "a1": "dragon_white" as PieceName })).toEqual([]);
    });
});