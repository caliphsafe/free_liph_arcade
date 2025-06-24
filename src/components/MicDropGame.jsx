import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat2 from '../assets/beat2.mp3';

export default function MicDropGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [audio] = useState(new Audio(beat2));
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const loop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw player
      ctx.fillStyle = '#0f0';
      ctx.fillRect(player.current.x, player.current.y, player.current.size, player.current.size);

      // Draw mics
      ctx.fillStyle = '#f00';
      mics.current.forEach((mic) => {
        mic.y += 4;
        ctx.fillRect(mic.x, mic.y, mic.size, mic.size);

        // Collision
        if (
          mic.x < player.current.x + player.current.size &&
          mic.x + mic.size > player.current.x &&
          mic.y < player.current.y + player.current.size &&
          mic.y + mic.size > player.current.y
        ) {
          setGameOver(true);
          audio.pause();
          return cancelAnimationFrame(animationId);
        }
      });

      // Draw notes
      ctx.fillStyle = '#0ff';
      notes.current.forEach((note, index) => {
        note.y += 2;
        ctx.fillRect(note.x, note.y, note.size, note.size);

        if (
          note.x < player.current.x + player.current.size &&
          note.x + note.size > player.current.x &&
          note.y < player.current.y + player.current.size &&
          note.y + note.size > player.current.y
        ) {
          notes.current.splice(index, 1);
          setScore((prev) => prev + 1);
        }
      });

      // Win condition
      const timePassed = Date.now() - startTime.current;
      if (timePassed >= 30000) {
        unlockTrack(2);
        onUnlock?.();
        setWin(true);
        audio.pause();
        return cancelAnimationFrame(animationId);
      }

      animationId = requestAnimationFrame(loop);
    };

    if (gameStarted && !gameOver && !win) {
      startTime.current = Date.now();
      mics.current = [];
      notes.current = [];
      player.current = { x: 140, y: 450, size: 20 };
      setScore(0);
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
    audio.play();
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
    const direction = x - startX > 0 ? 'right' : 'left';
    handleMove(direction);
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
          <p>Game Over!</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
      {win && (
        <div className="centered">
          <p>🔥 You Unlocked Track 2!</p>
          <button onClick={handleReset}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: '100%', touchAction: 'none' }}
        onTouchStart={(e) => e.target.dataset.startx = e.touches[0].clientX}
        onTouchEnd={handleSwipe}
        onClick={(e) => {
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          handleMove(x < rect.width / 2 ? 'left' : 'right');
        }}
      />
      <p style={{ color: '#fff', textAlign: 'center' }}>Score: {score}</p>
    </div>
  );
}
