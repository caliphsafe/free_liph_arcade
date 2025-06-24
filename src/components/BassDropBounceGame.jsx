import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat8 from '../assets/beat8.mp3';

export default function BassDropBounceGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [direction, setDirection] = useState(1); // 1 down, -1 up
  const audio = useRef(new Audio(beat8));
  const animationFrameId = useRef(null);

  const gravity = 1;
  const bounceHeight = 400;
  const ballRadius = 20;
  const MAX_SCORE = 20;
  const MAX_MISSES = 5;
  const TAP_WINDOW = 150; // ms timing window at bottom bounce

  const lastBounceTime = useRef(0);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, 300, 500);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 300, 500);

      // Draw ball
      ctx.beginPath();
      ctx.arc(150, ballY + ballRadius, ballRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f0';
      ctx.fill();

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`Misses: ${misses}`, 10, 60);
    };

    const update = () => {
      setBallY((prevY) => {
        let newY = prevY + velocityY * direction;
        if (newY >= bounceHeight) {
          newY = bounceHeight;
          setDirection(-1);
          lastBounceTime.current = Date.now();
        } else if (newY <= 0) {
          newY = 0;
          setDirection(1);
        }
        return newY;
      });
    };

    const loop = () => {
      if (gameStarted && !gameOver && !win) {
        update();
        draw();
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    if (gameStarted) {
      setVelocityY(15);
      animationFrameId.current = requestAnimationFrame(loop);
      audio.current.play();
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      audio.current.pause();
      audio.current.currentTime = 0;
    };
  }, [gameStarted, gameOver, win, score, misses, velocityY, direction, ballY]);

  const handleTap = () => {
    if (!gameStarted || gameOver || win) return;

    const now = Date.now();
    const delta = Math.abs(now - lastBounceTime.current);

    if (delta <= TAP_WINDOW && ballY >= bounceHeight - ballRadius * 2) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= MAX_SCORE) {
          unlockTrack(8);
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
    setBallY(0);
    setDirection(1);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setScore(0);
    setMisses(0);
    setBallY(0);
    setDirection(1);
    audio.current.pause();
    audio.current.currentTime = 0;
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
          <p>🎉 You Unlocked Track 8!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={300}
        height={500}
        style={{ width: '100%', background: '#111', touchAction: 'manipulation' }}
        onClick={handleTap}
      />
    </div>
  );
}
