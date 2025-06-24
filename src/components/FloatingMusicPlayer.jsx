import React, { useEffect, useState, useRef } from 'react';
import { getUnlockedTracks } from '../utils/unlock';

import beat1 from '../assets/beat1.mp3';
import beat2 from '../assets/beat2.mp3';
import beat3 from '../assets/beat3.mp3';
import beat4 from '../assets/beat4.mp3';
import beat5 from '../assets/beat5.mp3';
import beat6 from '../assets/beat6.mp3';
import beat7 from '../assets/beat7.mp3';
import beat8 from '../assets/beat8.mp3';
import beat9 from '../assets/beat9.mp3';
import beat10 from '../assets/beat10.mp3';

import trackArt from '../assets/album-art.gif';
import './FloatingMusicPlayer.css';

const allTracks = [
  { id: 1, title: "Track 1", src: beat1 },
  { id: 2, title: "Track 2", src: beat2 },
  { id: 3, title: "Track 3", src: beat3 },
  { id: 4, title: "Track 4", src: beat4 },
  { id: 5, title: "Track 5", src: beat5 },
  { id: 6, title: "Track 6", src: beat6 },
  { id: 7, title: "Track 7", src: beat7 },
  { id: 8, title: "Track 8", src: beat8 },
  { id: 9, title: "Track 9", src: beat9 },
  { id: 10, title: "Track 10", src: beat10 }
];

export default function FloatingMusicPlayer() {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [loop, setLoop] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const unlocked = getUnlockedTracks();
    const unlockedTracks = allTracks.filter((track) => unlocked.includes(track.id));
    setPlaylist(unlockedTracks);
    setShowUnlockAnim(true);
    setTimeout(() => setShowUnlockAnim(false), 2000);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playlist[currentIndex]) {
      const newAudio = new Audio(playlist[currentIndex].src);
      newAudio.volume = volume;
      newAudio.loop = loop;
      newAudio.ontimeupdate = () => {
        setProgress((newAudio.currentTime / newAudio.duration) * 100 || 0);
      };
      newAudio.onended = handleNext;
      if (isPlaying) newAudio.play();
      audioRef.current = newAudio;
    }
  }, [currentIndex, playlist, volume, loop]);

  const handlePlayPause = () => {
    if (!playlist.length || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else if (loop) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleLoop = () => {
    setLoop((prev) => !prev);
    if (audioRef.current) audioRef.current.loop = !loop;
  };

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className={`retro-player ${expanded ? 'expanded' : ''}`}>
      {showUnlockAnim && <div className="unlock-animation">🔓 Track Unlocked!</div>}
      <div className="player-header" onClick={toggleExpand}>
        <span>🎮 Jungle Juxe Player</span>
        <span>{expanded ? '▼' : '▲'}</span>
      </div>
      {expanded && (
        playlist.length > 0 ? (
          <>
            <div className="player-main">
              <img
                src={trackArt}
                alt="track art"
                className="pixel-art"
              />
              <div className="track-info">
                <div className="track-title">{playlist[currentIndex]?.title}</div>
                <div className="waveform">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="player-controls">
              <button onClick={handlePrev}>⏮</button>
              <button onClick={handlePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
              <button onClick={handleNext}>⏭</button>
              <button onClick={toggleLoop}>{loop ? '🔁 ON' : '🔁 OFF'}</button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </>
        ) : (
          <div className="locked-message">
            🔒 Unlock songs by playing games...
          </div>
        )
      )}
    </div>
  );
}
