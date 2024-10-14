import { useState, useEffect, useRef } from "react";
import "./App.css";
import Counter from "./Counter";
import Players from "./Players";
import bottle from "./img/Bottle.png";
import spinSound from "./sounds/Spin.mp3";
import kissImage from "./img/Kiss.png";
import kissSound from "./sounds/Kiss.mp3";

function App() {
  const [radius, setRadius] = useState(300);
  const [activePlayer, setActivePlayer] = useState(0);
  const [previousPlayer, setPreviousPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showKiss, setShowKiss] = useState(false);
  const [flyingPlayers, setFlyingPlayers] = useState(false);
  const [kissCount, setKissCount] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const totalPlayers = Players.length;
  const spinTimeoutRef = useRef(null);
  const kissTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const newRadius = screenWidth < 1000 ? screenWidth / 4 : 300;
      setRadius(newRadius);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let intervalId;

    if (timer > 0 && !isGamePaused) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isSpinning && !isGamePaused) {
      handleSpin();
    }

    return () => clearInterval(intervalId);
  }, [timer, isSpinning, isGamePaused]);

  const handleSpin = () => {
    if (isGamePaused || isGameRunning) return;

    setIsSpinning(true);
    setIsGameRunning(true);

    const audio = new Audio(spinSound);
    audio.play().catch((error) => {
      console.error("Ошибка воспроизведения звука:", error);
    });

    const randomPlayerIndex = getRandomPlayerIndex();

    const anglePerPlayer = 360 / totalPlayers;
    const targetAngle = randomPlayerIndex * anglePerPlayer;

    const correctedAngle = targetAngle - 270;

    const randomRotations = Math.floor(Math.random() * 5) + 5;

    const newRotation = randomRotations * 360 + correctedAngle;

    setRotation(newRotation);

    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);

    spinTimeoutRef.current = setTimeout(() => {
      if (isGamePaused) return;

      setPreviousPlayer(activePlayer);
      setSelectedPlayer(randomPlayerIndex);
      setFlyingPlayers(true);

      if (kissTimeoutRef.current) clearTimeout(kissTimeoutRef.current);

      kissTimeoutRef.current = setTimeout(() => {
        if (isGamePaused) return;

        setShowKiss(true);

        const kissAudio = new Audio(kissSound);
        kissAudio.play();

        setKissCount((prevCount) => prevCount + 1);

        setTimeout(() => {
          if (isGamePaused) return;

          setActivePlayer(randomPlayerIndex);
          setIsSpinning(false);
          setShowKiss(false);
          setFlyingPlayers(false);
          setIsGameRunning(false);
          startGame();
        }, 2000);
      }, 2000);
    }, 4000);
  };

  const getRandomPlayerIndex = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * totalPlayers);
    } while (randomIndex === activePlayer);
    return randomIndex;
  };

  const startGame = () => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    if (isGameRunning) return;
    setTimer(3);
    setTimeout(() => {
      if (!isGamePaused) {
        setIsSpinning(true);
      }
    }, 3100);
  };

  const togglePauseGame = () => {
    setIsGamePaused((prev) => !prev);
  };

  return (
    <>
      <Counter kissCount={kissCount} />
      <button className="start" onClick={startGame} disabled={isGameStarted}>
        Начать игру
      </button>
      <button className="stop" onClick={togglePauseGame}>
        {isGamePaused ? "Продолжить" : "Остановить"}
      </button>
      <div className="table">
        {Players.map((player, index) => {
          const angle = (index / totalPlayers) * 2 * Math.PI;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const isPreviousFlying = flyingPlayers && previousPlayer === index;
          const isActiveFlying = flyingPlayers && selectedPlayer === index;

          return (
            <img
              className={`players ${activePlayer === index ? "active" : ""} ${
                isPreviousFlying
                  ? "move-center previous"
                  : isActiveFlying
                  ? "move-center active"
                  : ""
              }`}
              key={index}
              src={player}
              alt={`Player ${index + 1}`}
              style={{
                left: isPreviousFlying
                  ? "38%"
                  : isActiveFlying
                  ? "62%"
                  : `calc(41% + ${x}px)`,
                top:
                  isPreviousFlying || isActiveFlying
                    ? "40%"
                    : `calc(40% + ${y}px)`,
                transform:
                  isPreviousFlying || isActiveFlying
                    ? "translate(-50%, -50%)"
                    : "none",
                zIndex: isActiveFlying ? 2 : isPreviousFlying ? 1 : "auto",
              }}
            />
          );
        })}
        <img
          className={`bottle ${isSpinning ? "spin" : ""}`}
          src={bottle}
          alt="Bottle"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 4s ease-out" : "none",
          }}
        />
        {showKiss && (
          <div className="kiss-animation">
            <img className="kissImage" src={kissImage} alt="Kiss" />
          </div>
        )}
        {timer > 0 && <div className="timer">{timer}</div>}
      </div>
    </>
  );
}

export default App;
