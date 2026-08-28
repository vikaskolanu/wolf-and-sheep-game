import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, ArrowRight } from 'lucide-react';
import { LevelConfig, SimulationSnapshot } from '../core/types';

interface ResultModalProps {
  outcome: 'victory' | 'defeat';
  level: LevelConfig;
  snapshot: SimulationSnapshot;
  onRetry: () => void;
  onNextLevel?: () => void;
  hasNextLevel: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  outcome,
  level,
  snapshot,
  onRetry,
  onNextLevel,
  hasNextLevel,
}) => {
  const isVictory = outcome === 'victory';

  useEffect(() => {
    if (isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#84cc16', '#38bdf8', '#fbbf24', '#f87171'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isVictory]);

  const totalSheepEaten = snapshot.sheep.filter(s => s.deathReason === 'eaten').length;
  const totalSheepStarved = snapshot.sheep.filter(s => s.deathReason === 'starved').length;
  const totalWolvesStarved = snapshot.wolves.filter(w => w.deathReason === 'starved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#182327] border border-[#2e4149] rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Top Header Badge */}
        <div className="flex justify-center mb-4">
          {isVictory ? (
            <div className="w-16 h-16 rounded-full bg-lime-500/20 border-2 border-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/30 animate-bounce">
              <Trophy className="w-8 h-8 text-lime-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Skull className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-black mb-1 ${isVictory ? 'text-lime-400' : 'text-red-400'}`}>
          {isVictory ? 'Ecosystem Sustained!' : 'Ecosystem Collapsed!'}
        </h3>
        <p className="text-sm text-slate-300 mb-4">
          {isVictory
            ? `Congratulations! You successfully maintained species balance over ${level.targetWeeks} weeks.`
            : snapshot.aliveSheepCount === 0
            ? 'All sheep were consumed before the deadline. Without prey, the wolves will starve.'
            : 'All wolves starved before the deadline. Predator balance lost.'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#121a1d] p-3 rounded-xl border border-slate-800 mb-3 text-xs">
          <div className="p-2 rounded bg-slate-900/60">
            <span className="text-slate-400 block mb-1">Weeks</span>
            <span className="text-white font-mono font-bold text-sm">
              {snapshot.week} / {level.targetWeeks}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900/60">
            <span className="text-slate-400 block mb-1">Sheep Alive</span>
            <span className="text-sky-400 font-mono font-bold text-sm">
              {snapshot.aliveSheepCount}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900/60">
            <span className="text-slate-400 block mb-1">Wolves Alive</span>
            <span className="text-red-400 font-mono font-bold text-sm">
              {snapshot.aliveWolvesCount}
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex justify-around text-[11px] font-mono text-slate-400 bg-[#141d21] p-2 rounded-lg mb-5 border border-slate-800">
          <span>Hunted: <strong className="text-red-400">{totalSheepEaten}</strong></span>
          <span>Sheep Starved: <strong className="text-amber-400">{totalSheepStarved}</strong></span>
          <span>Wolves Starved: <strong className="text-orange-400">{totalWolvesStarved}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#223137] hover:bg-[#2c3d44] text-slate-200 font-medium text-sm border border-slate-700 transition-all w-full"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {isVictory && hasNextLevel && onNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-lime-600 hover:bg-lime-500 text-black font-bold text-sm shadow-md shadow-lime-900/50 transition-all w-full"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
