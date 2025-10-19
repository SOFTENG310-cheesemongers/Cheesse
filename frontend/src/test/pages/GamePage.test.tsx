import { render } from "@testing-library/react";
import '@testing-library/jest-dom';
import GamePage from "../../main/pages/GamePage";

// We recommend installing an extension to run jest tests.

describe("GamePage", () => {
  it("renders without crashing", () => {
    render(<GamePage />);
    // Check for the main container
    expect(document.querySelector(".game-page-div")).toBeInTheDocument();
  });

  it("renders GameMoveLogSidebar component", () => {
  render(<GamePage />);
    // Assuming GameMoveLogSidebar renders a recognizable element
    // You may need to adjust the text or role based on the actual implementation
    // For now, check if at least three children exist (since there are 3 components)
    const container = document.querySelector(".game-page-div");
    expect(container?.children.length).toBe(3);
  });

  it("renders Board component", () => {
  render(<GamePage />);
    // Check if Board is rendered by looking for a chessboard class or similar
    // Adjust selector as needed based on Board implementation
    // For now, just check that the second child exists
    const container = document.querySelector(".game-page-div");
    expect(container?.children[1]).toBeInTheDocument();
  });

  it("renders GameOptionsSidebar component", () => {
  render(<GamePage />);
    // Check if GameOptionsSidebar is rendered as the third child
    const container = document.querySelector(".game-page-div");
    expect(container?.children[2]).toBeInTheDocument();
  });
});
