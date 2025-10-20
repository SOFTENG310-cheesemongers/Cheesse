import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMoveLog, MoveLogProvider } from '../../../../main/chess/components/history/moveLogStore';

describe('useMoveLogStore', () => {
  it('should initialize with an empty move log', () => {
    const { result } = renderHook(() => useMoveLog(), {
      wrapper: ({ children }) => <MoveLogProvider>{children}</MoveLogProvider>
    });
    expect(result.current.moves).toEqual([]);
  });

  it('should add a move to the log', () => {
    const { result } = renderHook(() => useMoveLog(), {
      wrapper: ({ children }) => <MoveLogProvider>{children}</MoveLogProvider>
    });
    act(() => {
      result.current.addMove('e2e4');
    });
    expect(result.current.moves).toEqual([{ white: 'e2e4' }]);
  });

  it('should clear the move log', () => {
    const { result } = renderHook(() => useMoveLog(), {
      wrapper: ({ children }) => <MoveLogProvider>{children}</MoveLogProvider>
    });
    act(() => {
      result.current.addMove('e2e4');
      result.current.resetMoveLog();
    });
    expect(result.current.moves).toEqual([]);
  });
});