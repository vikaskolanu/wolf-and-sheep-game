import React from 'react';
import { Play, Pause, StepForward, RotateCcw, FastForward } from 'lucide-react';
import { LevelConfig, SimulationStatus } from '../core/types';

interface SimulationControlsProps {
  level: LevelConfig;
  status: SimulationStatus;
  currentWeek: number;
  speed: number;
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
  onStart,
  onPause,
  onResume,
  onStep,
  onReset,
  onChangeSpeed,
}) => {
  const isSimulating = status === 'running' || status === 'paused';

  if (!isSimulating) {
    return (
      <div className="flex items-center justify-end w-full">
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-lime-950/40 hover:shadow-lime-600/30 transition-all transform active:scale-95 text-sm md:text-base border border-lime-400/30"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Level {level.id} ({level.targetWeeks} weeks)</span>
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
