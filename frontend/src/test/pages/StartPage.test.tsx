import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import StartPage from "../../main/pages/StartPage";
import { MoveLogProvider } from "../../main/chess/components/history/moveLogStore";

// Mock GamePage to avoid rendering its internals
vi.mock("../../main/pages/GamePage", () => ({
  default: () => <div data-testid="game-page-mock" />
}));

describe("StartPage", () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MoveLogProvider>
        {component}
      </MoveLogProvider>
    );
  };

  test("renders the title and all option buttons", () => {
    renderWithProviders(<StartPage />);
    expect(screen.getByText("Cheesse")).toBeInTheDocument();
    expect(screen.getByText("Local PvP")).toBeInTheDocument();
    expect(screen.getByText("PvC")).toBeInTheDocument();
    expect(screen.getByText("Online PvP")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  test("does not render GamePage initially", () => {
    renderWithProviders(<StartPage />);
    expect(screen.queryByTestId("game-page-mock")).not.toBeInTheDocument();
  });

  test("shows GamePage and hides buttons after clicking Start", () => {
    renderWithProviders(<StartPage />);
    fireEvent.click(screen.getByText("Start"));
    expect(screen.getByTestId("game-page-mock")).toBeInTheDocument();
    // Buttons should be hidden
    expect(screen.queryByText("Local PvP")).not.toBeInTheDocument();
    expect(screen.queryByText("PvC")).not.toBeInTheDocument();
    expect(screen.queryByText("Online PvP")).not.toBeInTheDocument();
    expect(screen.queryByText("5 min")).not.toBeInTheDocument();
    expect(screen.queryByText("10 min")).not.toBeInTheDocument();
    expect(screen.queryByText("60 min")).not.toBeInTheDocument();
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
  });

  test("matches snapshot", () => {
    const { asFragment } = renderWithProviders(<StartPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
