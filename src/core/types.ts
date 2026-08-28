export type EntityType = 'grass' | 'sheep' | 'wolf';

export type ToolType = 'grass' | 'sheep' | 'wolf' | null;

export interface Position {
  r: number;
  c: number;
}

export interface CellState {
  r: number;
  c: number;
  isGrass: boolean;
  grassGrowth: number;
  grassMaxGrowth: number;
  grassRegrowCountdown: number;
}

export interface SheepEntity {
  id: string;
  r: number;
  c: number;
  isAlive: boolean;
  starvedWeeks: number;
  fedRecently: boolean;
  reproductionCooldown: number;
  deathReason?: 'eaten' | 'starved' | null;
  deathWeek?: number;
}

export interface WolfEntity {
  id: string;
  r: number;
  c: number;
  isAlive: boolean;
  starvedWeeks: number;
  targetSheepId: string | null;
  deathReason?: 'starved' | null;
  deathWeek?: number;
}

export interface SimulationEvent {
  week: number;
  type: 'eat' | 'sheep_starved' | 'wolf_starved' | 'reproduce' | 'wolf_move';
  r: number;
  c: number;
  sourceId?: string;
  targetId?: string;
  message: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  gridRows: number;
  gridCols: number;
  targetWeeks: number;
  budgets: {
    grass: number;
    sheep: number;
    wolves: number;
  };
  rules: {
    wolfStarveThreshold: number;
    sheepStarveThreshold: number;
    sheepReproInterval: number;
    grassRegrowthInterval: number;
    minSurvivingSheep: number;
    minSurvivingWolves: number;
  };
  preplaced?: {
    grass?: Position[];
    sheep?: Position[];
    wolves?: Position[];
  };
}

export interface SimulationSnapshot {
  week: number;
  grid: CellState[][];
  sheep: SheepEntity[];
  wolves: WolfEntity[];
  events: SimulationEvent[];
  aliveSheepCount: number;
  aliveWolvesCount: number;
  activeGrassCount: number;
}

export interface LevelScore {
  levelId: number;
  highestSheep: number;
  completedAt: string;
}

export interface PlayerProfile {
  name: string;
  levelScores: Record<number, LevelScore>;
  completedLevels: number[];
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  levelId: number;
  sheepAlive: number;
  weeksSurvived: number;
  completedAt: string;
  placementMatrix?: number[][]; // 0: Empty, 1: Grass, 2: Sheep, 3: Wolf, 4: Sheep on Grass
}

export type SimulationStatus = 'placement' | 'running' | 'paused' | 'completed_victory' | 'completed_defeat';
