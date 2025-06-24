import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat6 from '../assets/beat6.mp3';

export default function HiHatHeroGame({ onUnlock }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const audio = useRef(new Audio(beat6));
  const stepInterval = useRef(null);

  const STEPS = 4;
  const BPM = 120; // 120 beats per minute
  const STEP_DURATION = (60 / BPM) * 1000; // ms per step
  const MAX_SCORE = 15;
  const MAX_MISSES = 5;
  const TAP_WINDOW = 250; // ms timing window for valid tap

  const lastStepTime = useRef(0);

  useEffect(() => {
    if (gameStarted) {
      audio.current.play();
      lastStepTime.current = Date.now();

      stepInterval.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS);
        lastStepTime.current = Date.now();
      }, STEP_DURATION);
    }

    return () => {
      clearInterval(stepInterval.current);
      audio.current.pause();
      audio.current.currentTime = 0;
    };
  }, [gameStarted]);

  const handleTap = () => {
    if (!gameStarted) return;

    const now = Date.now();
    const diff = Math.abs(now - lastStepTime.current);

    if (diff <= TAP_WINDOW) {
      // Correct tap
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= MAX_SCORE) {
          unlockTrack(6);
          setWin(true);
          setGameStarted(false);
          audio.current.pause();
          onUnlock?.();
        }
        return newScore;
      });
    } else {
      // Missed tap
      setMisses((prev) => {
        const newMisses = prev + 1;
        if (newMisses >= MAX_MISSES) {
          setGameOver(true);
          setGameStarted(false);
          audio.current.pause();
        }
        return newMisses;
      });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setScore(0);
    setMisses(0);
    setCurrentStep(0);
    audio.current.pause();
    audio.current.currentTime = 0;
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setMisses(0);
  };

  return (
    <div>
      {!gameStarted && !gameOver && !win && (
        <div className="centered">
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameOver && (
        <div className="centered">
          <p>Game Over! Too many misses.</p>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}

      {win && (
        <div className="centered">
          <p>🎉 You Unlocked Track 6!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      <div
        onClick={handleTap}
        style={{
          margin: '1rem auto',
          width: '300px',
          height: '300px',
          backgroundColor: '#111',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
      >
        {[...Array(STEPS)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: currentStep === i ? '#0f0' : '#444',
              boxShadow: currentStep === i ? '0 0 15px #0f0' : 'none',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {gameStarted && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <p>Score: {score}</p>
          <p>Misses: {misses}</p>
          <p>Tap the active light in time!</p>
        </div>
      )}
    </div>
  );
}
