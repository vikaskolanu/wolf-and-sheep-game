import { PlayerProfile, LeaderboardEntry, CellState, SheepEntity, WolfEntity } from './types';

const PROFILE_STORAGE_KEY = 'ecosystem_player_profile';
const LEADERBOARD_STORAGE_KEY = 'ecosystem_global_leaderboard';

// Default community / benchmark players on each level
const DEFAULT_LEADERBOARD: Record<number, LeaderboardEntry[]> = {
  1: [
    { id: 'd1_1', playerName: 'ShadowStalker', levelId: 1, sheepAlive: 6, weeksSurvived: 10, completedAt: '2026-08-20T10:00:00Z' },
    { id: 'd1_2', playerName: 'ForestEcho', levelId: 1, sheepAlive: 5, weeksSurvived: 10, completedAt: '2026-08-22T14:30:00Z' },
    { id: 'd1_3', playerName: 'GreenPasture', levelId: 1, sheepAlive: 4, weeksSurvived: 10, completedAt: '2026-08-25T08:15:00Z' },
  ],
  2: [
    { id: 'd2_1', playerName: 'AlphaPredator', levelId: 2, sheepAlive: 7, weeksSurvived: 15, completedAt: '2026-08-21T11:00:00Z' },
    { id: 'd2_2', playerName: 'MeadowGuard', levelId: 2, sheepAlive: 5, weeksSurvived: 15, completedAt: '2026-08-23T16:45:00Z' },
  ],
  3: [
    { id: 'd3_1', playerName: 'BioBalance', levelId: 3, sheepAlive: 9, weeksSurvived: 20, completedAt: '2026-08-22T09:20:00Z' },
    { id: 'd3_2', playerName: 'LunaWolf', levelId: 3, sheepAlive: 7, weeksSurvived: 20, completedAt: '2026-08-24T18:00:00Z' },
  ],
  4: [
    { id: 'd4_1', playerName: 'SavannaKing', levelId: 4, sheepAlive: 10, weeksSurvived: 25, completedAt: '2026-08-23T12:00:00Z' },
    { id: 'd4_2', playerName: 'ApexRunner', levelId: 4, sheepAlive: 8, weeksSurvived: 25, completedAt: '2026-08-26T15:30:00Z' },
  ],
  5: [
    { id: 'd5_1', playerName: 'EquilibriumMaster', levelId: 5, sheepAlive: 11, weeksSurvived: 30, completedAt: '2026-08-24T13:40:00Z' },
    { id: 'd5_2', playerName: 'OmegaPack', levelId: 5, sheepAlive: 9, weeksSurvived: 30, completedAt: '2026-08-27T09:10:00Z' },
  ],
  6: [
    { id: 'd6_1', playerName: 'WildernessSage', levelId: 6, sheepAlive: 8, weeksSurvived: 30, completedAt: '2026-08-25T17:50:00Z' },
    { id: 'd6_2', playerName: 'SilverFang', levelId: 6, sheepAlive: 6, weeksSurvived: 30, completedAt: '2026-08-27T20:00:00Z' },
  ],
  7: [
    { id: 'd7_1', playerName: 'CorridorStrategist', levelId: 7, sheepAlive: 13, weeksSurvived: 25, completedAt: '2026-08-26T14:10:00Z' },
  ],
  8: [
    { id: 'd8_1', playerName: 'RidgeSurvivor', levelId: 8, sheepAlive: 14, weeksSurvived: 30, completedAt: '2026-08-27T11:25:00Z' },
  ],
  9: [
    { id: 'd9_1', playerName: 'SafariArchitect', levelId: 9, sheepAlive: 16, weeksSurvived: 30, completedAt: '2026-08-28T08:00:00Z' },
  ],
  10: [
    { id: 'd10_1', playerName: 'ApexOverlord', levelId: 10, sheepAlive: 18, weeksSurvived: 35, completedAt: '2026-08-28T16:00:00Z' },
  ],
};

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
    if (!raw) return DEFAULT_LEADERBOARD;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_LEADERBOARD, ...parsed };
  } catch {
    return DEFAULT_LEADERBOARD;
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

  // Add to Global Leaderboard for this level
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
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    playerName: profile.name || 'Player',
    levelId,
    sheepAlive,
    weeksSurvived,
    completedAt: new Date().toISOString(),
    placementMatrix,
  };

  levelEntries.push(newEntry);
  // Sort by highest sheep alive descending, then earliest completed
  levelEntries.sort((a, b) => b.sheepAlive - a.sheepAlive);

  globalBoard[levelId] = levelEntries;
  saveGlobalLeaderboard(globalBoard);

  return {
    isNewHighScore,
    previousHigh: prevScore,
    profile,
  };
}
