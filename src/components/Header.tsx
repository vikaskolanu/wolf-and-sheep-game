import React from 'react';
import { GAME_LEVELS } from '../data/levels';
import { HelpCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onOpenRules: () => void;
  onResetLevel: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevelIndex,
  onSelectLevel,
  onOpenRules,
  onResetLevel,
  isSimulating,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#162024]/90 border-b border-[#25363c] backdrop-blur-md sticky top-0 z-40">
      {/* Brand & Level Picker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐺</span>
          <span className="font-bold text-base md:text-lg tracking-tight text-white">
            Ecosystem Reserve
          </span>
        </div>

        {/* Level Select Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-[#10181b] p-1 rounded-lg border border-slate-800">
          {GAME_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              disabled={isSimulating}
              onClick={() => onSelectLevel(idx)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                currentLevelIndex === idx
                  ? 'bg-lime-600 text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a262a]'
              } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Lvl {lvl.id}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Mobile Level Dropdown */}
        <select
          disabled={isSimulating}
          value={currentLevelIndex}
          onChange={(e) => onSelectLevel(Number(e.target.value))}
          className="sm:hidden bg-[#10181b] border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          {GAME_LEVELS.map((lvl, idx) => (
            <option key={lvl.id} value={idx}>
              Level {lvl.id} ({lvl.targetWeeks}w)
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onOpenRules}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#1e2c31] hover:bg-[#283b42] border border-slate-700/60 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-lime-400" />
          <span>Rules</span>
        </button>

        <button
          type="button"
          disabled={isSimulating}
          onClick={onResetLevel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#1e2c31] hover:bg-[#283b42] border border-slate-700/60 transition-all ${
            isSimulating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Reset current level board"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
