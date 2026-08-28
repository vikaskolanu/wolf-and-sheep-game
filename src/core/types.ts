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
  grassGrowth: number; // 0 to 5 (or max)
  grassMaxGrowth: number;
  grassRegrowCountdown: number; // turns until grass grows back after being eaten
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
    wolfStarveThreshold: number;   // Weeks without food before wolf dies (default: 4-5)
    sheepStarveThreshold: number;  // Weeks without grass before sheep dies (default: 1-2)
    sheepReproInterval: number;    // Weeks on grass before reproducing (default: 4)
    grassRegrowthInterval: number; // Weeks for grass to replenish after being grazed (default: 3)
    minSurvivingSheep: number;     // Minimum alive sheep required at targetWeeks to win (default: 1)
    minSurvivingWolves: number;    // Minimum alive wolves required at targetWeeks to win (default: 1)
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

export type SimulationStatus = 'placement' | 'running' | 'paused' | 'completed_victory' | 'completed_defeat';
