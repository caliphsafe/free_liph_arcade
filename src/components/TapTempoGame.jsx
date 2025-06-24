import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat4 from '../assets/beat4.mp3';

export default function TapTempoGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [audio] = useState(new Audio(beat4));
  const [beatTimes, setBeatTimes] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const beatInterval = 1000;
  const beatFlashTime = 100;
  const flashRef = useRef(false);
  const beatTimer = useRef(null);

  const maxHits = 10;
  const maxMisses = 3;

  const startGame = () => {
    audio.play();
    setGameStarted(true);
    setScore(0);
    setMisses(0);
    flashBeat();
    beatTimer.current = setInterval(flashBeat, beatInterval);
  };

  const flashBeat = () => {
    const now = Date.now();
    setBeatTimes((prev) => [...prev.slice(-4), now]);
    flashRef.current = true;
    setTimeout(() => (flashRef.current = false), beatFlashTime);
  };

  const handleTap = () => {
    const now = Date.now();
    const closestBeat = beatTimes.reduce((prev, curr) =>
      Math.abs(curr - now) < Math.abs(prev - now) ? curr : prev,
    );
    const delta = Math.abs(now - closestBeat);

    if (delta <= 200) {
      setScore((s) => s + 1);
      if (score + 1 >= maxHits) {
        clearInterval(beatTimer.current);
        unlockTrack(4);
        onUnlock?.();
        audio.pause();
        setWin(true);
      }
    } else {
      setMisses((m) => m + 1);
      if (misses + 1 >= maxMisses) {
        clearInterval(beatTimer.current);
        audio.pause();
        setGameOver(true);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setScore(0);
    setMisses(0);
    audio.pause();
    audio.currentTime = 0;
    clearInterval(beatTimer.current);
    setBeatTimes([]);
  };

  useEffect(() => {
    return () => clearInterval(beatTimer.current);
  }, []);

  return (
    <div>
      {!gameStarted && !gameOver && !win && (
        <div className="centered">
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="centered">
          <p>Missed too many! Game Over.</p>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
      {win && (
        <div className="centered">
          <p>🎵 You Unlocked Track 4!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={300}
        height={500}
        style={{ width: '100%', background: flashRef.current ? '#0f0' : '#111' }}
        onClick={handleTap}
      />
      {gameStarted && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <p>Score: {score}</p>
          <p>Misses: {misses}</p>
        </div>
      )}
    </div>
  );
}
