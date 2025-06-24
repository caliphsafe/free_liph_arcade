// utils/unlock.js

// Unlock a specific track and persist in localStorage
export const unlockTrack = (id) => {
  localStorage.setItem(`unlockedTrack${id}`, 'true');
};

// Check if a specific track is unlocked
export const isTrackUnlocked = (id) => {
  return localStorage.getItem(`unlockedTrack${id}`) === 'true';
};

// Get an array of all unlocked track IDs (1–10)
export const getUnlockedTracks = () => {
  const unlocked = [];
  for (let i = 1; i <= 10; i++) {
    if (isTrackUnlocked(i)) {
      unlocked.push(i);
    }
  }
  return unlocked;
};

// (Optional) Clear all unlocked tracks — useful for dev
export const resetUnlockedTracks = () => {
  for (let i = 1; i <= 10; i++) {
    localStorage.removeItem(`unlockedTrack${i}`);
  }
};
