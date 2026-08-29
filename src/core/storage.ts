import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PlayerProfile, LeaderboardEntry, CellState, SheepEntity, WolfEntity } from './types';

// Increment this version to wipe stale local storage data across all browsers on next load
const STORAGE_VERSION = 'v2';
const PROFILE_STORAGE_KEY = `ecosystem_player_profile_${STORAGE_VERSION}`;
const LEADERBOARD_STORAGE_KEY = `ecosystem_global_leaderboard_${STORAGE_VERSION}`;

// On load, clear any stale data from previous storage versions
(function clearStaleStorage() {
  const staleKeys = [
    'ecosystem_player_profile',
    'ecosystem_global_leaderboard',
    'ecosystem_player_profile_v1',
    'ecosystem_global_leaderboard_v1',
  ];
  staleKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
})();

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

/**
 * Deduplicates leaderboard entries by player name, keeping strictly the single highest score for each unique player.
 */
export function deduplicateLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const playerBestMap = new Map<string, LeaderboardEntry>();

  for (const entry of entries) {
    if (!entry || !entry.playerName) continue;
    const normalizedName = entry.playerName.trim().toLowerCase();
    const existing = playerBestMap.get(normalizedName);

    if (!existing || entry.sheepAlive > existing.sheepAlive) {
      playerBestMap.set(normalizedName, entry);
    }
  }

  return Array.from(playerBestMap.values()).sort((a, b) => b.sheepAlive - a.sheepAlive);
}

export function getLocalLeaderboard(): Record<number, LeaderboardEntry[]> {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const cleanBoard: Record<number, LeaderboardEntry[]> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (Array.isArray(val)) {
        const nonMock = val.filter((e: LeaderboardEntry) => !e.id?.startsWith('d'));
        cleanBoard[Number(key)] = deduplicateLeaderboard(nonMock);
      }
    }
    return cleanBoard;
  } catch {
    return {};
  }
}

export function saveLocalLeaderboard(board: Record<number, LeaderboardEntry[]>): void {
  try {
    const deduplicatedBoard: Record<number, LeaderboardEntry[]> = {};
    for (const [key, val] of Object.entries(board)) {
      if (Array.isArray(val)) {
        deduplicatedBoard[Number(key)] = deduplicateLeaderboard(val);
      }
    }
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(deduplicatedBoard));
  } catch (e) {
    console.error('Failed to save local leaderboard:', e);
  }
}

/**
 * Fetches cross-device global leaderboard from Firestore and merges with local entries
 */
export async function fetchGlobalLevelLeaderboard(levelId: number): Promise<LeaderboardEntry[]> {
  try {
    const docRef = doc(db, 'leaderboards', `lvl_${levelId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const cloudEntries = (data?.entries || []) as LeaderboardEntry[];
      if (Array.isArray(cloudEntries)) {
        const localBoard = getLocalLeaderboard();
        const localEntries = localBoard[levelId] || [];

        // Merge and deduplicate by player name (keeping highest score per player)
        const combined = deduplicateLeaderboard([...localEntries, ...cloudEntries]);

        localBoard[levelId] = combined;
        saveLocalLeaderboard(localBoard);
        return combined;
      }
    }
  } catch (e) {
    // Fallback to local on network disconnect
  }

  const local = getLocalLeaderboard();
  return deduplicateLeaderboard(local[levelId] || []);
}

/**
 * Pushes a new victory entry to the Firestore global leaderboard
 */
export async function syncEntryToCloud(entry: LeaderboardEntry): Promise<void> {
  try {
    const currentList = await fetchGlobalLevelLeaderboard(entry.levelId);
    const combined = deduplicateLeaderboard([entry, ...currentList]);

    // Keep top 50 global entries per level and strip any nested matrix to avoid Firestore array errors
    const topEntries = combined.slice(0, 50).map(e => ({
      id: e.id,
      playerName: e.playerName,
      levelId: e.levelId,
      sheepAlive: e.sheepAlive,
      weeksSurvived: e.weeksSurvived,
      completedAt: e.completedAt,
    }));

    const docRef = doc(db, 'leaderboards', `lvl_${entry.levelId}`);
    await setDoc(docRef, { entries: topEntries, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Could not sync to cloud leaderboard immediately, saved locally:', e);
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
): { isNewHighScore: boolean; previousHigh: number; profile: PlayerProfile; entry: LeaderboardEntry } {
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

  // Local record with unique user deduplication
  const localBoard = getLocalLeaderboard();
  const levelEntries = localBoard[levelId] ? [...localBoard[levelId]] : [];

  let placementMatrix: number[][] | undefined;
  if (placementGrid) {
    placementMatrix = encodePlacementMatrix(
      placementGrid.grid,
      placementGrid.sheep,
      placementGrid.wolves
    );
  }

  const newEntry: LeaderboardEntry = {
    id: `entry_${profile.name.trim().toLowerCase()}_lvl_${levelId}`,
    playerName: profile.name || 'Player',
    levelId,
    sheepAlive,
    weeksSurvived,
    completedAt: new Date().toISOString(),
    placementMatrix,
  };

  const deduplicatedList = deduplicateLeaderboard([newEntry, ...levelEntries]);
  localBoard[levelId] = deduplicatedList;
  saveLocalLeaderboard(localBoard);

  // Trigger background cloud sync across all devices worldwide
  syncEntryToCloud(newEntry);

  return {
    isNewHighScore,
    previousHigh: prevScore,
    profile,
    entry: newEntry,
  };
}
