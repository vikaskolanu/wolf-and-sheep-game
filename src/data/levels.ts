import { LevelConfig } from '../core/types';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Level 1 — Solitary Pasture (4×4)",
    subtitle: "Learn the fundamentals of distance and reproduction",
    description: "Welcome to the reserve. Place grass, sheep, and a single wolf on a compact 4×4 terrain. Ensure your sheep can breed on grass before the wolf reaches them.",
    objective: "Sustain the ecosystem for 8 weeks with 1 wolf and surviving sheep.",
    gridRows: 4,
    gridCols: 4,
    targetWeeks: 8,
    budgets: {
      grass: 6,
      sheep: 3,
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
    title: "Level 2 — Pasture Outpost (4×4)",
    subtitle: "Coordinate prey distribution against two active hunters",
    description: "Two wolves hunt on the compact 4×4 field. Position pastures and sheep carefully to keep prey reproducing while feeding the wolves enough to avoid predator extinction.",
    objective: "Maintain ecosystem stability for 10 weeks with 2 wolves.",
    gridRows: 4,
    gridCols: 4,
    targetWeeks: 10,
    budgets: {
      grass: 8,
      sheep: 4,
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
    title: "Level 3 — Two Hunters (5×5)",
    subtitle: "Step up to a 5×5 reserve against two coordinated predators",
    description: "The territory expands to a 5×5 grid. Two wolves roam the reserve. Spread your pastures across opposite quadrants to build resilient breeding zones.",
    objective: "Keep both species thriving over 12 weeks with 2 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 12,
    budgets: {
      grass: 10,
      sheep: 4,
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
    id: 4,
    title: "Level 4 — Multi-Flock Breeding (5×5)",
    subtitle: "Manage split herds across open territory with 3 wolves",
    description: "Three wolves demand high prey production. Create interconnected grazing corridors so lambs can escape incoming predators.",
    objective: "Survive 15 weeks with 3 hunting wolves across the reserve.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 15,
    budgets: {
      grass: 12,
      sheep: 5,
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
    id: 5,
    title: "Level 5 — Predator Balance (5×5)",
    subtitle: "High density coordination with 4 active wolves",
    description: "Manage 4 hunting wolves on the 5×5 terrain. Balance perimeter breeding zones so neither species faces extinction over 20 weeks.",
    objective: "Solve the compact 5×5 grid over 20 weeks with 4 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 20,
    budgets: {
      grass: 14,
      sheep: 6,
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
    id: 6,
    title: "Level 6 — Master Apex (5×5)",
    subtitle: "High density survival challenge with 5 hunting wolves",
    description: "Distribute 16 grass patches, 8 sheep, and 5 wolves. Maintain flock reproduction and predator sustenance over a rigorous 30-week simulation.",
    objective: "Sustain the ecosystem for 30 weeks with 5 wolves and 8 sheep.",
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
    id: 7,
    title: "Level 7 — Apex Equilibrium (5×5)",
    subtitle: "The Ultimate Grand Finale with 6 hunting wolves",
    description: "The ultimate reserve management puzzle. Coordinate 16 grass patches, 8 sheep, and 6 prowling wolves across 30 full weeks.",
    objective: "The final master challenge on a 5×5 grid over 30 weeks with 6 wolves.",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 30,
    budgets: {
      grass: 16,
      sheep: 8,
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
