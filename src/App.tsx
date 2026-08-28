import { useState, useEffect, useCallback } from 'react';
import { GAME_LEVELS } from './data/levels';
import {
  CellState,
  SheepEntity,
  WolfEntity,
  ToolType,
  SimulationStatus,
  SimulationSnapshot,
  LevelConfig,
  PlayerProfile,
} from './core/types';
import {
  createInitialGrid,
  stepSimulation,
  evaluateSimulationOutcome,
} from './core/simulation';
import {
  getStoredPlayerProfile,
  savePlayerProfile,
  recordLevelVictory,
} from './core/storage';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { GameBoard } from './components/GameBoard';
import { LevelObjective } from './components/LevelObjective';
import { SimulationControls } from './components/SimulationControls';
import { PopulationChart } from './components/PopulationChart';
import { ResultModal } from './components/ResultModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PlayerNameModal } from './components/PlayerNameModal';

export function App() {
  // Start from Level 1 (index 0)
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel: LevelConfig = GAME_LEVELS[levelIndex];

  // Player Profile and Modal state
  const [profile, setProfile] = useState<PlayerProfile | null>(() => getStoredPlayerProfile());
  const [isNameModalOpen, setIsNameModalOpen] = useState(() => !getStoredPlayerProfile()?.name);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Placement state
  const [activeTool, setActiveTool] = useState<ToolType>('grass');
  const [grid, setGrid] = useState<CellState[][]>(() =>
    createInitialGrid(currentLevel.gridRows, currentLevel.gridCols, currentLevel.preplaced?.grass)
  );
  const [sheep, setSheep] = useState<SheepEntity[]>([]);
  const [wolves, setWolves] = useState<WolfEntity[]>([]);

  // Simulation execution state
  const [status, setStatus] = useState<SimulationStatus>('placement');
  const [speed, setSpeed] = useState<number>(1);
  const [history, setHistory] = useState<SimulationSnapshot[]>([]);
  const [initialPlacementSnapshot, setInitialPlacementSnapshot] = useState<{
    grid: CellState[][];
    sheep: SheepEntity[];
    wolves: WolfEntity[];
  } | null>(null);

  const [resultOutcome, setResultOutcome] = useState<'victory' | 'defeat' | null>(null);

  const isSimulating = status === 'running' || status === 'paused';

  // Budget calculations
  const placedGrassCount = grid.flat().filter(c => c.isGrass).length;
  const placedSheepCount = sheep.filter(s => s.isAlive).length;
  const placedWolvesCount = wolves.filter(w => w.isAlive).length;

  // Initialize or reset level
  const resetLevel = useCallback((lvlIndex: number) => {
    const lvl = GAME_LEVELS[lvlIndex];
    setGrid(createInitialGrid(lvl.gridRows, lvl.gridCols, lvl.preplaced?.grass));
    setSheep([]);
    setWolves([]);
    setStatus('placement');
    setHistory([]);
    setInitialPlacementSnapshot(null);
    setResultOutcome(null);
    setIsNewHighScore(false);
    setActiveTool('grass');
  }, []);

  // When level index changes
  const handleSelectLevel = (newIdx: number) => {
    setLevelIndex(newIdx);
    resetLevel(newIdx);
  };

  // Player name handler
  const handleSavePlayerName = (name: string) => {
    const existing = profile || {
      name,
      levelScores: {},
      completedLevels: [],
    };
    const updated: PlayerProfile = {
      ...existing,
      name,
    };
    savePlayerProfile(updated);
    setProfile(updated);
    setIsNameModalOpen(false);
  };

  // Cell interaction logic during placement
  const handleCellClick = (r: number, c: number) => {
    if (isSimulating) return;

    if (activeTool === 'grass') {
      const currentCell = grid[r][c];
      if (currentCell.isGrass) {
        // Remove grass
        setGrid(prev =>
          prev.map((row, rowIdx) =>
            row.map((cell, colIdx) =>
              rowIdx === r && colIdx === c
                ? { ...cell, isGrass: false, grassGrowth: 0 }
                : cell
            )
          )
        );
      } else {
        // Add grass if within budget
        if (placedGrassCount < currentLevel.budgets.grass) {
          setGrid(prev =>
            prev.map((row, rowIdx) =>
              row.map((cell, colIdx) =>
                rowIdx === r && colIdx === c
                  ? { ...cell, isGrass: true, grassGrowth: 5 }
                  : cell
              )
            )
          );
        }
      }
    } else if (activeTool === 'sheep') {
      const existingSheepIdx = sheep.findIndex(s => s.r === r && s.c === c && s.isAlive);
      const isWolfPresent = wolves.some(w => w.r === r && w.c === c && w.isAlive);

      if (existingSheepIdx >= 0) {
        // Remove sheep
        setSheep(prev => prev.filter((_, idx) => idx !== existingSheepIdx));
      } else if (!isWolfPresent) {
        // Add sheep if budget available and no wolf in cell
        if (placedSheepCount < currentLevel.budgets.sheep) {
          const newSheep: SheepEntity = {
            id: `sheep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            r,
            c,
            isAlive: true,
            starvedWeeks: 0,
            fedRecently: grid[r][c].isGrass,
            reproductionCooldown: 1, // Ready to multiply on grassland
          };
          setSheep(prev => [...prev, newSheep]);
        }
      }
    } else if (activeTool === 'wolf') {
      const existingWolfIdx = wolves.findIndex(w => w.r === r && w.c === c && w.isAlive);
      const isSheepPresent = sheep.some(s => s.r === r && s.c === c && s.isAlive);

      if (existingWolfIdx >= 0) {
        // Remove wolf
        setWolves(prev => prev.filter((_, idx) => idx !== existingWolfIdx));
      } else if (!isSheepPresent) {
        // Add wolf if budget available and no sheep in cell
        if (placedWolvesCount < currentLevel.budgets.wolves) {
          const newWolf: WolfEntity = {
            id: `wolf_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            r,
            c,
            isAlive: true,
            starvedWeeks: 0,
            targetSheepId: null,
          };
          setWolves(prev => [...prev, newWolf]);
        }
      }
    }
  };

  const handleClearBoard = () => {
    if (isSimulating) return;
    setGrid(createInitialGrid(currentLevel.gridRows, currentLevel.gridCols));
    setSheep([]);
    setWolves([]);
  };

  // Start simulation
  const handleStartSimulation = () => {
    const isGrassFull = placedGrassCount === currentLevel.budgets.grass;
    const isSheepFull = placedSheepCount === currentLevel.budgets.sheep;
    const isWolvesFull = placedWolvesCount === currentLevel.budgets.wolves;

    if (!isGrassFull || !isSheepFull || !isWolvesFull) {
      alert("You must use all available resources (grass patches, sheep, and wolves) before running the simulation.");
      return;
    }

    // Save initial snapshot to allow resetting placement later
    setInitialPlacementSnapshot({
      grid: grid.map(r => r.map(c => ({ ...c }))),
      sheep: sheep.map(s => ({ ...s })),
      wolves: wolves.map(w => ({ ...w })),
    });

    const initialSnapshot: SimulationSnapshot = {
      week: 0,
      grid: grid.map(r => r.map(c => ({ ...c }))),
      sheep: sheep.map(s => ({ ...s })),
      wolves: wolves.map(w => ({ ...w })),
      events: [],
      aliveSheepCount: sheep.filter(s => s.isAlive).length,
      aliveWolvesCount: wolves.filter(w => w.isAlive).length,
      activeGrassCount: grid.flat().filter(c => c.isGrass).length,
    };

    setHistory([initialSnapshot]);
    setStatus('running');
    setResultOutcome(null);
    setIsNewHighScore(false);
  };

  // Single step tick
  const advanceWeek = useCallback(() => {
    if (history.length === 0) return;

    const currentSnapshot = history[history.length - 1];
    if (currentSnapshot.week >= currentLevel.targetWeeks) {
      return;
    }

    const nextSnapshot = stepSimulation(currentSnapshot, currentLevel);
    const newHistory = [...history, nextSnapshot];
    setHistory(newHistory);
    setGrid(nextSnapshot.grid);
    setSheep(nextSnapshot.sheep);
    setWolves(nextSnapshot.wolves);

    const outcome = evaluateSimulationOutcome(nextSnapshot, currentLevel);
    if (outcome === 'victory' || outcome === 'defeat') {
      setStatus(outcome === 'victory' ? 'completed_victory' : 'completed_defeat');
      setResultOutcome(outcome);

      // If victory, record high score (surviving sheep count) and add to global leaderboard
      if (outcome === 'victory') {
        const { isNewHighScore: isNew, profile: updatedProfile } = recordLevelVictory(
          currentLevel.id,
          nextSnapshot.aliveSheepCount,
          nextSnapshot.week,
          initialPlacementSnapshot || undefined
        );
        setIsNewHighScore(isNew);
        setProfile(updatedProfile);
      }
    }
  }, [history, currentLevel, initialPlacementSnapshot]);

  // Simulation timer loop
  useEffect(() => {
    if (status !== 'running') return;

    const intervalMs = Math.round(800 / speed);
    const timer = setInterval(() => {
      advanceWeek();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [status, speed, advanceWeek]);

  // Controls
  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('running');
  const handleStep = () => advanceWeek();

  const handleResetPlacement = () => {
    if (initialPlacementSnapshot) {
      setGrid(initialPlacementSnapshot.grid.map(r => r.map(c => ({ ...c }))));
      setSheep(initialPlacementSnapshot.sheep.map(s => ({ ...s })));
      setWolves(initialPlacementSnapshot.wolves.map(w => ({ ...w })));
    }
    setStatus('placement');
    setHistory([]);
    setResultOutcome(null);
    setIsNewHighScore(false);
  };

  const handleNextLevel = () => {
    if (levelIndex < GAME_LEVELS.length - 1) {
      handleSelectLevel(levelIndex + 1);
    }
  };

  const currentWeek = history.length > 0 ? history[history.length - 1].week : 0;
  const currentSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const currentHighScore = profile?.levelScores[currentLevel.id]?.highestSheep;

  return (
    <div className="min-h-screen nature-backdrop flex flex-col text-slate-100 selection:bg-lime-500 selection:text-black">
      {/* Top Navigation */}
      <Header
        currentLevelIndex={levelIndex}
        onSelectLevel={handleSelectLevel}
        onResetLevel={() => resetLevel(levelIndex)}
        isSimulating={isSimulating}
        profile={profile}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onEditPlayerName={() => setIsNameModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6 flex flex-col justify-between gap-5">
        {/* Top Control Toolbar (Placement Phase) */}
        {!isSimulating ? (
          <div className="flex justify-start">
            <Toolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              placedGrass={placedGrassCount}
              maxGrass={currentLevel.budgets.grass}
              placedSheep={placedSheepCount}
              maxSheep={currentLevel.budgets.sheep}
              placedWolves={placedWolvesCount}
              maxWolves={currentLevel.budgets.wolves}
              onClearBoard={handleClearBoard}
              isSimulating={isSimulating}
            />
          </div>
        ) : (
          <div className="flex justify-between items-center bg-[#182327]/80 px-3.5 py-2 rounded-xl border border-[#2b3c43]">
            <span className="text-xs font-mono text-slate-400">
              Week {currentWeek} of {currentLevel.targetWeeks} ({currentLevel.gridRows}×{currentLevel.gridCols})
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-sky-300">🐑 {sheep.filter(s => s.isAlive).length} Alive</span>
              <span className="text-red-400">🐺 {wolves.filter(w => w.isAlive).length} Alive</span>
            </div>
          </div>
        )}

        {/* Center Grid & Mission Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
          {/* Left Column: Game Board */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <GameBoard
              grid={grid}
              sheep={sheep}
              wolves={wolves}
              level={currentLevel}
              activeTool={activeTool}
              onCellClick={handleCellClick}
              isSimulating={isSimulating}
            />
          </div>

          {/* Right Column: Mission Objectives, Legend & Population Graph */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <LevelObjective
              level={currentLevel}
              currentWeek={currentWeek}
              isSimulating={isSimulating}
              highScore={currentHighScore}
            />

            {/* Live Ecosystem Trend Line Graph */}
            {history.length > 1 && (
              <PopulationChart
                history={history}
                targetWeeks={currentLevel.targetWeeks}
              />
            )}
          </div>
        </div>

        {/* Bottom Playback & CTA Controls */}
        <div className="pt-1">
          <SimulationControls
            level={currentLevel}
            status={status}
            currentWeek={currentWeek}
            speed={speed}
            placedGrass={placedGrassCount}
            placedSheep={placedSheepCount}
            placedWolves={placedWolvesCount}
            onStart={handleStartSimulation}
            onPause={handlePause}
            onResume={handleResume}
            onStep={handleStep}
            onReset={handleResetPlacement}
            onChangeSpeed={setSpeed}
          />
        </div>
      </main>

      {/* Player Name Dialog */}
      <PlayerNameModal
        isOpen={isNameModalOpen}
        initialName={profile?.name || ''}
        onSaveName={handleSavePlayerName}
        isFirstTime={!profile?.name}
      />

      {/* Leaderboard / Records Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        profile={profile}
        onEditName={() => setIsNameModalOpen(true)}
        initialLevelId={currentLevel.id}
      />

      {/* Victory / Defeat Modal */}
      {resultOutcome && currentSnapshot && (
        <ResultModal
          outcome={resultOutcome}
          level={currentLevel}
          snapshot={currentSnapshot}
          onRetry={handleResetPlacement}
          onNextLevel={handleNextLevel}
          hasNextLevel={levelIndex < GAME_LEVELS.length - 1}
          isNewHighScore={isNewHighScore}
        />
      )}
    </div>
  );
}

export default App;
