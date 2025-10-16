import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { JSX, ReactNode } from 'react';

interface ChessMove {
    white?: string;
    black?: string;
}

interface ChessState {
    
    // move history (never used for now)
    moveHistory: readonly ChessMove[];
    currentMove: number;
    addMove: (move: string) => void;

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
    setRunning: (running: boolean) => void;
    resetTimers: (seconds?: number) => void;
    // in-game menu overlay
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
}

const ChessContext = createContext<ChessState | null>(null);

export function ChessProvider({ children }: { children: ReactNode }): JSX.Element {
    const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
    const [currentMove, setCurrentMove] = useState(0);

    // selected starting time for a new game; null means no timer selected / no timer created
    const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);

    // timer state (only meaningful when selectedSeconds != null)
    const [whiteSeconds, setWhiteSeconds] = useState<number>(0);
    const [blackSeconds, setBlackSeconds] = useState<number>(0);
    const [isWhiteTurn, setIsWhiteTurn] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(true);

    // in-game menu overlay state
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

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

    // timer actions
    const changeTurn = (nextIsWhite?: boolean) => {
        if (typeof nextIsWhite === 'boolean') setIsWhiteTurn(nextIsWhite);
        else setIsWhiteTurn(prev => !prev);
    };

    const toggleRunning = () => setIsRunning(!isRunning);

    const setRunning = (running: boolean) => setIsRunning(running);

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

        // timer
        whiteSeconds,
        blackSeconds,
        isWhiteTurn,
        isRunning,

    // selected start time (null = no timer)
    selectedSeconds,
    setSelectedSeconds,

    // in-game menu
    menuOpen,
    setMenuOpen,

    // actions
    setWhiteSeconds,
    setBlackSeconds,
    changeTurn,
    toggleRunning,
    setRunning,
    resetTimers,
    }), [moveHistory, currentMove, whiteSeconds, blackSeconds, isWhiteTurn, isRunning, selectedSeconds, menuOpen]);

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
