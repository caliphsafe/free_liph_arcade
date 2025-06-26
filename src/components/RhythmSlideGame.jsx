import React, { useEffect, useRef, useState } from 'react';
import { unlockTrack } from '../utils/unlock';
import beat9 from '../assets/beat9.mp3';

const LANES = ['red', 'blue', 'green', 'yellow'];
const NOTE_SPEED = 3;
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 500;
const NOTE_SIZE = 40;
const MAX_SCORE = 20;
const MAX_MISSES = 5;
const HIT_ZONE_Y = CANVAS_HEIGHT - NOTE_SIZE * 2;
const HIT_WINDOW = 40;

function getLaneX(index) {
  return (CANVAS_WIDTH / LANES.length) * index + (CANVAS_WIDTH / LANES.length) / 2 - NOTE_SIZE / 2;
}

export default function RhythmSlideGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const audio = useRef(new Audio(beat9));
  const animationId = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastNoteTime, setLastNoteTime] = useState(0);

  const spawnNote = () => {
    const lane = Math.floor(Math.random() * LANES.length);
    setNotes((prev) => [...prev, { lane, y: -NOTE_SIZE }]);
  };

  const update = () => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes
        .map((note) => ({ ...note, y: note.y + NOTE_SPEED }))
        .filter((note) => {
          if (note.y > CANVAS_HEIGHT) {
            setMisses((m) => {
              const newMisses = m + 1;
              if (newMisses >= MAX_MISSES) {
                setGameOver(true);
                setGameStarted(false);
                audio.current.pause();
              }
              return newMisses;
            });
            return false;
          }
          return true;
        });
      return updatedNotes;
    });
  };

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    LANES.forEach((color, i) => {
      ctx.fillStyle = color;
      const x = (CANVAS_WIDTH / LANES.length) * i;
      ctx.fillRect(x, 0, CANVAS_WIDTH / LANES.length, CANVAS_HEIGHT);
    });

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, HIT_ZONE_Y + NOTE_SIZE);
    ctx.lineTo(CANVAS_WIDTH, HIT_ZONE_Y + NOTE_SIZE);
    ctx.stroke();

    notes.forEach((note) => {
      ctx.fillStyle = LANES[note.lane];
      const x = getLaneX(note.lane);
      ctx.beginPath();
      ctx.arc(x + NOTE_SIZE / 2, note.y + NOTE_SIZE / 2, NOTE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Misses: ${misses}`, 10, 40);
  };

  const gameLoop = () => {
    if (!gameStarted || gameOver || win) return;
    const now = Date.now();
    if (now - lastNoteTime > 1000) {
      spawnNote();
      setLastNoteTime(now);
    }
    update();
    draw();
    animationId.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameStarted) {
      audio.current.play();
      animationId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      cancelAnimationFrame(animationId.current);
      audio.current.pause();
      audio.current.currentTime = 0;
    };
  }, [gameStarted]);

  const handleTap = (e) => {
    if (!gameStarted || gameOver || win) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;

    const laneWidth = CANVAS_WIDTH / LANES.length;
    const tappedLane = Math.floor(x / laneWidth);

    const noteIndex = notes.findIndex(
      (note) =>
        note.lane === tappedLane &&
        note.y >= HIT_ZONE_Y - HIT_WINDOW &&
        note.y <= HIT_ZONE_Y + HIT_WINDOW
    );

    if (noteIndex !== -1) {
      setNotes((prev) => {
        const newNotes = [...prev];
        newNotes.splice(noteIndex, 1);
        return newNotes;
      });
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= MAX_SCORE) {
          unlockTrack(9);
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

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setNotes([]);
    setScore(0);
    setMisses(0);
    audio.current.pause();
    audio.current.currentTime = 0;
  };

  return (
    <div>
      {!gameStarted && !gameOver && !win && (
        <div className="centered">
          <button onClick={() => setGameStarted(true)}>Start Game</button>
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
          <p>🎉 You Unlocked Track 9!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: '100%', background: '#111', touchAction: 'manipulation' }}
        onClick={handleTap}
        onTouchStart={handleTap}
      />
    </div>
  );
}