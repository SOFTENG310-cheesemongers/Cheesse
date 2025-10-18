import "./Timer.css";
import { useEffect } from "react";
import { useChessStore } from "../../../app/chessStore";

export default function Timer() {
    const {
        whiteSeconds,
        blackSeconds,
        isWhiteTurn,
        isRunning,
        setWhiteSeconds,
        setBlackSeconds,
        setMenuOpen,
        setMenuMode,
        setRunning,
    } = useChessStore();

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (isRunning) {
            timer = setInterval(() => {
                if (!isRunning) return;
                if (isWhiteTurn) setWhiteSeconds((prev: number) => Math.max(prev - 1, 0));
                else setBlackSeconds((prev: number) => Math.max(prev - 1, 0));
            }, 1000);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [isRunning, isWhiteTurn, setWhiteSeconds, setBlackSeconds]);

    const onPauseClick = () => {
        // open the in-game menu in pause mode and stop timers
        setMenuMode('pause');
        setMenuOpen(true);
        setRunning(false);
    };

    return (
        <div className="timerWrapper">
            <div className="whiteTimerContainer" 
                style={{ backgroundColor: isWhiteTurn ? "#ffffff" : "transparent" }}
            >
                <h3 className="whiteTimer" style={{ color: "black" }}>{formatTime(whiteSeconds)}</h3>
            </div>
            
            <img src="/src/main/assets/pause.png" 
                alt="Timer" className="timerImage" style={{ width: "65px", height: "65px" }} 
                onClick={onPauseClick}
                onKeyDown={(e) => (e.key === "space") ? onPauseClick() : null}
                />
            
            <div className="blackTimerContainer" 
                style={{ backgroundColor: !isWhiteTurn ? "#111111" : "transparent" }}
                >
                <h3 className="blackTimer" style={{ color: !isWhiteTurn ? "#ffffff" : "#000000" }}>{formatTime(blackSeconds)}</h3>
            </div>

        </div>
    );
}