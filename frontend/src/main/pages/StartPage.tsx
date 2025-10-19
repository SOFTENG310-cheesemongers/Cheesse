/* This is the start page component */

// ---------------- Imports ---------------- //
import "./StartPage.css"

import GamePage from './GamePage'
import ConnectStatus from '../components/ConnectStatus';
import RoomForm from './online/RoomForm';
import RoomInfo from './online/RoomInfo';

import type { Color } from '../multiplayer/types';

import { useState, useEffect  } from "react";
import { ChessProvider, useChessStore } from '../app/chessStore';
import { MultiplayerProvider, useMultiplayer } from '../multiplayer/MultiplayerProvider';
import { useMoveLog } from '../chess/components/history/moveLogStore';

import personPlayerIcon  from "..\\assets\\startMenu\\personPlayerIcon.png";
import botPlayerIcon  from "..\\assets\\startMenu\\botPlayerIcon.png";
import onlineMatchmakingIcon  from "..\\assets\\startMenu\\onlineMatchmakingIcon.png";
import shortDurationGameIcon  from "..\\assets\\startMenu\\shortDurationGameIcon.png";
import mediumDurationGameIcon  from "..\\assets\\startMenu\\mediumDurationGameIcon.png";
import longDurationGameIcon  from "..\\assets\\startMenu\\longDurationGameIcon.png";

/**
 * StartPage component - Displays the initial game setup options.
 * @returns {JSX.Element} - The rendered start page component.
 */
export default function StartPage() {
    const [gamePage, setGamePage] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(true)
    const [onlineVisible, setOnlineVisible] = useState(false)
    const showGamePage = () => {
        setGamePage(true);
        setButtonsVisible(false)
    }

    const returnToMenu = () => {
        setGamePage(false);
        setButtonsVisible(true);
        changeSelectTimer(0); // Reset timer selection
        setInitialSeconds(0); // Reset initial seconds
    }

    const [selectTimer, changeSelectTimer] = useState(0); // 0 means no timer selected

    const [selectPlayStyle, changeSelectPlayStyle] = useState(0); // 0 means no timer selected

    const [initialSeconds, setInitialSeconds] = useState(0);

    const setTimer = (seconds: number) => {
        setInitialSeconds(seconds);
    }

    const setPlayStyle = (playStyle: string) => {
        // implement play style selection once other play styles have been implemented
    }

    const onTimerButtonClick = (option: number) => {
        if (option === selectTimer) option = 0; // Deselect if already selected
        changeSelectTimer(option);
        switch (option) {
            case 1:
                setTimer(300);
                break;
            case 2:
                setTimer(600);
                break;
            case 3:
                setTimer(3600);
                break;
            default:
                setTimer(0);
        }
    }

    const onPlayStyleButtonClick = (option: number) => {
        if (option === selectPlayStyle) option = 0; // Deselect if already selected
        changeSelectPlayStyle(option);
        switch (option) {
            case 1:
                setPlayStyle("Local PvP");
                break;
            case 2:
                setPlayStyle("PvC");
                break;
            case 3:
                setPlayStyle("Online");
                break;
            default:
                setTimer(0);
        }
    }
    // Render the start page or the game page based on state
    return (
        <div className="start-page-wrapper">
            {buttonsVisible && (
                <div className="start-page-div">
                    <h1 className="cheesse">Cheesse</h1>
                    <div id="buttons-div" className="buttons-div">
                        <h2>
                            Game mode
                        </h2>
                        <div className="play-style-buttons">
                            <button className="option-button"
                            onClick={() => { onPlayStyleButtonClick(1); setOnlineVisible(false); }}
                            style={{ border: selectPlayStyle === 1 ? '10px solid gold' : 'none' }}
                            >
                                <img src={personPlayerIcon} alt="Person" width={16}/>
                                <br/>
                                <span>Local PvP</span>
                            </button>
                            <button className="option-button"
                            onClick={() => onPlayStyleButtonClick(2)}
                            style={{ border: selectPlayStyle === 2 ? '10px solid gold' : 'none' }}
                            >
                                <img src={botPlayerIcon} alt="Bot" width={20}/>
                                <br/>
                                <span>PvC</span>
                            </button>
                            <button className="option-button"
                            onClick={() => { onPlayStyleButtonClick(3); setOnlineVisible(true); setButtonsVisible(false);}}
                            style={{ border: selectPlayStyle === 3 ? '10px solid gold' : 'none' }}
                            >
                                <img src={onlineMatchmakingIcon} alt="Online" width={20}/>
                                <br/>
                                <span>Online PvP</span>
                            </button>
                        </div>
                        <h2>
                            Duration
                        </h2>
                        <div className="timer-buttons">
                            <button 
                            className="option-button" 
                            onClick={() => onTimerButtonClick(1)} 
                            style={{ border: selectTimer === 1 ? '10px solid gold' : 'none' }}
                            >
                                <img src={shortDurationGameIcon} alt="Person" width={16}/>
                                <br/>
                                <span>5 min</span>
                            </button>
                            <button 
                            className="option-button" 
                            onClick={() => onTimerButtonClick(2)}
                            style={{ border: selectTimer === 2 ? '10px solid gold' : 'none' }}
                            >
                                <img src={mediumDurationGameIcon} alt="Person" width={16}/>
                                <br/>
                                <span>10 min</span>
                            </button>
                            <button 
                            className="option-button"     
                            onClick={() => onTimerButtonClick(3)}
                            style={{ border: selectTimer === 3 ? '10px solid gold' : 'none' }}
                            >
                                <img src={longDurationGameIcon} alt="Person" width={16}/>
                                <br/>
                                <span>60 min</span>
                            </button>
                        </div>
                        <br/>
                        <button className="start-button" onClick={showGamePage}> Start </button>
                    </div>
                </div>
            )}
            {/* Online lobby flow */}
            {onlineVisible && (
                <MultiplayerProvider>
                    {!gamePage ? (
                        <OnlineLobby
                            onCancel={() => { setOnlineVisible(false); setButtonsVisible(true); }}
                            onJoined={() => setGamePage(true)}
                        />
                    ) : null}
                    {gamePage ? (
                        <ChessProvider>
                            <GameWithProvider initialSeconds={initialSeconds} onReturnToMenu={returnToMenu} />
                        </ChessProvider>
                    ) : null}
                </MultiplayerProvider>
            )}
            {gamePage ? (
                !onlineVisible ? (
                    <ChessProvider>
                        <GameWithProvider initialSeconds={initialSeconds} onReturnToMenu={returnToMenu} />
                    </ChessProvider>
                ) : null
            ) : null}
        </div>
    );
}

