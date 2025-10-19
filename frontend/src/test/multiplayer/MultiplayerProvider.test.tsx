import { renderHook, act } from "@testing-library/react";
import { MultiplayerProvider, useMultiplayer } from "../../main/multiplayer/MultiplayerProvider";

// Mock the MultiplayerClient
jest.mock("../../main/multiplayer/client");

describe("MultiplayerProvider", () => {
  it("should provide multiplayer context", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.connected).toBe(false);
    expect(result.current.roomId).toBeUndefined();
  });

  it("should have createRoom function", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(typeof result.current.createRoom).toBe("function");
  });

  it("should have joinRoom function", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(typeof result.current.joinRoom).toBe("function");
  });

  it("should track game started state", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(result.current.gameStarted).toBe(false);

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameStarted).toBe(true);
  });

  it("should have makeMove function", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(typeof result.current.makeMove).toBe("function");
  });

  it("should have resign function", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(typeof result.current.resign).toBe("function");
  });

  it("should handle opponent connection state", () => {
    const { result } = renderHook(() => useMultiplayer(), {
      wrapper: ({ children }: any) => <MultiplayerProvider>{children}</MultiplayerProvider>,
    });

    expect(result.current.opponentConnected).toBe(false);
  });
});

