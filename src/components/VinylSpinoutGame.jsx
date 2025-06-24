import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat5 from '../assets/beat5.mp3';

export default function VinylSpinoutGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [audio] = useState(new Audio(beat5));
  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTouchX = useRef(null);

  const SPIN_THRESHOLD = 2;     // required velocity
  const WIN_DURATION = 5000;    // ms to hold above threshold

  const holdTime = useRef(0);
  const lastTime = useRef(null);

  useEffect(() => {
    let frameId;
    const ctx = canvasRef.current.getContext('2d');

    const loop = (timestamp) => {
      const now = Date.now();
      if (!lastTime.current) lastTime.current = now;
      const delta = now - lastTime.current;
      lastTime.current = now;

      // Update physics
      let newVelocity = velocity * 0.98; // friction
      if (Math.abs(newVelocity) < 0.05) newVelocity = 0;

      const newAngle = angle + newVelocity;
      setAngle(newAngle);
      setVelocity(newVelocity);

      // Check progress
      if (Math.abs(newVelocity) >= SPIN_THRESHOLD) {
        holdTime.current += delta;
        setProgress((holdTime.current / WIN_DURATION) * 100);
        if (holdTime.current >= WIN_DURATION) {
          audio.pause();
          unlockTrack(5);
          onUnlock?.();
          setWin(true);
          return;
        }
      } else {
        holdTime.current = 0;
        setProgress(0);
      }

      if (gameStarted && newVelocity === 0) {
        setGameOver(true);
        audio.pause();
        return;
      }

      // Draw vinyl
      ctx.clearRect(0, 0, 300, 500);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 300, 500);
      ctx.save();
      ctx.translate(150, 250);
      ctx.rotate(newAngle);
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, 2 * Math.PI);
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#f00';
      ctx.fill();
      ctx.restore();

      // Draw progress
      ctx.fillStyle = '#fff';
      ctx.fillText(`Spin Power: ${Math.abs(newVelocity).toFixed(2)}`, 10, 20);
      ctx.fillText(`Progress: ${Math.floor(progress)}%`, 10, 40);

      frameId = requestAnimationFrame(loop);
    };

    if (gameStarted && !gameOver && !win) {
      loop();
    }

    return () => cancelAnimationFrame(frameId);
  }, [angle, velocity, gameStarted, gameOver, win]);

  const handleStart = () => {
    setGameStarted(true);
    setAngle(0);
    setVelocity(0);
    setProgress(0);
    holdTime.current = 0;
    audio.play();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setAngle(0);
    setVelocity(0);
    setProgress(0);
    audio.pause();
    audio.currentTime = 0;
  };

  const handleTouchStart = (e) => {
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (lastTouchX.current === null) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - lastTouchX.current;
    lastTouchX.current = currentX;
    setVelocity((v) => v + delta * 0.05);
  };

  return (
    <div>
      {!gameStarted && !gameOver && !win && (
        <div className="centered">
          <button onClick={handleStart}>Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="centered">
          <p>🛑 Vinyl stopped! Game Over.</p>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
      {win && (
        <div className="centered">
          <p>🎧 You Unlocked Track 5!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={300}
        height={500}
        style={{ width: '100%', background: '#111' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => (lastTouchX.current = null)}
      />
    </div>
  );
}
