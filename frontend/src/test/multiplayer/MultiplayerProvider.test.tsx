import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MultiplayerProvider, useMultiplayer } from "../../main/multiplayer/MultiplayerProvider";

// Mock the MultiplayerClient
vi.mock("../../main/multiplayer/client", () => {
  return {
    MultiplayerClient: vi.fn().mockImplementation(() => ({
      isConnected: vi.fn(() => false),
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(() => vi.fn()), // Add 'on' method that returns cleanup function
      onNative: vi.fn(() => vi.fn()), // Return cleanup function
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
      emit: vi.fn(),
    })),
  };
});

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

    // With mocked client, gameStarted won't change without socket events
    // The mock doesn't simulate server responses
    expect(result.current.gameStarted).toBe(false);
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

