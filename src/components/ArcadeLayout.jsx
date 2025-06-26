import React from 'react';

export default function ArcadeLayout({ children, gameNumber, instructions, onStart, started }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 pt-6 pb-20 relative">
      {/* Top HUD */}
      <div className="w-full max-w-md bg-[#111] border border-[#39ff14] rounded-2xl px-4 py-3 mb-4 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#39ff14] font-mono">Game {gameNumber}/10</span>
          {!started && (
            <button
              onClick={onStart}
              className="bg-[#39ff14] hover:bg-white text-black font-bold text-xs px-3 py-1 rounded-md transition"
            >
              ▶ Play
            </button>
          )}
        </div>
        <p className="text-xs text-gray-300 leading-snug font-light">
          {instructions}
        </p>
      </div>

      {/* Game Canvas */}
      <div className="w-full max-w-md aspect-[3/5] rounded-2xl overflow-hidden shadow-lg relative">
        {children}
      </div>
    </div>
  );
}
