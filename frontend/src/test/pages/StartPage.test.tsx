import { render, screen, fireEvent } from "@testing-library/react";
import StartPage from "../../main/pages/StartPage";

// Mock GamePage to avoid rendering its internals
jest.mock("../../main/pages/GamePage", () => () => <div data-testid="game-page-mock" />);

describe("StartPage", () => {
  test("renders the title and all option buttons", () => {
    render(<StartPage />);
    expect(screen.getByText("Cheesse")).toBeInTheDocument();
    expect(screen.getByText("Local PVP")).toBeInTheDocument();
    expect(screen.getByText("PVC")).toBeInTheDocument();
    expect(screen.getByText("Online PVP")).toBeInTheDocument();
    expect(screen.getByText("5 Mins")).toBeInTheDocument();
    expect(screen.getByText("10 Mins")).toBeInTheDocument();
    expect(screen.getByText("60 Mins")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  test("does not render GamePage initially", () => {
    render(<StartPage />);
    expect(screen.queryByTestId("game-page-mock")).not.toBeInTheDocument();
  });

  test("shows GamePage and hides buttons after clicking Start", () => {
    render(<StartPage />);
    fireEvent.click(screen.getByText("Start"));
    expect(screen.getByTestId("game-page-mock")).toBeInTheDocument();
    // Buttons should be hidden
    expect(screen.queryByText("Local PVP")).not.toBeInTheDocument();
    expect(screen.queryByText("PVC")).not.toBeInTheDocument();
    expect(screen.queryByText("Online PVP")).not.toBeInTheDocument();
    expect(screen.queryByText("5 Mins")).not.toBeInTheDocument();
    expect(screen.queryByText("10 Mins")).not.toBeInTheDocument();
    expect(screen.queryByText("60 Mins")).not.toBeInTheDocument();
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
  });

  test("matches snapshot", () => {
    const { asFragment } = render(<StartPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
