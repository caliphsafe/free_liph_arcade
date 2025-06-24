import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat1 from '../assets/beat1.mp3';

export default function BeatBounceGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [audio] = useState(new Audio(beat1));
  const gravity = 0.5;
  const bounce = -10;

  const ball = useRef({
    x: 100,
    y: 150,
    vy: 0,
    radius: 20
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();

      // Apply gravity
      ball.current.vy += gravity;
      ball.current.y += ball.current.vy;

      // Bounce on bottom
      if (ball.current.y + ball.current.radius > canvas.height) {
        ball.current.vy = bounce;
      }

      // Game over if falls off screen
      if (ball.current.y > canvas.height + 50) {
        setGameOver(true);
        audio.pause();
        cancelAnimationFrame(animationFrameId);
        return;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    if (gameStarted && !gameOver) {
      draw();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, gameOver]);

  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      audio.play();
    }
    ball.current.vy = bounce;
  };

  const handleReset = () => {
    setGameOver(false);
    ball.current.y = 150;
    ball.current.vy = 0;
    setGameStarted(false);
  };

  const handleWin = () => {
    unlockTrack(1); // 🔐 Unlock track #1 (centralized logic)
    audio.pause();
    onUnlock?.();   // 🔁 Refresh playlist in UI
    setGameOver(true);
  };

  return (
    <div>
      {!gameStarted && !gameOver && (
        <div onClick={handleTap} className="centered">
          <button>Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="centered">
          <p>Game Over!</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
      {gameStarted && !gameOver && (
        <div>
          <canvas
            ref={canvasRef}
            onClick={handleTap}
            width={300}
            height={500}
            style={{ width: '100%', background: '#111', touchAction: 'manipulation' }}
          />
          {/* Temporary win trigger for testing */}
          <button onClick={handleWin} style={{ position: 'absolute', bottom: 20 }}>✔️ Dev Win</button>
        </div>
      )}
    </div>
  );
}
