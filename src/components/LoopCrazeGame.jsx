import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat7 from '../assets/beat7.mp3';

export default function LoopCrazeGame({ onUnlock }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const audio = useRef(new Audio(beat7));
  const stepInterval = useRef(null);

  const STEPS = 4;
  const PADS = ['kick', 'snare', 'hihat', 'clap'];
  const BPM = 100;
  const STEP_DURATION = (60 / BPM) * 1000;
  const MAX_SCORE = 20;
  const MAX_MISSES = 5;
  const TAP_WINDOW = 300;

  const lastStepTime = useRef(0);

  // We'll simulate the light-up pads pattern
  const padPattern = [
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat', 'clap'],
  ];

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

  const handlePadTap = (pad) => {
    if (!gameStarted) return;

    const now = Date.now();
    const diff = Math.abs(now - lastStepTime.current);

    const padsActive = padPattern[currentStep];

    if (diff <= TAP_WINDOW && padsActive.includes(pad)) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= MAX_SCORE) {
          unlockTrack(7);
          setWin(true);
          setGameStarted(false);
          audio.current.pause();
          onUnlock?.();
        }
        return newScore;
      });
    } else {
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

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setMisses(0);
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

  return (
    <div style={{ textAlign: 'center', color: '#fff' }}>
      {!gameStarted && !gameOver && !win && (
        <button onClick={startGame}>Start Game</button>
      )}

      {gameOver && (
        <>
          <p>Game Over! Too many misses.</p>
          <button onClick={resetGame}>Try Again</button>
        </>
      )}

      {win && (
        <>
          <p>🎉 You Unlocked Track 7!</p>
          <button onClick={resetGame}>Play Again</button>
        </>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          maxWidth: '300px',
          margin: '20px auto',
        }}
      >
        {['kick', 'snare', 'hihat', 'clap'].map((pad) => (
          <button
            key={pad}
            onClick={() => handlePadTap(pad)}
            style={{
              padding: '40px',
              fontSize: '1.2rem',
              borderRadius: '15px',
              backgroundColor: padPattern[currentStep].includes(pad) ? '#0f0' : '#444',
              color: '#fff',
              boxShadow: padPattern[currentStep].includes(pad)
                ? '0 0 15px #0f0'
                : 'none',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {pad.toUpperCase()}
          </button>
        ))}
      </div>

      {gameStarted && (
        <div>
          <p>Score: {score}</p>
          <p>Misses: {misses}</p>
          <p>Tap the lit pads in time!</p>
        </div>
      )}
    </div>
  );
}
