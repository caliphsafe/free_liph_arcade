import React from 'react';

export default function ArcadeLayout({ children, gameNumber, onStart, instructions, started }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {/* Top HUD */}
      <div className="absolute top-4 w-full flex justify-between items-center px-6 z-10">
        <h1 className="text-2xl font-bold tracking-wide text-neon-green">FREE LIPH ARCADE</h1>
        <p className="text-lg text-gray-300">Game {gameNumber}/10</p>
      </div>

      {/* Canvas/Game Frame */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-neon-blue w-full max-w-md aspect-[3/5] bg-[#111]">
        {children}
      </div>

      {/* Instructions Overlay */}
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-4 text-center z-20">
          <h2 className="text-xl font-semibold mb-4">How to Play</h2>
          <p className="mb-6 text-gray-300 text-sm max-w-sm">{instructions}</p>
          <button
            onClick={onStart}
            className="bg-neon-pink text-black font-bold py-2 px-6 rounded-xl hover:bg-white transition"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Styles for neon colors */}
      <style jsx global>{`
        .text-neon-green { color: #39ff14; }
        .border-neon-blue { border-color: #00f0ff; }
        .bg-neon-pink { background-color: #ff00c8; }
      `}</style>
    </div>
  );
}
