import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Board from "../../../../main/chess/components/board/Board";
import { ChessProvider } from "../../../../main/app/chessStore";
import { MoveLogProvider } from "../../../../main/chess/components/history/moveLogStore";

// Mock Square component to simplify testing
vi.mock("../../../../main/chess/components/board/Square", () => ({
  default: (props: any) => (
    <div data-testid="square" data-id={props.id} data-dark={props.isDark}>
      {props.piece && <span data-testid="piece">{props.piece}</span>}
    </div>
  )
}));

describe("Board", () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ChessProvider>
        <MoveLogProvider>
          {component}
        </MoveLogProvider>
      </ChessProvider>
    );
  };

  it("renders the chessboard with 64 squares", () => {
    renderWithProviders(<Board />);
    const squares = screen.getAllByTestId("square");
    expect(squares).toHaveLength(64);
  });

  it("renders pieces on the correct squares", () => {
    renderWithProviders(<Board />);
    // Check that initial position has pieces
    const squares = screen.getAllByTestId("square");
    const piecesOnBoard = squares.filter(sq => sq.querySelector('[data-testid="piece"]'));
    expect(piecesOnBoard.length).toBeGreaterThan(0); // Should have pieces on board
  });

  it("applies correct dark/light square coloring", () => {
    renderWithProviders(<Board />);
    const squares = screen.getAllByTestId("square");
    // In standard chess, a1 is a dark square (RANKS=[8,7,6,5,4,3,2,1], so rank 1 is at index 7)
    // rIdx=7, fIdx=0 => (7+0) % 2 === 1 => dark (true)
    const a1Square = squares.find(el => el.getAttribute("data-id") === "a1");
    expect(a1Square).toHaveAttribute("data-dark", "true");
    
    // b1 is light: rIdx=7, fIdx=1 => (7+1) % 2 === 0 => light (false)
    const b1Square = squares.find(el => el.getAttribute("data-id") === "b1");
    expect(b1Square).toHaveAttribute("data-dark", "false");
  });
});