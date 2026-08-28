import React from 'react';
import { X, Trophy, CheckCircle, Award, User, Star } from 'lucide-react';
import { PlayerProfile } from '../core/types';
import { GAME_LEVELS } from '../data/levels';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile | null;
  onEditName: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onEditName,
}) => {
  if (!isOpen) return null;

  const completedCount = profile?.completedLevels.length ?? 0;
  const totalLevels = GAME_LEVELS.length;
  const totalSheepSaved = profile
    ? Object.values(profile.levelScores).reduce((sum, score) => sum + score.highestSheep, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#182327] border border-[#2e4149] rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Reserve Records & High Scores</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Profile Summary */}
        <div className="flex items-center justify-between bg-[#12191c] p-3.5 rounded-xl border border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-400 font-bold text-base">
              {profile?.name ? profile.name[0].toUpperCase() : 'P'}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Manager</span>
              <span className="text-sm font-bold text-white">{profile?.name || 'Anonymous'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onEditName();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#1e2b30] hover:bg-[#283940] border border-slate-700 transition-all"
          >
            <User className="w-3.5 h-3.5 text-lime-400" />
            <span>Edit Name</span>
          </button>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-lime-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Levels Mastered</span>
              <span className="text-white font-bold text-sm">
                {completedCount} / {totalLevels}
              </span>
            </div>
          </div>

          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <Award className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Total Sheep Saved</span>
              <span className="text-sky-300 font-bold text-sm">🐑 {totalSheepSaved}</span>
            </div>
          </div>
        </div>

        {/* Level By Level Breakdown */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Level High Scores (Surviving Sheep)
          </span>

          {GAME_LEVELS.map(lvl => {
            const isCompleted = profile?.completedLevels.includes(lvl.id) ?? false;
            const score = profile?.levelScores[lvl.id];

            return (
              <div
                key={lvl.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-[#1a252a] border-lime-500/30'
                    : 'bg-[#12191c] border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-lime-500 text-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : lvl.id}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Level {lvl.id} ({lvl.gridRows}×{lvl.gridCols})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lvl.targetWeeks}w · {lvl.budgets.wolves} wolves
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  {isCompleted && score ? (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-lime-300">
                        {score.highestSheep} Sheep
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">Unbeaten</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-lime-600 hover:bg-lime-500 text-black font-semibold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
