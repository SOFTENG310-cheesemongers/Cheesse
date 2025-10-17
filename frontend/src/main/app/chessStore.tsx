import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { JSX, ReactNode } from 'react';

interface ChessMove {
    white?: string;
    black?: string;
}

interface MoveDetails {
    from: string;
    to: string;
    piece: string;
    capturedPiece?: string;
    notation: string;
}

interface ChessState {

    // move history (never used for now)
    moveHistory: readonly ChessMove[];
    currentMove: number;
    addMove: (move: string) => void;

    // detailed moves for undo functionality
    moveDetails: readonly MoveDetails[];
    addMoveDetails: (details: MoveDetails) => void;
    canUndo: boolean;
    undoLastMove: () => MoveDetails | null;
    requestUndo: () => void;
    undoTrigger: number;

    // redo functionality
    redoStack: readonly MoveDetails[];
    canRedo: boolean;
    redoLastMove: () => MoveDetails | null;
    requestRedo: () => void;
    redoTrigger: number;

    // timer state
    whiteSeconds: number;
    blackSeconds: number;
    isWhiteTurn: boolean;
    isRunning: boolean;

    // selected starting seconds for a new game; null means no timer selected
    selectedSeconds: number | null;
    setSelectedSeconds: (s: number | null) => void;

    // timer actions
    setWhiteSeconds: (value: number | ((prev: number) => number)) => void;
    setBlackSeconds: (value: number | ((prev: number) => number)) => void;
    changeTurn: (nextIsWhite?: boolean) => void;
    toggleRunning: () => void;
    resetTimers: (seconds?: number) => void;
}

const ChessContext = createContext<ChessState | null>(null);

export function ChessProvider({ children }: { children: ReactNode }): JSX.Element {
    const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
    const [currentMove, setCurrentMove] = useState(0);
    const [moveDetails, setMoveDetails] = useState<MoveDetails[]>([]);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [redoStack, setRedoStack] = useState<MoveDetails[]>([]);
    const [redoTrigger, setRedoTrigger] = useState(0);

    // selected starting time for a new game; null means no timer selected / no timer created
    const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);

    // timer state (only meaningful when selectedSeconds != null)
    const [whiteSeconds, setWhiteSeconds] = useState<number>(0);
    const [blackSeconds, setBlackSeconds] = useState<number>(0);
    const [isWhiteTurn, setIsWhiteTurn] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(true);

    // Whenever selectedSeconds changes to a non-null value, reset timers to that value
    useEffect(() => {
        if (selectedSeconds !== null) {
            setWhiteSeconds(selectedSeconds);
            setBlackSeconds(selectedSeconds);
            setIsWhiteTurn(true);
            setIsRunning(true);
        } else {
            // when selectedSeconds is null, clear timers
            setWhiteSeconds(0);
            setBlackSeconds(0);
            setIsRunning(false);
        }
    }, [selectedSeconds]);

    const addMove = (move: string) => {
        setMoveHistory(prev => {
            const lastMove = prev[prev.length - 1];

            // If we have a last move and it doesn't have a black move yet
            if (lastMove && !lastMove.black) {
                // Add black move to the last pair
                return [
                    ...prev.slice(0, -1),
                    { ...lastMove, black: move }
                ];
            }

            // Start a new move pair with white's move
            return [...prev, { white: move }];
        });
        setCurrentMove(prev => prev + 1);
    };

    // Move details functions for undo functionality
    const addMoveDetails = (details: MoveDetails) => {
        setMoveDetails(prev => [...prev, details]);
        // Clear redo stack when a new move is made
        setRedoStack([]);
    };

    const undoLastMove = (): MoveDetails | null => {
        if (moveDetails.length === 0) return null;

        const lastMove = moveDetails[moveDetails.length - 1];
        setMoveDetails(prev => prev.slice(0, -1));

        // Add to redo stack
        setRedoStack(prev => [...prev, lastMove]);

        // Also remove from regular move history
        setMoveHistory(prev => {
            if (prev.length === 0) return prev;

            const lastMoveEntry = prev[prev.length - 1];

            // If the last entry has both white and black moves, remove only the black move
            if (lastMoveEntry.black) {
                return [
                    ...prev.slice(0, -1),
                    { white: lastMoveEntry.white }
                ];
            }

            // If the last entry only has white move, remove the entire entry
            return prev.slice(0, -1);
        });

        setCurrentMove(prev => Math.max(0, prev - 1));
        return lastMove;
    };

    const canUndo = moveDetails.length > 0;

    const requestUndo = () => {
        setUndoTrigger(prev => prev + 1);
    };

    // Redo functionality
    const canRedo = redoStack.length > 0;

    const redoLastMove = (): MoveDetails | null => {
        if (redoStack.length === 0) return null;

        const moveToRedo = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, -1));

        // Add back to move details
        setMoveDetails(prev => [...prev, moveToRedo]);

        // Add back to regular move history
        setMoveHistory(prev => {
            const lastMove = prev[prev.length - 1];

            // If we have a last move and it doesn't have a black move yet
            if (lastMove && !lastMove.black) {
                // Add black move to the last pair
                return [
                    ...prev.slice(0, -1),
                    { ...lastMove, black: moveToRedo.notation }
                ];
            }

            // Start a new move pair with white's move
            return [...prev, { white: moveToRedo.notation }];
        });

        setCurrentMove(prev => prev + 1);
        return moveToRedo;
    };

    const requestRedo = () => {
        setRedoTrigger(prev => prev + 1);
    };

    // timer actions
    const changeTurn = (nextIsWhite?: boolean) => {
        if (typeof nextIsWhite === 'boolean') setIsWhiteTurn(nextIsWhite);
        else setIsWhiteTurn(prev => !prev);
    };

    const toggleRunning = () => setIsRunning(!isRunning);

    const resetTimers = (seconds?: number) => {
        const s = typeof seconds === 'number' ? seconds : selectedSeconds ?? 0;
        setWhiteSeconds(s);
        setBlackSeconds(s);
        setIsWhiteTurn(true);
        setIsRunning(s > 0);
    };

    const value = useMemo(() => ({
        moveHistory,
        currentMove,
        addMove,

        // move details for undo
        moveDetails,
        addMoveDetails,
        canUndo,
        undoLastMove,
        requestUndo,
        undoTrigger,

        // redo functionality
        redoStack,
        canRedo,
        redoLastMove,
        requestRedo,
        redoTrigger,

        // timer
        whiteSeconds,
        blackSeconds,
        isWhiteTurn,
        isRunning,

        // selected start time (null = no timer)
        selectedSeconds,
        setSelectedSeconds,

        // actions
        setWhiteSeconds,
        setBlackSeconds,
        changeTurn,
        toggleRunning,
        resetTimers,
    }), [moveHistory, currentMove, moveDetails, canUndo, undoTrigger, redoStack, canRedo, redoTrigger, whiteSeconds, blackSeconds, isWhiteTurn, isRunning, selectedSeconds]);

    return (
        <ChessContext.Provider value={value}>
            {children}
        </ChessContext.Provider>
    );
}

export function useChessStore(): ChessState {
    const context = useContext(ChessContext);
    if (context === null) {
        throw new Error('useChessStore must be used within a ChessProvider');
    }
    return context;
}
