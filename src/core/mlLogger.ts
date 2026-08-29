import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MLSubmissionRecord } from './mlTypes';
import { CellState, SheepEntity, WolfEntity, LevelConfig } from './types';

/**
 * Computes the continuous fitness score S ∈ [0, 100] for any simulation run.
 * Works for both victories and defeats:
 *   - 50 pts: How long the ecosystem survived
 *   - 30 pts: How many sheep were alive at the end (relative to budget)
 *   - 10 pts: How many wolves survived (relative to budget)
 *   - 10 pts: Victory completion bonus
 */
export function computeScore(
  outcome: 'victory' | 'defeat',
  weeksSurvived: number,
  finalAliveSheep: number,
  finalAliveWolves: number,
  level: LevelConfig
): number {
  const survivalScore = 50 * (weeksSurvived / level.targetWeeks);
  const sheepScore = 30 * Math.min(1, finalAliveSheep / level.budgets.sheep);
  const wolfScore = 10 * Math.min(1, finalAliveWolves / level.budgets.wolves);
  const victoryBonus = outcome === 'victory' ? 10 : 0;

  const total = survivalScore + sheepScore + wolfScore + victoryBonus;
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

/**
 * Encodes placement into:
 *   1. Categorical matrix (0-4)
 *   2. Three separate binary channels (one-hot per entity type)
 */
function encodePlacement(
  grid: CellState[][],
  sheep: SheepEntity[],
  wolves: WolfEntity[]
): {
  placementMatrix: number[][];
  oneHotGrass: number[][];
  oneHotSheep: number[][];
  oneHotWolf: number[][];
} {
  const rows = grid.length;
  const cols = grid[0].length;

  const placementMatrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const oneHotGrass: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const oneHotSheep: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const oneHotWolf: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  const aliveSheep = sheep.filter(s => s.isAlive);
  const aliveWolves = wolves.filter(w => w.isAlive);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isGrass = grid[r][c].isGrass;
      const hasSheep = aliveSheep.some(s => s.r === r && s.c === c);
      const hasWolf = aliveWolves.some(w => w.r === r && w.c === c);

      if (isGrass) oneHotGrass[r][c] = 1;
      if (hasSheep) oneHotSheep[r][c] = 1;
      if (hasWolf) oneHotWolf[r][c] = 1;

      if (hasWolf) placementMatrix[r][c] = 3;
      else if (hasSheep && isGrass) placementMatrix[r][c] = 4;
      else if (hasSheep) placementMatrix[r][c] = 2;
      else if (isGrass) placementMatrix[r][c] = 1;
      else placementMatrix[r][c] = 0;
    }
  }

  return { placementMatrix, oneHotGrass, oneHotSheep, oneHotWolf };
}

/**
 * Records every simulation run (win or lose) silently in the background.
 * Called automatically when any run ends.
 */
export async function recordMLSubmission(
  playerName: string,
  level: LevelConfig,
  outcome: 'victory' | 'defeat',
  weeksSurvived: number,
  finalAliveSheep: number,
  finalAliveWolves: number,
  initialGrid: CellState[][],
  initialSheep: SheepEntity[],
  initialWolves: WolfEntity[]
): Promise<void> {
  try {
    const { placementMatrix, oneHotGrass, oneHotSheep, oneHotWolf } = encodePlacement(
      initialGrid,
      initialSheep,
      initialWolves
    );

    const score = computeScore(outcome, weeksSurvived, finalAliveSheep, finalAliveWolves, level);

    const record: MLSubmissionRecord = {
      submissionId: `${playerName.trim().toLowerCase()}_lvl${level.id}_${Date.now()}`,
      playerName: playerName || 'anonymous',
      levelId: level.id,
      gridRows: level.gridRows,
      gridCols: level.gridCols,
      targetWeeks: level.targetWeeks,
      placementMatrix,
      oneHotGrass,
      oneHotSheep,
      oneHotWolf,
      outcome,
      weeksSurvived,
      finalAliveSheep,
      finalAliveWolves,
      score,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, 'submissions'), record);
  } catch (e) {
    // Silent failure — never block the UI if Firestore is unreachable
    console.warn('[ML Dataset] Could not save submission to Firestore:', e);
  }
}
