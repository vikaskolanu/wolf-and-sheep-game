import React from 'react';
import { LevelConfig } from '../core/types';
import { EatenMarker, SheepSilhouette, StarvationIcon, WolfSilhouette } from './Icons';
import { Trophy } from 'lucide-react';

interface LevelObjectiveProps {
  level: LevelConfig;
  currentWeek: number;
  isSimulating: boolean;
  highScore?: number;
}

export const LevelObjective: React.FC<LevelObjectiveProps> = ({
  level,
  currentWeek,
  isSimulating,
  highScore,
}) => {
  return (
    <div className="flex flex-col gap-3.5 max-w-md w-full text-slate-200">
      {/* Title & Description */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {level.title}
          </h2>
          {highScore !== undefined && highScore > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-950/70 border border-lime-500/40 text-lime-300 text-xs font-mono font-bold shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Record: {highScore} 🐑</span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {level.description}
        </p>
      </div>

      {/* Objective Card */}
      <div className="bg-[#182327]/85 border border-[#2c3d44] rounded-xl p-3 sm:p-3.5 shadow-md">
        <span className="text-xs font-semibold uppercase tracking-wider text-lime-400 block mb-1">
          Objective
        </span>
        <p className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
          {level.objective}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 italic">
          You have unlimited attempts; discover the rules.
        </p>
      </div>

      {/* Legend Matching Screenshot */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs font-medium text-slate-300 bg-[#162024]/70 p-2.5 rounded-xl border border-[#25343a]">
        <div className="flex items-center gap-1.5">
          <SheepSilhouette className="w-4 h-4 text-slate-200" />
          <span>Sheep</span>
        </div>

        <div className="flex items-center gap-1.5">
          <WolfSilhouette className="w-4 h-4 text-red-500" />
          <span>Wolf</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-lime-500 inline-block shadow-sm" />
          <span>Green = grass</span>
        </div>

        <div className="flex items-center gap-1.5">
          <EatenMarker className="w-3.5 h-3.5 text-red-400 inline-block" />
          <span>X = eaten</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-600 flex items-center justify-center">
            <StarvationIcon className="w-2.5 h-2.5 text-white" />
          </div>
          <span>starvation</span>
        </div>
      </div>

      {/* Live Simulation Progress Indicator */}
      {isSimulating && (
        <div className="bg-[#1a262b] border border-cyan-800/40 rounded-xl p-3">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-cyan-300">Simulation Progress</span>
            <span className="text-cyan-400 font-bold">Week {currentWeek} / {level.targetWeeks}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-lime-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (currentWeek / level.targetWeeks) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
