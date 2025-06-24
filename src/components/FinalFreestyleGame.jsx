import React, { useState, useEffect, useRef } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat10 from '../assets/beat10.mp3';

const PAD_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

export default function FinalFreestyleGame({ onUnlock }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayingSequence, setDisplayingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const audio = useRef(new Audio(beat10));

  const SEQUENCES_TO_COMPLETE = 5;

  useEffect(() => {
    if (gameStarted) {
      audio.current.play();
      startNewSequence();
    } else {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  // Show sequence step-by-step
  useEffect(() => {
    if (displayingSequence) {
      if (currentStep >= sequence.length) {
        setDisplayingSequence(false);
        setCurrentStep(0);
        setPlayerInput([]);
        return;
      }

      const timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [currentStep, displayingSequence, sequence.length]);

  const startNewSequence = () => {
    // Add 1 or 2 new pads to the sequence
    const padsToAdd = Math.floor(Math.random() * 2) + 1;
    const newPads = [];

    for (let i = 0; i < padsToAdd; i++) {
      const randIndex = Math.floor(Math.random() * PAD_COLORS.length);
      newPads.push(randIndex);
    }

    setSequence((prev) => [...prev, ...newPads]);
    setDisplayingSequence(true);
    setCurrentStep(0);
    setPlayerInput([]);
  };

  const handlePadClick = (index) => {
    if (!gameStarted || displayingSequence || gameOver || win) return;

    const nextExpected = sequence[playerInput.length];
    if (index === nextExpected) {
      const newInput = [...playerInput, index];
      setPlayerInput(newInput);

      if (newInput.length === sequence.length) {
        if (sequence.length / 2 >= SEQUENCES_TO_COMPLETE) {
          unlockTrack(10);
          setWin(true);
          setGameStarted(false);
          audio.current.pause();
          onUnlock?.();
        } else {
          startNewSequence();
        }
      }
    } else {
      setGameOver(true);
      setGameStarted(false);
      audio.current.pause();
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setSequence([]);
    setPlayerInput([]);
    setCurrentStep(0);
    setDisplayingSequence(false);
    setGameOver(false);
    setWin(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setSequence([]);
    setPlayerInput([]);
    setCurrentStep(0);
    setDisplayingSequence(false);
    audio.current.pause();
    audio.current.currentTime = 0;
  };

  return (
    <div style={{ textAlign: 'center', color: '#fff' }}>
      {!gameStarted && !gameOver && !win && (
        <button onClick={startGame}>Start Final Freestyle</button>
      )}

      {gameOver && (
        <>
          <p>Game Over! You missed the combo.</p>
          <button onClick={resetGame}>Try Again</button>
        </>
      )}

      {win && (
        <>
          <p>🎉 You Unlocked the Final Track!</p>
          <button onClick={resetGame}>Play Again</button>
        </>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '300px',
          margin: '20px auto',
        }}
      >
        {PAD_COLORS.map((color, i) => {
          const isLit = displayingSequence && currentStep === sequence.indexOf(i);
          return (
            <button
              key={i}
              onClick={() => handlePadClick(i)}
              style={{
                padding: '40px',
                borderRadius: '15px',
                backgroundColor: isLit ? '#fff' : color,
                boxShadow: isLit ? '0 0 20px #fff' : 'none',
                border: 'none',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              disabled={displayingSequence}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
