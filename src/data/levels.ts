import { LevelConfig } from '../core/types';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Level 1 — Introduction to Grazing",
    subtitle: "Learn the fundamentals of pasture safety and starvation",
    description: "You are managing a nature reserve. Distribute grass patches, sheep, and a wolf across the 5×5 grid, then run the simulation.",
    objective: "Sustain the ecosystem for 10 weeks with 1 wolf and at least 2 sheep surviving.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 10,
    budgets: {
      grass: 10,
      sheep: 4,
      wolves: 1,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  },
  {
    id: 2,
    title: "Level 2 — Hunting Trajectories",
    subtitle: "Understand how wolves prioritize the nearest untargeted prey",
    description: "Multiple wolves hunt independently. Keep your flock distributed across grass patches to survive.",
    objective: "Maintain ecosystem stability for 15 weeks with 2 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 15,
    budgets: {
      grass: 12,
      sheep: 5,
      wolves: 2,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  },
  {
    id: 3,
    title: "Level 3 — Reproduction Cycles",
    subtitle: "Time sheep breeding on grasslands to replenish losses",
    description: "Wolves are voracious. Provide enough grasslands so sheep can multiply before being hunted.",
    objective: "Keep both species thriving over 20 weeks with 3 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 20,
    budgets: {
      grass: 14,
      sheep: 6,
      wolves: 3,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  },
  {
    id: 4,
    title: "Level 4 — Spatial Segregation",
    subtitle: "Use distance and corners to delay predator advances",
    description: "Distribute your pastures wisely across the reserve to prevent wolves from clearing out sheep too quickly.",
    objective: "Survive 25 weeks with 4 hunting wolves on the reserve.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 25,
    budgets: {
      grass: 15,
      sheep: 7,
      wolves: 4,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  },
  {
    id: 5,
    title: "Level 5 — Ecosystem Placement",
    subtitle: "High density predator challenge",
    description: "You are managing a nature reserve. Distribute grass patches, sheep, and wolves across the 5×5 grid, then run the simulation. Once submitted, the placement is locked for this attempt.",
    objective: "Solve the compact 5×5 grid over 30 weeks with 5 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 30,
    budgets: {
      grass: 16,
      sheep: 8,
      wolves: 5,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  },
  {
    id: 6,
    title: "Level 6 — Ecosystem Placement",
    subtitle: "The Final Equilibrium Challenge",
    description: "You are managing a nature reserve. Distribute grass patches, sheep, and wolves across the 5×5 grid, then run the simulation. Once submitted, the placement is locked for this attempt.",
    objective: "The final challenge on a compact 5×5 grid over 30 weeks with 6 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 30,
    budgets: {
      grass: 16,
      sheep: 6,
      wolves: 6,
    },
    rules: {
      wolfStarveThreshold: 4,
      sheepStarveThreshold: 1,
      sheepReproInterval: 2,
      grassRegrowthInterval: 3,
      minSurvivingSheep: 1,
      minSurvivingWolves: 1,
    }
  }
];
