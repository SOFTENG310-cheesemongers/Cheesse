import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Piece, { ItemTypes } from "../../../../main/chess/components/board/Piece";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Mock useDrag from react-dnd
vi.mock("react-dnd", async () => {
  const actual = await vi.importActual("react-dnd");
  return {
    ...actual,
    useDrag: vi.fn(() => [{ isDragging: false }, vi.fn()]),
  };
});

describe("Piece component", () => {
  const id = "wP1";
  const src = "/pieces/wP.png";

  function renderWithDnd(ui: React.ReactElement) {
    return render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>);
  }

  it("renders the image with correct src and alt", () => {
    const { getByAltText } = renderWithDnd(<Piece id={id} src={src} />);
    const img = getByAltText(id) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(src);
    expect(img.alt).toBe(id);
  });

  it("has the correct className and style", () => {
    const { getByAltText } = renderWithDnd(<Piece id={id} src={src} />);
    const img = getByAltText(id);
    expect(img).toHaveClass("piece");
    expect(img).toHaveStyle({ pointerEvents: "none" });
  });

  it("sets draggable to false", () => {
    const { getByAltText } = renderWithDnd(<Piece id={id} src={src} />);
    const img = getByAltText(id);
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("uses ItemTypes.PIECE as drag type", () => {
    expect(ItemTypes.PIECE).toBe("piece");
  });

  it("renders correctly when dragging", () => {
    // Override mock to simulate dragging
    vi.mocked(useDrag).mockReturnValueOnce([{ isDragging: true }, vi.fn(), vi.fn()]);
    const { getByAltText } = renderWithDnd(<Piece id={id} src={src} />);
    const img = getByAltText(id);
    // The piece component itself doesn't change opacity - that's handled by the parent Square
    expect(img).toBeInTheDocument();
  });
});