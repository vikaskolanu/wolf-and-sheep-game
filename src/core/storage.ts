import { PlayerProfile, LeaderboardEntry, CellState, SheepEntity, WolfEntity } from './types';

const PROFILE_STORAGE_KEY = 'ecosystem_player_profile';
const LEADERBOARD_STORAGE_KEY = 'ecosystem_global_leaderboard';

export function getStoredPlayerProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save player profile:', e);
  }
}

export function getGlobalLeaderboard(): Record<number, LeaderboardEntry[]> {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Return strictly real user submissions
    const cleanBoard: Record<number, LeaderboardEntry[]> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (Array.isArray(val)) {
        // Filter out any mock entries starting with 'd' prefix
        cleanBoard[Number(key)] = val.filter((e: LeaderboardEntry) => !e.id?.startsWith('d'));
      }
    }
    return cleanBoard;
  } catch {
    return {};
  }
}

export function saveGlobalLeaderboard(board: Record<number, LeaderboardEntry[]>): void {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(board));
  } catch (e) {
    console.error('Failed to save global leaderboard:', e);
  }
}

/**
 * Encodes the placement grid into a numerical matrix for ML / Deep Learning:
 * 0: Empty Land
 * 1: Grass Patch (empty)
 * 2: Sheep on Land
 * 3: Wolf
 * 4: Sheep on Grass Patch
 */
export function encodePlacementMatrix(
  grid: CellState[][],
  sheep: SheepEntity[],
  wolves: WolfEntity[]
): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isGrass = grid[r][c].isGrass;
      const hasSheep = sheep.some(s => s.isAlive && s.r === r && s.c === c);
      const hasWolf = wolves.some(w => w.isAlive && w.r === r && w.c === c);

      if (hasWolf) {
        matrix[r][c] = 3;
      } else if (hasSheep && isGrass) {
        matrix[r][c] = 4;
      } else if (hasSheep) {
        matrix[r][c] = 2;
      } else if (isGrass) {
        matrix[r][c] = 1;
      } else {
        matrix[r][c] = 0;
      }
    }
  }

  return matrix;
}

export function recordLevelVictory(
  levelId: number,
  sheepAlive: number,
  weeksSurvived: number,
  placementGrid?: { grid: CellState[][]; sheep: SheepEntity[]; wolves: WolfEntity[] }
): { isNewHighScore: boolean; previousHigh: number; profile: PlayerProfile } {
  let profile = getStoredPlayerProfile();
  if (!profile) {
    profile = {
      name: 'Player',
      levelScores: {},
      completedLevels: [],
    };
  }

  const prevScore = profile.levelScores[levelId]?.highestSheep ?? 0;
  const isNewHighScore = sheepAlive > prevScore || !profile.completedLevels.includes(levelId);

  if (!profile.completedLevels.includes(levelId)) {
    profile.completedLevels.push(levelId);
  }

  if (isNewHighScore) {
    profile.levelScores[levelId] = {
      levelId,
      highestSheep: sheepAlive,
      completedAt: new Date().toISOString(),
    };
  }

  savePlayerProfile(profile);

  // Record only real user submissions
  const globalBoard = getGlobalLeaderboard();
  const levelEntries = globalBoard[levelId] ? [...globalBoard[levelId]] : [];

  let placementMatrix: number[][] | undefined;
  if (placementGrid) {
    placementMatrix = encodePlacementMatrix(
      placementGrid.grid,
      placementGrid.sheep,
      placementGrid.wolves
    );
  }

  const newEntry: LeaderboardEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    playerName: profile.name || 'Player',
    levelId,
    sheepAlive,
    weeksSurvived,
    completedAt: new Date().toISOString(),
    placementMatrix,
  };

  levelEntries.push(newEntry);
  levelEntries.sort((a, b) => b.sheepAlive - a.sheepAlive);

  globalBoard[levelId] = levelEntries;
  saveGlobalLeaderboard(globalBoard);

  return {
    isNewHighScore,
    previousHigh: prevScore,
    profile,
  };
}
