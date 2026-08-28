import React from 'react';
import { GAME_LEVELS } from '../data/levels';
import { RefreshCw, Trophy, User } from 'lucide-react';
import { PlayerProfile } from '../core/types';

interface HeaderProps {
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onResetLevel: () => void;
  isSimulating: boolean;
  profile: PlayerProfile | null;
  onOpenLeaderboard: () => void;
  onEditPlayerName: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevelIndex,
  onSelectLevel,
  onResetLevel,
  isSimulating,
  profile,
  onOpenLeaderboard,
  onEditPlayerName,
}) => {
  const completedLevels = profile?.completedLevels || [];

  return (
    <header className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-2.5 bg-[#162024]/95 border-b border-[#25363c] backdrop-blur-md sticky top-0 z-40">
      {/* Brand & Level Picker */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-0.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl">🐺</span>
          <span className="font-bold text-sm sm:text-base tracking-tight text-white hidden md:inline">
            Ecosystem Reserve
          </span>
        </div>

        {/* Level Select Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-[#10181b] p-1 rounded-lg border border-slate-800 shrink-0">
          {GAME_LEVELS.map((lvl, idx) => {
            const isCompleted = completedLevels.includes(lvl.id);
            const isCurrent = currentLevelIndex === idx;

            return (
              <button
                key={lvl.id}
                disabled={isSimulating}
                onClick={() => onSelectLevel(idx)}
                className={`relative flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                  isCurrent
                    ? 'bg-lime-600 text-black shadow-sm font-bold'
                    : isCompleted
                    ? 'bg-[#1a2b27] text-lime-400 hover:bg-[#233b35] border border-lime-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a262a]'
                } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={`Level ${lvl.id}: ${lvl.gridRows}×${lvl.gridCols} (${lvl.targetWeeks}w)`}
              >
                <span>Lvl {lvl.id}</span>
                {isCompleted && (
                  <span className={`text-[10px] ${isCurrent ? 'text-black font-extrabold' : 'text-lime-400 font-bold'}`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons & Player Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Level Dropdown */}
        <select
          disabled={isSimulating}
          value={currentLevelIndex}
          onChange={e => onSelectLevel(Number(e.target.value))}
          className="sm:hidden bg-[#10181b] border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
        >
          {GAME_LEVELS.map((lvl, idx) => {
            const isCompleted = completedLevels.includes(lvl.id);
            return (
              <option key={lvl.id} value={idx}>
                {isCompleted ? '✓ ' : ''}Level {lvl.id} ({lvl.gridRows}×{lvl.gridCols})
              </option>
            );
          })}
        </select>

        {/* Player Name Pill */}
        <button
          type="button"
          onClick={onEditPlayerName}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#192428] hover:bg-[#223136] border border-slate-700/60 transition-all max-w-[130px] truncate"
          title="Change Player Name"
        >
          <User className="w-3.5 h-3.5 text-lime-400 shrink-0" />
          <span className="truncate">{profile?.name || 'Player'}</span>
        </button>

        {/* Leaderboard / High Scores Button */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 transition-all shadow-sm"
          title="View High Scores & Records"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline">Records</span>
        </button>

        {/* Reset Placement Button */}
        <button
          type="button"
          disabled={isSimulating}
          onClick={onResetLevel}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#1e2c31] hover:bg-[#283b42] border border-slate-700/60 transition-all ${
            isSimulating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Reset current level board"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
