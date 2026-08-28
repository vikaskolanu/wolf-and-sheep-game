import React from 'react';
import { Play, Pause, StepForward, RotateCcw, FastForward, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LevelConfig, SimulationStatus } from '../core/types';

interface SimulationControlsProps {
  level: LevelConfig;
  status: SimulationStatus;
  currentWeek: number;
  speed: number;
  placedGrass: number;
  placedSheep: number;
  placedWolves: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
  onChangeSpeed: (newSpeed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  level,
  status,
  currentWeek,
  speed,
  placedGrass,
  placedSheep,
  placedWolves,
  onStart,
  onPause,
  onResume,
  onStep,
  onReset,
  onChangeSpeed,
}) => {
  const isSimulating = status === 'running' || status === 'paused';

  const isGrassFull = placedGrass === level.budgets.grass;
  const isSheepFull = placedSheep === level.budgets.sheep;
  const isWolvesFull = placedWolves === level.budgets.wolves;
  const allResourcesPlaced = isGrassFull && isSheepFull && isWolvesFull;

  if (!isSimulating) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full bg-[#182327]/85 border border-[#2b3c43] p-3 rounded-xl shadow-xl backdrop-blur-md">
        {/* Resource Allocation Status Helper */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {!allResourcesPlaced ? (
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Use all budget to unlock run:</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-lime-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All resources placed! Ready to simulate.</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[11px] border ${
              isGrassFull
                ? 'bg-lime-950/60 text-lime-300 border-lime-500/40'
                : 'bg-[#12191c] text-slate-400 border-slate-700'
            }`}>
              Grass: {placedGrass}/{level.budgets.grass}
            </span>

            <span className={`px-2 py-0.5 rounded text-[11px] border ${
              isSheepFull
                ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                : 'bg-[#12191c] text-slate-400 border-slate-700'
            }`}>
              Sheep: {placedSheep}/{level.budgets.sheep}
            </span>

            <span className={`px-2 py-0.5 rounded text-[11px] border ${
              isWolvesFull
                ? 'bg-red-950/60 text-red-300 border-red-500/40'
                : 'bg-[#12191c] text-slate-400 border-slate-700'
            }`}>
              Wolves: {placedWolves}/{level.budgets.wolves}
            </span>
          </div>
        </div>

        {/* Run Button - Greyed out until all resources are placed */}
        <button
          type="button"
          disabled={!allResourcesPlaced}
          onClick={onStart}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all w-full sm:w-auto shadow-lg ${
            allResourcesPlaced
              ? 'bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black shadow-lime-500/30 hover:scale-[1.02] cursor-pointer active:scale-95 animate-pulse'
              : 'bg-[#1e2a2f] text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
          }`}
          title={allResourcesPlaced ? "Start simulation" : "Place all grass, sheep, and wolves to enable run"}
        >
          <Play className={`w-4 h-4 ${allResourcesPlaced ? 'fill-black' : 'fill-slate-500'}`} />
          <span>Run Level {level.id} ({level.targetWeeks}w)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full bg-[#182327]/95 border border-[#2b3c43] p-3 rounded-xl shadow-2xl backdrop-blur-md">
      {/* Left: Week and Playback Control */}
      <div className="flex items-center gap-3">
        {status === 'running' ? (
          <button
            type="button"
            onClick={onPause}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-lime-600 hover:bg-lime-500 text-white font-medium text-sm transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume</span>
          </button>
        )}

        <button
          type="button"
          onClick={onStep}
          disabled={status === 'running'}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-all ${
            status === 'running'
              ? 'opacity-40 text-slate-500 cursor-not-allowed'
              : 'text-slate-200 bg-[#223137] hover:bg-[#2c3d44]'
          }`}
          title="Advance 1 week"
        >
          <StepForward className="w-4 h-4" />
          <span>Step (+1w)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-[#223137] hover:bg-[#2c3d44] hover:text-white border border-slate-700 transition-all"
          title="Reset placement"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Edit Placement</span>
        </button>
      </div>

      {/* Center: Week Counter */}
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-slate-400">Week:</span>
        <span className="text-lime-400 font-bold text-base px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
          {currentWeek} / {level.targetWeeks}
        </span>
      </div>

      {/* Right: Speed Multipliers */}
      <div className="flex items-center gap-1 bg-[#121a1d] p-1 rounded-lg border border-slate-800">
        <FastForward className="w-3.5 h-3.5 text-slate-500 mx-1" />
        {[0.25, 0.5, 1, 2].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChangeSpeed(s)}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-all ${
              speed === s
                ? 'bg-lime-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
