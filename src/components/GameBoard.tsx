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

  // Dynamic max-width based on grid size to look great on desktop while fitting mobile perfectly
  const maxWidthClass =
    level.gridCols <= 4
      ? 'max-w-[380px]'
      : level.gridCols === 5
      ? 'max-w-[460px]'
      : level.gridCols === 6
      ? 'max-w-[500px]'
      : 'max-w-[540px]';

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full px-1">
      {/* Responsive Grid Container with Aspect Ratio */}
      <div className={`w-full ${maxWidthClass} aspect-square p-2 sm:p-3 rounded-2xl bg-[#182327]/95 backdrop-blur-md border border-[#2b3d44] shadow-2xl flex flex-col justify-center`}>
        <div
          className="grid gap-1 sm:gap-1.5 w-full h-full"
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
                tooltipInfo = `Grass ${aliveSheep.length > 0 ? '· Sheep Present' : ''}`;
              } else if (aliveSheep.length > 0) {
                tooltipInfo = `Land · Sheep (1wk)`;
              } else if (aliveWolves.length > 0) {
                tooltipInfo = `Wolf (${aliveWolves[0].starvedWeeks}w hunger)`;
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onCellClick(r, c)}
                  onMouseEnter={() => setHoveredCell({ r, c })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`relative w-full h-full aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 border select-none overflow-hidden ${
                    hasGrass
                      ? 'bg-[#a3e635] text-slate-900 border-[#84cc16] shadow-inner'
                      : isDepletedGrass
                      ? 'bg-[#3b472a] text-slate-300 border-[#4d5d37]'
                      : 'bg-[#212e33]/85 hover:bg-[#28383e] border-[#2f424a] text-slate-400'
                  } ${
                    !isSimulating && activeTool
                      ? 'hover:ring-2 hover:ring-lime-400/50 hover:scale-[1.02]'
                      : ''
                  }`}
                >
                  {/* Subtle Grid Coordinate Corner */}
                  <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-mono opacity-25 pointer-events-none">
                    {r + 1},{c + 1}
                  </span>

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0d1416] text-slate-200 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-30 animate-fade-in hidden sm:block">
                      {tooltipInfo}
                    </div>
                  )}

                  {/* Cell Content / Entities - Strictly 1 animal at a time */}
                  <div className="flex items-center justify-center w-full h-full p-1 relative z-10">
                    {/* Living Sheep */}
                    {aliveSheep.length > 0 && (
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform hover:scale-105"
                        title={`Sheep (${aliveSheep[0].fedRecently ? 'Fed on grass' : 'On land - 1wk lifespan'})`}
                      >
                        <SheepSilhouette
                          className={`w-[75%] h-[75%] max-w-[48px] max-h-[48px] transition-colors ${
                            hasGrass ? 'text-[#1c2826]' : 'text-slate-200 drop-shadow-md'
                          } ${!aliveSheep[0].fedRecently && isSimulating ? 'text-amber-300 animate-pulse' : ''}`}
                        />
                      </div>
                    )}

                    {/* Living Wolf */}
                    {aliveWolves.length > 0 && (
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform hover:scale-105 z-20 relative"
                        title={`Wolf (Hunger: ${aliveWolves[0].starvedWeeks}/${level.rules.wolfStarveThreshold}w)`}
                      >
                        <WolfSilhouette className="w-[80%] h-[80%] max-w-[50px] max-h-[50px] text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        {/* Hunger indicator */}
                        {aliveWolves[0].starvedWeeks > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-red-950/90 text-red-200 text-[8px] font-mono px-1 rounded border border-red-500/70 pointer-events-none">
                            {aliveWolves[0].starvedWeeks}w
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Empty state hint in placement mode */}
                  {!isSimulating && !hasGrass && aliveSheep.length === 0 && aliveWolves.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity">
                      <span className="text-xl sm:text-2xl font-light text-slate-400">+</span>
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
