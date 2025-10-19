import { MultiplayerClient } from "../../main/multiplayer/client";

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    connected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  })),
}));

describe("MultiplayerClient", () => {
  it("should create a new client", () => {
    const client = new MultiplayerClient();
    expect(client).toBeDefined();
  });

  it("should have isConnected method", () => {
    const client = new MultiplayerClient();
    expect(typeof client.isConnected).toBe("function");
    expect(client.isConnected()).toBe(false);
  });

  it("should have connect method", () => {
    const client = new MultiplayerClient();
    expect(typeof client.connect).toBe("function");
  });

  it("should have disconnect method", () => {
    const client = new MultiplayerClient();
    expect(typeof client.disconnect).toBe("function");
  });

  it("should accept custom backend URL", () => {
    const client = new MultiplayerClient({ baseUrl: "http://localhost:3001" });
    expect(client).toBeDefined();
  });

  it("should accept custom timeout", () => {
    const client = new MultiplayerClient({ timeoutMs: 10000 });
    expect(client).toBeDefined();
  });
});

