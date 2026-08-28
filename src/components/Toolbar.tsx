import React from 'react';
import { ToolType } from '../core/types';
import { GrassTileIcon, SheepSilhouette, WolfSilhouette } from './Icons';
import { Trash2 } from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  placedGrass: number;
  maxGrass: number;
  placedSheep: number;
  maxSheep: number;
  placedWolves: number;
  maxWolves: number;
  onClearBoard: () => void;
  isSimulating: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  placedGrass,
  maxGrass,
  placedSheep,
  maxSheep,
  placedWolves,
  maxWolves,
  onClearBoard,
  isSimulating,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#182327]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#2d3f46] shadow-xl">
      {/* Grass Tool */}
      <button
        type="button"
        disabled={isSimulating}
        onClick={() => onSelectTool(activeTool === 'grass' ? null : 'grass')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeTool === 'grass'
            ? 'bg-[#2a3c43] text-lime-400 border border-lime-500/50 shadow-sm shadow-lime-500/20'
            : 'text-slate-300 hover:text-white hover:bg-[#223035] border border-transparent'
        } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-4 h-4 rounded bg-lime-500/30 flex items-center justify-center text-lime-400">
          <GrassTileIcon className="w-3.5 h-3.5" />
        </div>
        <span>Grass patch</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
          placedGrass === maxGrass ? 'bg-lime-900/50 text-lime-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {placedGrass}/{maxGrass}
        </span>
      </button>

      {/* Sheep Tool */}
      <button
        type="button"
        disabled={isSimulating}
        onClick={() => onSelectTool(activeTool === 'sheep' ? null : 'sheep')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeTool === 'sheep'
            ? 'bg-[#2a3c43] text-slate-100 border border-sky-400/50 shadow-sm shadow-sky-500/20 ring-1 ring-sky-400/30'
            : 'text-slate-300 hover:text-white hover:bg-[#223035] border border-transparent'
        } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-4 h-4 rounded bg-slate-200/20 flex items-center justify-center text-slate-200">
          <SheepSilhouette className="w-3.5 h-3.5 text-slate-100" />
        </div>
        <span>Sheep</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
          placedSheep === maxSheep ? 'bg-sky-900/50 text-sky-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {placedSheep}/{maxSheep}
        </span>
      </button>

      {/* Wolf Tool */}
      <button
        type="button"
        disabled={isSimulating}
        onClick={() => onSelectTool(activeTool === 'wolf' ? null : 'wolf')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeTool === 'wolf'
            ? 'bg-[#2a3c43] text-red-400 border border-red-500/50 shadow-sm shadow-red-500/20 ring-1 ring-red-500/30'
            : 'text-slate-300 hover:text-white hover:bg-[#223035] border border-transparent'
        } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center text-red-400">
          <WolfSilhouette className="w-3.5 h-3.5 text-red-400" />
        </div>
        <span>Wolf</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
          placedWolves === maxWolves ? 'bg-red-900/50 text-red-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {placedWolves}/{maxWolves}
        </span>
      </button>

      <div className="h-5 w-px bg-slate-700 mx-1" />

      {/* Clear Board */}
      <button
        type="button"
        disabled={isSimulating}
        onClick={onClearBoard}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 transition-all ${
          isSimulating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Clear board</span>
      </button>
    </div>
  );
};
