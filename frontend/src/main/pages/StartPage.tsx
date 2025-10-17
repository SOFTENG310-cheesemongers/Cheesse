/* This is the start page component */

// ---------------- Imports ---------------- //
import "./StartPage.css"
import GamePage from './GamePage'
import { useState, useEffect } from "react";
import { ChessProvider, useChessStore } from '../app/chessStore';

/**
 * StartPage component - Displays the initial game setup options.
 * @returns {JSX.Element} - The rendered start page component.
 */
export default function StartPage() {
    const [gamePage, setGamePage] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(true)
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

    const [initialSeconds, setInitialSeconds] = useState(0);

    const setTimer = (seconds: number) => {
        setInitialSeconds(seconds);
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

    // Render the start page or the game page based on state
    return (
        <div className="start-page-wrapper">
            {buttonsVisible && (
                <div className="start-page-div">
                    <h1 className="cheesse">Cheesse</h1>
                    <div id="buttons-div" className="buttons-div">
                        <div className="play-style-buttons">
                            <button className="option-button">Local PVP</button>
                            <button className="option-button">PVC</button>
                            <button className="option-button">Online PVP</button>
                        </div>
                        <div className="timer-buttons">
                            <button className="option-button"
                                onClick={() => onTimerButtonClick(1)}
                                style={{ border: selectTimer === 1 ? '10px solid gold' : 'none' }}>5 Mins</button>
                            <button className="option-button"
                                onClick={() => onTimerButtonClick(2)}
                                style={{ border: selectTimer === 2 ? '10px solid gold' : 'none' }}>10 Mins</button>
                            <button className="option-button"
                                onClick={() => onTimerButtonClick(3)}
                                style={{ border: selectTimer === 3 ? '10px solid gold' : 'none' }}>60 Mins</button>
                        </div>
                        <button className="start-button" onClick={showGamePage}> Start </button>
                    </div>
                </div>
            )}
            {gamePage ? (
                <ChessProvider>
                    <GameWithProvider initialSeconds={initialSeconds} onReturnToMenu={returnToMenu} />
                </ChessProvider>
            ) : null}
        </div>
    );
}

function GameWithProvider({ initialSeconds, onReturnToMenu }: { initialSeconds: number; onReturnToMenu: () => void }) {
    // This component runs inside ChessProvider and can set selectedSeconds
    const { setSelectedSeconds } = useChessStore();

    useEffect(() => {
        if (initialSeconds > 0) setSelectedSeconds(initialSeconds);
        else setSelectedSeconds(null);
        // intentionally only run on mount/change of initialSeconds
    }, [initialSeconds, setSelectedSeconds]);

    return <GamePage onReturnToMenu={onReturnToMenu} />;
}
