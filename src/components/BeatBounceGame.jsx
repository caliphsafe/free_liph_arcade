import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat1 from '../assets/beat1.mp3';
import ArcadeLayout from './ArcadeLayout';

export default function BeatBounceGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const audio = useRef(null);
  const animationFrameId = useRef(null);
  const lastTapRef = useRef(Date.now());

  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [win, setWin] = useState(false);

  const gravity = 0.5;
  const bounce = -10;

  const ball = useRef({
    x: 150,
    y: 150,
    vy: 0,
    radius: 20,
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

      // Draw glowing ball
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#39ff14';
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Apply gravity and bounce
      ball.current.vy += gravity;
      ball.current.y += ball.current.vy;

      // Bounce logic
      if (ball.current.y + ball.current.radius > canvas.height) {
        ball.current.vy = bounce;
      }

      // Lose if ball falls off bottom
      if (ball.current.y > canvas.height + 50) {
        handleGameOver();
        return;
      }

      // Check tap timeout (player must interact)
      if (Date.now() - lastTapRef.current > 2000) {
        handleGameOver();
        return;
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    if (gameStarted && !gameOver && !win) {
      animationFrameId.current = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameStarted, gameOver, win]);

  useEffect(() => {
    if (gameStarted && !gameOver && !win) {
      const timeout = setTimeout(() => {
        handleWin();
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [gameStarted, gameOver, win]);

  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      audio.current?.play();
    }
    ball.current.vy = bounce;
    lastTapRef.current = Date.now();
  };

  const handleReset = () => {
    setGameOver(false);
    setGameStarted(false);
    setWin(false);
    ball.current.y = 150;
    ball.current.vy = 0;
    lastTapRef.current = Date.now();
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    audio.current?.pause();
    cancelAnimationFrame(animationFrameId.current);
  };

  const handleWin = () => {
    unlockTrack(1);
    setWin(true);
    setGameStarted(false);
    audio.current?.pause();
  };

  const handleNext = () => {
    onUnlock?.();
  };

  return (
    <ArcadeLayout
      gameNumber={1}
      instructions="Tap to keep the ball bouncing. If it drops or you stop tapping for too long, you lose!"
      onStart={handleReset}
      started={gameStarted || gameOver || win}
    >
      <canvas
        ref={canvasRef}
        onClick={handleTap}
        width={300}
        height={450}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'manipulation',
          background: '#111',
          borderRadius: '16px',
        }}
      />

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center z-20 px-4">
          <p className="text-2xl mb-4">💀 Game Over</p>
          <p className="mb-4 text-sm text-gray-300">Try again to unlock the track.</p>
          <button
            onClick={handleReset}
            className="bg-neon-pink text-black font-bold py-2 px-6 rounded-xl hover:bg-white transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Win Overlay */}
      {win && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center z-20 px-4">
          <p className="text-2xl mb-4">🎉 You Unlocked Track 1!</p>
          <p className="mb-4 text-sm text-gray-300">The song is now active in your music player.</p>
          <button
            onClick={handleNext}
            className="bg-neon-green text-black font-bold py-2 px-6 rounded-xl hover:bg-white transition"
          >
            Next Game →
          </button>
        </div>
      )}
    </ArcadeLayout>
  );
}
