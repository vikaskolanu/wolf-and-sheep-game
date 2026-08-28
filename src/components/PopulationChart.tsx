import React from 'react';
import { SimulationSnapshot } from '../core/types';

interface PopulationChartProps {
  history: SimulationSnapshot[];
  targetWeeks: number;
}

export const PopulationChart: React.FC<PopulationChartProps> = ({
  history,
  targetWeeks,
}) => {
  if (history.length === 0) return null;

  // Max value for scaling Y axis
  const maxPop = Math.max(
    8,
    ...history.map(h => Math.max(h.aliveSheepCount, h.aliveWolvesCount, Math.ceil(h.activeGrassCount / 2)))
  );

  const width = 380;
  const height = 110;
  const padding = 20;

  const pointsSheep = history.map((h, i) => {
    const x = padding + (i / Math.max(1, targetWeeks)) * (width - 2 * padding);
    const y = height - padding - (h.aliveSheepCount / maxPop) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pointsWolves = history.map((h, i) => {
    const x = padding + (i / Math.max(1, targetWeeks)) * (width - 2 * padding);
    const y = height - padding - (h.aliveWolvesCount / maxPop) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const latest = history[history.length - 1];

  return (
    <div className="bg-[#182327]/80 border border-[#2b3c43] p-3 rounded-lg shadow-md w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ecosystem Population Trend
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Sheep: {latest.aliveSheepCount}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Wolves: {latest.aliveWolvesCount}
          </span>
          <span className="flex items-center gap-1 text-lime-400">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            Grass: {latest.activeGrassCount}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#33474f" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#33474f" strokeDasharray="3,3" strokeWidth="0.5" />

        {/* Sheep Line (Sky blue) */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsSheep}
        />

        {/* Wolves Line (Red) */}
        <polyline
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsWolves}
        />

        {/* Current position markers */}
        {history.length > 0 && (
          <>
            <circle
              cx={padding + ((history.length - 1) / Math.max(1, targetWeeks)) * (width - 2 * padding)}
              cy={height - padding - (latest.aliveSheepCount / maxPop) * (height - 2 * padding)}
              r="3.5"
              fill="#38bdf8"
            />
            <circle
              cx={padding + ((history.length - 1) / Math.max(1, targetWeeks)) * (width - 2 * padding)}
              cy={height - padding - (latest.aliveWolvesCount / maxPop) * (height - 2 * padding)}
              r="3.5"
              fill="#ef4444"
            />
          </>
        )}
      </svg>
    </div>
  );
};
