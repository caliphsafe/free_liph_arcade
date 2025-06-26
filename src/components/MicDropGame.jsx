import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat2 from '../assets/beat2.mp3';
import ArcadeLayout from './ArcadeLayout';

export default function MicDropGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const audio = useRef(null);
  const player = useRef({ x: 140, y: 450, size: 20 });
  const mics = useRef([]);
  const notes = useRef([]);
  const [score, setScore] = useState(0);
  const startTime = useRef(null);

  const canvasWidth = 300;
  const canvasHeight = 500;

  const spawnMic = () => {
    mics.current.push({ x: Math.random() * (canvasWidth - 20), y: -30, size: 20 });
  };

  const spawnNote = () => {
    notes.current.push({ x: Math.random() * (canvasWidth - 20), y: -30, size: 15 });
  };

  const handleMove = (direction) => {
    if (direction === 'left' && player.current.x > 0) {
      player.current.x -= 40;
    }
    if (direction === 'right' && player.current.x < canvasWidth - player.current.size) {
      player.current.x += 40;
    }
  };

  useEffect(() => {
    audio.current = new Audio(beat2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const loop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Player
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(player.current.x, player.current.y, player.current.size, player.current.size);

      // Mics
      ctx.fillStyle = '#ff0055';
      mics.current.forEach((mic) => {
        mic.y += 4;
        ctx.fillRect(mic.x, mic.y, mic.size, mic.size);

        if (
          mic.x < player.current.x + player.current.size &&
          mic.x + mic.size > player.current.x &&
          mic.y < player.current.y + player.current.size &&
          mic.y + mic.size > player.current.y
        ) {
          setGameOver(true);
          audio.current?.pause();
          cancelAnimationFrame(animationId);
        }
      });

      // Notes
      ctx.fillStyle = '#00f0ff';
      notes.current.forEach((note, i) => {
        note.y += 2;
        ctx.fillRect(note.x, note.y, note.size, note.size);

        if (
          note.x < player.current.x + player.current.size &&
          note.x + note.size > player.current.x &&
          note.y < player.current.y + player.current.size &&
          note.y + note.size > player.current.y
        ) {
          notes.current.splice(i, 1);
          setScore((s) => s + 1);
        }
      });

      const elapsed = Date.now() - startTime.current;
      if (elapsed >= 30000) {
        unlockTrack(2);
        audio.current?.pause();
        setWin(true);
        onUnlock?.();
        cancelAnimationFrame(animationId);
        return;
      }

      animationId = requestAnimationFrame(loop);
    };

    if (gameStarted && !gameOver && !win) {
      mics.current = [];
      notes.current = [];
      player.current = { x: 140, y: 450, size: 20 };
      setScore(0);
      startTime.current = Date.now();
      loop();
      const micSpawner = setInterval(spawnMic, 1000);
      const noteSpawner = setInterval(spawnNote, 1500);

      return () => {
        cancelAnimationFrame(animationId);
        clearInterval(micSpawner);
        clearInterval(noteSpawner);
      };
    }
  }, [gameStarted, gameOver, win]);

  const handleStart = () => {
    setGameStarted(true);
    audio.current?.play();
  };

  const handleReset = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setScore(0);
  };

  const handleSwipe = (e) => {
    const x = e.changedTouches[0].clientX;
    const startX = e.target.dataset.startx;
    const dir = x - startX > 0 ? 'right' : 'left';
    handleMove(dir);
  };

  return (
    <ArcadeLayout
      gameNumber={2}
      instructions="Dodge the falling mics and collect glowing notes to score. Survive for 30 seconds to unlock the track."
      onStart={handleStart}
      started={gameStarted}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: '100%', height: '100%', touchAction: 'none', borderRadius: '16px' }}
        onTouchStart={(e) => (e.target.dataset.startx = e.touches[0].clientX)}
        onTouchEnd={handleSwipe}
        onClick={(e) => {
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          handleMove(x < rect.width / 2 ? 'left' : 'right');
        }}
      />

      <p style={{ position: 'absolute', top: 10, right: 10, color: '#ccc', fontSize: '0.8rem' }}>
        Score: {score}
      </p>

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

      {win && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center z-20">
          <p className="text-xl mb-4">🔥 You Unlocked Track 2!</p>
          <button
            onClick={handleReset}
            className="bg-neon-pink text-black font-bold py-2 px-6 rounded-xl hover:bg-white transition"
          >
            Play Again
          </button>
        </div>
      )}
    </ArcadeLayout>
  );
}
