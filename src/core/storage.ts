import { PlayerProfile } from './types';

const STORAGE_KEY = 'ecosystem_player_profile';

export function getStoredPlayerProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save player profile:', e);
  }
}

export function recordLevelVictory(
  levelId: number,
  sheepAlive: number
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

  return {
    isNewHighScore,
    previousHigh: prevScore,
    profile,
  };
}
