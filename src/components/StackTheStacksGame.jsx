import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat3 from '../assets/beat3.mp3';

export default function StackTheStacksGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [audio] = useState(new Audio(beat3));
  const [stack, setStack] = useState([]);
  const [currentBox, setCurrentBox] = useState(null);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(2);
  const boxWidth = 80;
  const boxHeight = 20;
  const canvasWidth = 300;
  const canvasHeight = 500;
  const maxStacksToWin = 10;

  useEffect(() => {
    let animationId;

    const ctx = canvasRef.current.getContext('2d');

    const loop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw stacked boxes
      ctx.fillStyle = '#aaa';
      stack.forEach((b) => {
        ctx.fillRect(b.x, b.y, b.width, boxHeight);
      });

      // Draw moving box
      if (currentBox) {
        currentBox.x += direction * speed;
        if (currentBox.x <= 0 || currentBox.x + currentBox.width >= canvasWidth) {
          setDirection((d) => -d); // bounce off edge
        }
        ctx.fillStyle = '#0f0';
        ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, boxHeight);
      }

      animationId = requestAnimationFrame(loop);
    };

    if (gameStarted && !gameOver && !win) {
      loop();
    }

    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, gameOver, win, currentBox, stack]);

  const startGame = () => {
    audio.play();
    setGameStarted(true);
    setStack([{ x: 110, y: canvasHeight - boxHeight, width: boxWidth }]); // first crate
    setCurrentBox({
      x: 0,
      y: canvasHeight - (stack.length + 1) * boxHeight,
      width: boxWidth,
    });
  };

  const dropBox = () => {
    if (!currentBox) return;

    const lastBox = stack[stack.length - 1];
    const delta = Math.abs(currentBox.x - lastBox.x);

    if (delta > 30) {
      audio.pause();
      setGameOver(true);
      return;
    }

    // Adjust to match alignment better
    const newBox = {
      x: currentBox.x,
      y: canvasHeight - (stack.length + 1) * boxHeight,
      width: boxWidth,
    };

    const newStack = [...stack, newBox];
    setStack(newStack);

    // Win condition
    if (newStack.length >= maxStacksToWin) {
      unlockTrack(3);
      audio.pause();
      setWin(true);
      onUnlock?.();
      return;
    }

    setCurrentBox({
      x: 0,
      y: canvasHeight - (newStack.length + 1) * boxHeight,
      width: boxWidth,
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setStack([]);
    setCurrentBox(null);
    audio.pause();
    audio.currentTime = 0;
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
          <p>Game Over!</p>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
      {win && (
        <div className="centered">
          <p>✅ You Unlocked Track 3!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: '100%', background: '#111' }}
        onClick={dropBox}
      />
    </div>
  );
}
