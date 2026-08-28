import React, { useState } from 'react';
import { X, Trophy, User, Medal, Calendar } from 'lucide-react';
import { PlayerProfile, LeaderboardEntry } from '../core/types';
import { GAME_LEVELS } from '../data/levels';
import { getGlobalLeaderboard } from '../core/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile | null;
  onEditName: () => void;
  initialLevelId?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onEditName,
  initialLevelId = 1,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState(initialLevelId);

  if (!isOpen) return null;

  const globalBoard = getGlobalLeaderboard();
  const selectedLevelConfig = GAME_LEVELS.find(l => l.id === selectedLevelId) || GAME_LEVELS[0];
  const entries: LeaderboardEntry[] = (globalBoard[selectedLevelId] || []).sort(
    (a, b) => b.sheepAlive - a.sheepAlive
  );

  const getRankBadge = (idx: number) => {
    if (idx === 0) return <span className="text-base">🥇</span>;
    if (idx === 1) return <span className="text-base">🥈</span>;
    if (idx === 2) return <span className="text-base">🥉</span>;
    return <span className="font-mono text-slate-400 font-bold text-xs">#{idx + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#182327] border border-[#2e4149] rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 max-h-[92vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3.5">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Global Player Leaderboard</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Player Bar */}
        <div className="flex items-center justify-between bg-[#12191c] px-3.5 py-2.5 rounded-xl border border-slate-800 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-400 font-bold text-xs">
              {profile?.name ? profile.name[0].toUpperCase() : 'P'}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Active Player</span>
              <span className="text-xs sm:text-sm font-bold text-white">{profile?.name || 'Player'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onEditName();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-[#1e2b30] hover:bg-[#283940] border border-slate-700 transition-all"
          >
            <User className="w-3 h-3 text-lime-400" />
            <span>Change Name</span>
          </button>
        </div>

        {/* Level Tabs Selector (Horizontal scrollable) */}
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Select Level
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {GAME_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelId(lvl.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                  selectedLevelId === lvl.id
                    ? 'bg-lime-600 text-black font-bold shadow-md shadow-lime-950/40'
                    : 'bg-[#121a1d] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Lvl {lvl.id} ({lvl.gridRows}×{lvl.gridCols})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Level Summary Header */}
        <div className="bg-[#141d21] p-3 rounded-xl border border-slate-800/80 mb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              {selectedLevelConfig.title}
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedLevelConfig.targetWeeks} weeks · {selectedLevelConfig.budgets.wolves} wolves · {selectedLevelConfig.gridRows}×{selectedLevelConfig.gridCols} grid
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Top Score</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-lime-400">
              {entries.length > 0 ? `${entries[0].sheepAlive} 🐑` : 'None yet'}
            </span>
          </div>
        </div>

        {/* Leaderboard Table / Rankings */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[180px]">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs">
              <Medal className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
              <span>No scores recorded yet for this level. Be the first to win!</span>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isCurrentPlayer = entry.playerName.toLowerCase() === (profile?.name || '').toLowerCase();

              return (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isCurrentPlayer
                      ? 'bg-gradient-to-r from-[#1b2b25] to-[#162227] border-lime-500/40 shadow-sm'
                      : 'bg-[#121a1d] border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 flex items-center justify-center">
                      {getRankBadge(idx)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isCurrentPlayer ? 'text-lime-300' : 'text-white'}`}>
                          {entry.playerName}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] bg-lime-500/20 text-lime-400 px-1.5 py-0.2 rounded font-bold uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs sm:text-sm font-bold text-sky-400 block">
                      🐑 {entry.sheepAlive} Alive
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {entry.weeksSurvived}w survived
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
          <span>Ranked by surviving sheep at deadline</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-lime-600 hover:bg-lime-500 text-black font-semibold text-xs transition-all"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
