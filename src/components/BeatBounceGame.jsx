import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat1 from '../assets/beat1.mp3';

export default function BeatBounceGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const audio = useRef(null);
  const animationFrameId = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.5;
  const bounce = -10;

  const ball = useRef({
    x: 100,
    y: 150,
    vy: 0,
    radius: 20
  });

  useEffect(() => {
    // Lazy-load audio only after mount
    audio.current = new Audio(beat1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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

      // Game over if ball falls off screen
      if (ball.current.y > canvas.height + 50) {
        setGameOver(true);
        audio.current?.pause();
        cancelAnimationFrame(animationFrameId.current);
        return;
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    if (gameStarted && !gameOver) {
      animationFrameId.current = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameStarted, gameOver]);

  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      audio.current?.play();
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
    unlockTrack(1);
    audio.current?.pause();
    onUnlock?.();
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
          <button onClick={handleWin} style={{ position: 'absolute', bottom: 20 }}>
            ✔️ Dev Win
          </button>
        </div>
      )}
    </div>
  );
}