function GameWithProvider({ initialSeconds, onReturnToMenu }: { initialSeconds: number; onReturnToMenu: () => void }) {
    // This component runs inside ChessProvider and can set selectedSeconds
    const { setSelectedSeconds, resetGame } = useChessStore();
    const { resetMoveLog } = useMoveLog();

    useEffect(() => {
        // Reset game state when entering a new game
        resetGame();
        resetMoveLog();
        if (initialSeconds > 0) setSelectedSeconds(initialSeconds);
        else setSelectedSeconds(null);
        // Only run on mount or when initialSeconds changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSeconds]);

    return <GamePage onReturnToMenu={onReturnToMenu} />;
}

function OnlineLobby({ onCancel, onJoined }: { onCancel: () => void; onJoined: () => void }) {
    const mp = useMultiplayer();
    const connected = mp?.connected ?? false;
    const [error, setError] = useState<string | null>(null);
    const [inRoom, setInRoom] = useState(false);
    const [isHost, setIsHost] = useState(false);

    // Reset game state when lobby mounts (new game)
    useEffect(() => {
        mp.resetGameState();
    }, []);

    // Only keep retrying while this component is mounted — use stable connect/disconnect
    const { connect, disconnect } = mp;
    useEffect(() => {
        try { connect(); } catch { /* ignore */ }
        // DON'T disconnect on unmount - we might be transitioning to the game!
        // The MultiplayerProvider itself will handle cleanup when it unmounts
        return () => { 
            // Cleanup is handled by MultiplayerProvider
        };
    }, [connect, disconnect]);

    // Navigate to game when gameStarted event received
    useEffect(() => {
        if (mp.gameStarted && inRoom) {
            onJoined();
        }
    }, [mp.gameStarted, inRoom, onJoined]);

    const handleCreateRoom = async (preferredColor: Color) => {
        try {
            setError(null);
            if (!connected) throw new Error('offline');
            await mp.createRoom(preferredColor);
            setInRoom(true);
            setIsHost(true);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to create room');
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            setError(null);
            if (!connected) throw new Error('offline');
            const res = await mp.joinRoom(roomId);
            if ('error' in res) {
                setError(res.error);
                return;
            }
            setInRoom(true);
            setIsHost(false);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to join room');
        }
    };

    const handleStartGame = () => {
        try {
            mp.startGame();
        } catch (e: any) {
            setError(e?.message ?? 'Failed to start game');
        }
    };

    return (
        <div className="start-page-div online-lobby">
            <div className="lobby-inner">
                <h2 className="lobby-title">Online Lobby</h2>

                <ConnectStatus 
                    connected={connected} 
                    connecting={mp.connecting} 
                    error={mp.connectionError} 
                />

                {inRoom && mp.roomId ? (
                    <RoomInfo 
                        roomId={mp.roomId} 
                        myColor={mp.myColor}
                        opponentConnected={mp.opponentConnected}
                        isHost={isHost}
                        onStartGame={handleStartGame}
                    />
                ) : (
                    <RoomForm
                        connected={connected}
                        onCreateRoom={handleCreateRoom}
                        onJoinRoom={handleJoinRoom}
                    />
                )}

                {error ? <div className="lobby-error">{error}</div> : null}

                <div className="lobby-actions-row">
                    <button className="option-button" onClick={() => { 
                        onCancel(); 
                    }}>Back</button>
                </div>
            </div>
        </div>
    );
}
