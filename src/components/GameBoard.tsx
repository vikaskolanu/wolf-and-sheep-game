import { useState } from 'react';
import { CellState, LevelConfig, SheepEntity, ToolType, WolfEntity } from '../core/types';
import { SheepSilhouette, WolfSilhouette } from './Icons';

interface GameBoardProps {
  grid: CellState[][];
  sheep: SheepEntity[];
  wolves: WolfEntity[];
  level: LevelConfig;
  activeTool: ToolType;
  onCellClick: (r: number, c: number) => void;
  isSimulating: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  sheep,
  wolves,
  level,
  activeTool,
  onCellClick,
  isSimulating,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  const getSheepAt = (r: number, c: number) => sheep.filter(s => s.r === r && s.c === c);
  const getWolvesAt = (r: number, c: number) => wolves.filter(w => w.r === r && w.c === c);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 5x5 Main Grid Container */}
      <div className="relative p-2.5 rounded-xl bg-[#182327]/90 backdrop-blur-md border border-[#2b3d44] shadow-2xl">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${level.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.gridRows}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const cellSheep = getSheepAt(r, c);
              const cellWolves = getWolvesAt(r, c);
              const aliveSheep = cellSheep.filter(s => s.isAlive);
              const aliveWolves = cellWolves.filter(w => w.isAlive);

              const hasGrass = cell.isGrass && (cell.grassGrowth > 0 || !isSimulating);
              const isDepletedGrass = cell.isGrass && cell.grassGrowth === 0 && isSimulating;

              const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;

              // Tooltip text formatting
              let tooltipInfo = `(${r + 1}, ${c + 1})`;
              if (cell.isGrass) {
                tooltipInfo = `Grass: ${cell.grassGrowth}/5 ${aliveSheep.length > 0 ? `- ${aliveSheep.length} sheep present` : ''}`;
              } else if (aliveSheep.length > 0) {
                tooltipInfo = `Land - ${aliveSheep.length} sheep (1wk lifespan)`;
              } else if (aliveWolves.length > 0) {
                tooltipInfo = `Wolf territory (${aliveWolves[0].starvedWeeks} wks hunger)`;
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onCellClick(r, c)}
                  onMouseEnter={() => setHoveredCell({ r, c })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border ${
                    hasGrass
                      ? 'bg-[#a3e635] text-slate-900 border-[#84cc16] shadow-inner'
                      : isDepletedGrass
                      ? 'bg-[#3b472a] text-slate-300 border-[#4d5d37]'
                      : 'bg-[#212e33]/80 hover:bg-[#28383e] border-[#2f424a] text-slate-400'
                  } ${
                    !isSimulating && activeTool
                      ? 'hover:ring-2 hover:ring-lime-400/50 hover:scale-[1.02]'
                      : ''
                  }`}
                >
                  {/* Subtle Grid Coordinate Corner */}
                  <span className="absolute top-1 left-1.5 text-[9px] font-mono opacity-30 pointer-events-none">
                    {r + 1},{c + 1}
                  </span>

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d1416] text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-30 animate-fade-in">
                      {tooltipInfo}
                    </div>
                  )}

                  {/* Cell Content / Entities - Only render currently alive entities */}
                  <div className="flex items-center justify-center gap-1 w-full h-full p-1 relative z-10">
                    {/* Living Sheep (Max 1 per cell) */}
                    {aliveSheep.length > 0 && (
                      <div
                        className="relative group flex items-center justify-center transition-transform hover:scale-110"
                        title={`Sheep (${aliveSheep[0].fedRecently ? 'Fed on grass' : 'On land - 1wk lifespan'})`}
                      >
                        <SheepSilhouette
                          className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                            hasGrass ? 'text-[#1c2826]' : 'text-slate-200 drop-shadow-md'
                          } ${!aliveSheep[0].fedRecently && isSimulating ? 'text-amber-300' : ''}`}
                        />
                      </div>
                    )}

                    {/* Living Wolf (Max 1 per cell) */}
                    {aliveWolves.length > 0 && (
                      <div
                        className="relative group flex items-center justify-center transition-transform hover:scale-110 z-20"
                        title={`Wolf (Starvation: ${aliveWolves[0].starvedWeeks}/${level.rules.wolfStarveThreshold} wks)`}
                      >
                        <WolfSilhouette className="w-10 h-10 md:w-12 md:h-12 text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        {/* Hunger indicator */}
                        {aliveWolves[0].starvedWeeks > 1 && (
                          <span className="absolute -bottom-1.5 -right-1 bg-red-950 text-red-200 text-[9px] font-mono px-1 rounded border border-red-500/70">
                            {aliveWolves[0].starvedWeeks}w
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Empty state hint in placement mode */}
                  {!isSimulating && !hasGrass && aliveSheep.length === 0 && aliveWolves.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity">
                      <span className="text-2xl font-light text-slate-400">+</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
