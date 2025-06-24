import React, { useState } from 'react';
import BeatBounceGame from './components/BeatBounceGame';
import MicDropGame from './components/MicDropGame';
import StackTheStacksGame from './components/StackTheStacksGame';
import TapTempoGame from './components/TapTempoGame';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import VinylSpinoutGame from './components/VinylSpinoutGame';
import HiHatHeroGame from './components/HiHatHeroGame';
import LoopCrazeGame from './components/LoopCrazeGame';
import BassDropBounceGame from './components/BassDropBounceGame';
import RhythmSlideGame from './components/RhythmSlideGame';
import FinalFreestyleGame from './components/FinalFreestyleGame';

export default function App() {
  const [currentGame, setCurrentGame] = useState(1);

  const handleUnlockAndAdvance = () => {
    setCurrentGame((prev) => prev + 1);
  };

  const renderGame = () => {
    switch (currentGame) {
      case 1:
        return <BeatBounceGame onUnlock={handleUnlockAndAdvance} />;
      case 2:
        return <MicDropGame onUnlock={handleUnlockAndAdvance} />;
      case 3:
        return <StackTheStacksGame onUnlock={handleUnlockAndAdvance} />;
      case 4:
        return <TapTempoGame onUnlock={handleUnlockAndAdvance} />;
      case 5:
  		return <VinylSpinoutGame onUnlock={handleUnlockAndAdvance} />;
  	  case 6:
  		return <HiHatHeroGame onUnlock={handleUnlockAndAdvance} />;
  	  case 7:
 		return <LoopCrazeGame onUnlock={handleUnlockAndAdvance} />;
 	  case 8:
  		return <BassDropBounceGame onUnlock={handleUnlockAndAdvance} />;
  	  case 9:
  		return <RhythmSlideGame onUnlock={handleUnlockAndAdvance} />;
	  case 10:
 	    return <FinalFreestyleGame onUnlock={handleUnlockAndAdvance} />;
      default:
        return (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            🎉 You’ve unlocked all available games — full album coming soon!
          </p>
        );
    }
  };

  return (
    <div>
      {renderGame()}
      <FloatingMusicPlayer />
    </div>
  );
}
