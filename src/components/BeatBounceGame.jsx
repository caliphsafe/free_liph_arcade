import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat1 from '../assets/beat1.mp3';
import ArcadeLayout from './ArcadeLayout'; // ✅ import the shared layout

export default function BeatBounceGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const audio = useRef(null);
  const animationFrameId = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.5;
  const bounce = -10;

  const ball = useRef({
    x: 150,
    y: 150,
    vy: 0,
    radius: 20
  });

  useEffect(() => {
    audio.current = new Audio(beat1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon glowing ball
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#39ff14';
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Physics
      ball.current.vy += gravity;
      ball.current.y += ball.current.vy;

      if (ball.current.y + ball.current.radius > canvas.height) {
        ball.current.vy = bounce;
      }

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
    <ArcadeLayout
      gameNumber={1}
      instructions="Tap the screen to keep the ball bouncing. Don't let it fall off the bottom!"
      onStart={() => setGameStarted(true)}
      started={gameStarted}
    >
      <canvas
        ref={canvasRef}
        onClick={handleTap}
        width={300}
        height={500}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'manipulation',
          background: '#111',
          borderRadius: '16px'
        }}
      />

      {/* Optional Dev Button */}
      {gameStarted && !gameOver && (
        <button
          onClick={handleWin}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: '#ff00c8',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            zIndex: 20
          }}
        >
          ✔ Dev Win
        </button>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center z-20">
          <p className="text-xl mb-4">💀 Game Over!</p>
          <button
            onClick={handleReset}
            className="bg-neon-pink text-black font-bold py-2 px-6 rounded-xl hover:bg-white transition"
          >
            Try Again
          </button>
        </div>
      )}
    </ArcadeLayout>
  );
}
