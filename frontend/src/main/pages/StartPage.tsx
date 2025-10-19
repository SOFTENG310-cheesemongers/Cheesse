/* This is the start page component */

// ---------------- Imports ---------------- //
import "./StartPage.css"
import GamePage from './GamePage'
import { useState } from "react";
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
    const showGamePage = () => {
        setGamePage(true);
        setButtonsVisible(false)
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
                            onClick={() => onPlayStyleButtonClick(1)}
                            style={{ border: selectPlayStyle === 1 ? '10px solid gold' : 'none' }}
                            >
                                <img src={personPlayerIcon} alt="Person" width={16}/>
                                <span>&nbsp;&nbsp;&nbsp; Local PvP</span>
                            </button>
                            <button className="option-button"
                            onClick={() => onPlayStyleButtonClick(2)}
                            style={{ border: selectPlayStyle === 2 ? '10px solid gold' : 'none' }}
                            >
                                <img src={botPlayerIcon} alt="Bot" width={20}/>
                                <span>&nbsp;&nbsp;&nbsp; PvC</span>
                            </button>
                            <button className="option-button"
                            onClick={() => onPlayStyleButtonClick(3)}
                            style={{ border: selectPlayStyle === 3 ? '10px solid gold' : 'none' }}
                            >
                                <img src={onlineMatchmakingIcon} alt="Online" width={20}/>
                                <span>&nbsp;&nbsp;&nbsp; Online PvP</span>
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
                                <span>&nbsp;&nbsp;&nbsp; 5 min</span>
                            </button>
                            <button 
                            className="option-button" 
                            onClick={() => onTimerButtonClick(2)}
                            style={{ border: selectTimer === 2 ? '10px solid gold' : 'none' }}
                            >
                                <img src={mediumDurationGameIcon} alt="Person" width={16}/>
                                <span>&nbsp;&nbsp;&nbsp; 10 min</span>
                            </button>
                            <button 
                            className="option-button"     
                            onClick={() => onTimerButtonClick(3)}
                            style={{ border: selectTimer === 3 ? '10px solid gold' : 'none' }}
                            >
                                <img src={longDurationGameIcon} alt="Person" width={16}/>
                                <span>&nbsp;&nbsp;&nbsp; 60 min</span>
                            </button>
                        </div>
                        <button className="start-button" onClick={showGamePage}> Start </button>
                    </div>
                </div>
            )}
            {gamePage ? <GamePage initialSeconds={initialSeconds} /> : null}
        </div>
    );
}
