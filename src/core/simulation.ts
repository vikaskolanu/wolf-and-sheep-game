import { CellState, LevelConfig, SheepEntity, SimulationEvent, SimulationSnapshot, WolfEntity } from './types';

export function createInitialGrid(rows: number, cols: number, preplacedGrass?: { r: number; c: number }[]): CellState[][] {
  const grid: CellState[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < cols; c++) {
      const isPreplaced = preplacedGrass?.some(p => p.r === r && p.c === c) ?? false;
      row.push({
        r,
        c,
        isGrass: isPreplaced,
        grassGrowth: isPreplaced ? 5 : 0,
        grassMaxGrowth: 5,
        grassRegrowCountdown: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function manhattanDist(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/**
 * Assigns each alive wolf to the closest untargeted alive sheep.
 * If multiple wolves want the same sheep, closest wolf gets it, and other wolves target the next closest available sheep.
 */
export function assignWolfTargets(wolves: WolfEntity[], sheep: SheepEntity[]): Map<string, string | null> {
  const aliveWolves = wolves.filter(w => w.isAlive);
  const aliveSheep = sheep.filter(s => s.isAlive);
  const targetMap = new Map<string, string | null>();

  if (aliveSheep.length === 0) {
    aliveWolves.forEach(w => targetMap.set(w.id, null));
    return targetMap;
  }

  // Calculate all wolf-sheep pair distances
  interface Pair {
    wolfId: string;
    sheepId: string;
    dist: number;
  }

  const pairs: Pair[] = [];
  for (const w of aliveWolves) {
    for (const s of aliveSheep) {
      pairs.push({
        wolfId: w.id,
        sheepId: s.id,
        dist: manhattanDist(w.r, w.c, s.r, s.c),
      });
    }
  }

  // Sort pairs by distance ascending
  pairs.sort((a, b) => a.dist - b.dist);

  const targetedSheepIds = new Set<string>();
  const assignedWolves = new Set<string>();

  for (const p of pairs) {
    if (!assignedWolves.has(p.wolfId) && !targetedSheepIds.has(p.sheepId)) {
      targetMap.set(p.wolfId, p.sheepId);
      assignedWolves.add(p.wolfId);
      targetedSheepIds.add(p.sheepId);
    }
  }

  // Any remaining wolves that couldn't get a unique sheep target the nearest sheep anyway (or null)
  for (const w of aliveWolves) {
    if (!assignedWolves.has(w.id)) {
      // Find closest sheep even if shared
      let closestSheep: SheepEntity | null = null;
      let minDist = Infinity;
      for (const s of aliveSheep) {
        const d = manhattanDist(w.r, w.c, s.r, s.c);
        if (d < minDist) {
          minDist = d;
          closestSheep = s;
        }
      }
      targetMap.set(w.id, closestSheep ? closestSheep.id : null);
    }
  }

  return targetMap;
}

/**
 * Executes a single week simulation tick.
 */
export function stepSimulation(
  currentSnapshot: SimulationSnapshot,
  level: LevelConfig
): SimulationSnapshot {
  const nextWeek = currentSnapshot.week + 1;
  const events: SimulationEvent[] = [];

  // Deep clone state for next tick
  const nextGrid: CellState[][] = currentSnapshot.grid.map(row =>
    row.map(cell => ({ ...cell }))
  );
  
  // Clone entities
  const nextSheep: SheepEntity[] = currentSnapshot.sheep.map(s => ({ ...s }));
  const nextWolves: WolfEntity[] = currentSnapshot.wolves.map(w => ({ ...w }));

  // 1. Regrow grass countdowns
  for (let r = 0; r < level.gridRows; r++) {
    for (let c = 0; c < level.gridCols; c++) {
      const cell = nextGrid[r][c];
      if (cell.isGrass) {
        if (cell.grassRegrowCountdown > 0) {
          cell.grassRegrowCountdown--;
          if (cell.grassRegrowCountdown === 0) {
            cell.grassGrowth = cell.grassMaxGrowth;
          }
        }
      }
    }
  }

  // Set of wolves that got fed on the spot by a sheep reproducing directly into their cell
  const wolvesFedOnTheSpot = new Set<string>();

  // 2. Sheep Grazing & Reproduction Phase
  const newlySpawnedSheep: SheepEntity[] = [];

  for (const sheep of nextSheep) {
    if (!sheep.isAlive) continue;

    const cell = nextGrid[sheep.r][sheep.c];

    if (cell.isGrass) {
      // Sheep is in grassland with food
      sheep.starvedWeeks = 0;
      sheep.fedRecently = true;
      sheep.reproductionCooldown--;

      // All sheep in grasslands reproduce when cooldown reaches 0
      if (sheep.reproductionCooldown <= 0) {
        // Collect all 4 adjacent cells within grid bounds
        const adjacentCells: { r: number; c: number }[] = [];
        const directions = [
          { r: sheep.r - 1, c: sheep.c },
          { r: sheep.r + 1, c: sheep.c },
          { r: sheep.r, c: sheep.c - 1 },
          { r: sheep.r, c: sheep.c + 1 },
        ];

        for (const dir of directions) {
          if (dir.r >= 0 && dir.r < level.gridRows && dir.c >= 0 && dir.c < level.gridCols) {
            adjacentCells.push(dir);
          }
        }

        // Categorize adjacent cells (must not already have a sheep)
        const emptyAdjacentGrass: { r: number; c: number }[] = [];
        const emptyAdjacentLand: { r: number; c: number }[] = [];
        const adjacentWolfCells: { r: number; c: number; wolf: WolfEntity }[] = [];

        for (const dir of adjacentCells) {
          const isSheepPresent =
            nextSheep.some(s => s.isAlive && s.r === dir.r && s.c === dir.c) ||
            newlySpawnedSheep.some(s => s.isAlive && s.r === dir.r && s.c === dir.c);

          if (!isSheepPresent) {
            const wolfPresent = nextWolves.find(w => w.isAlive && w.r === dir.r && w.c === dir.c);
            if (wolfPresent) {
              adjacentWolfCells.push({ r: dir.r, c: dir.c, wolf: wolfPresent });
            } else if (nextGrid[dir.r][dir.c].isGrass) {
              emptyAdjacentGrass.push(dir);
            } else {
              emptyAdjacentLand.push(dir);
            }
          }
        }

        // Prefer empty grass > empty land > adjacent wolf cell
        let birthPos: { r: number; c: number } | null = null;
        let targetWolf: WolfEntity | null = null;

        if (emptyAdjacentGrass.length > 0) {
          birthPos = emptyAdjacentGrass[Math.floor(Math.random() * emptyAdjacentGrass.length)];
        } else if (emptyAdjacentLand.length > 0) {
          birthPos = emptyAdjacentLand[Math.floor(Math.random() * emptyAdjacentLand.length)];
        } else if (adjacentWolfCells.length > 0) {
          const picked = adjacentWolfCells[Math.floor(Math.random() * adjacentWolfCells.length)];
          birthPos = { r: picked.r, c: picked.c };
          targetWolf = picked.wolf;
        }

        if (birthPos) {
          const isBirthOnGrass = nextGrid[birthPos.r][birthPos.c].isGrass;
          const newSheepId = `sheep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

          if (targetWolf) {
            // Sheep reproduced into a cell occupied by a wolf:
            // The wolf eats the sheep on the spot, resets hunger, and does not move this week
            newlySpawnedSheep.push({
              id: newSheepId,
              r: birthPos.r,
              c: birthPos.c,
              isAlive: false,
              deathReason: 'eaten',
              deathWeek: nextWeek,
              starvedWeeks: 0,
              fedRecently: isBirthOnGrass,
              reproductionCooldown: level.rules.sheepReproInterval,
            });

            targetWolf.starvedWeeks = 0;
            wolvesFedOnTheSpot.add(targetWolf.id);

            events.push({
              week: nextWeek,
              type: 'eat',
              r: birthPos.r,
              c: birthPos.c,
              sourceId: targetWolf.id,
              targetId: newSheepId,
              message: `Sheep multiplied into wolf's cell at (${birthPos.r + 1}, ${birthPos.c + 1}) — wolf ate it on the spot and remained in place`
            });
          } else {
            // Normal birth into empty cell
            newlySpawnedSheep.push({
              id: newSheepId,
              r: birthPos.r,
              c: birthPos.c,
              isAlive: true,
              starvedWeeks: 0,
              fedRecently: isBirthOnGrass,
              reproductionCooldown: level.rules.sheepReproInterval,
            });

            events.push({
              week: nextWeek,
              type: 'reproduce',
              r: birthPos.r,
              c: birthPos.c,
              sourceId: sheep.id,
              targetId: newSheepId,
              message: `Sheep multiplied to empty (${birthPos.r + 1}, ${birthPos.c + 1})${isBirthOnGrass ? ' (Grassland)' : ' (Land - 1wk lifespan)'}`
            });
          }

          // Reset parent cooldown
          sheep.reproductionCooldown = level.rules.sheepReproInterval;
        } else {
          // No adjacent space to reproduce this week - retry next week
          sheep.reproductionCooldown = 0;
        }
      }
    } else {
      // Sheep is on barren land (outside grassland): survives only 1 week
      sheep.fedRecently = false;
      sheep.starvedWeeks++;

      // Dies if outside grassland after 1 week
      if (sheep.starvedWeeks >= level.rules.sheepStarveThreshold) {
        sheep.isAlive = false;
        sheep.deathReason = 'starved';
        sheep.deathWeek = nextWeek;
        events.push({
          week: nextWeek,
          type: 'sheep_starved',
          r: sheep.r,
          c: sheep.c,
          sourceId: sheep.id,
          message: `Sheep starved on land at (${sheep.r + 1}, ${sheep.c + 1}) after 1 week`
        });
      }
    }
  }

  // Append new born sheep
  nextSheep.push(...newlySpawnedSheep);

  // 3. Assign Wolf Targets & Move Wolves
  const targetAssignments = assignWolfTargets(nextWolves, nextSheep);
  const claimedWolfPositions = new Set<string>();

  for (const wolf of nextWolves) {
    if (!wolf.isAlive) continue;

    // If wolf was fed on the spot this week by a reproducing sheep, it stays in its cell and doesn't move
    if (wolvesFedOnTheSpot.has(wolf.id)) {
      claimedWolfPositions.add(`${wolf.r},${wolf.c}`);
      continue;
    }

    const targetSheepId = targetAssignments.get(wolf.id) || null;
    wolf.targetSheepId = targetSheepId;

    let targetSheep: SheepEntity | null = null;
    if (targetSheepId) {
      const s = nextSheep.find(sh => sh.id === targetSheepId);
      if (s && s.isAlive) {
        targetSheep = s;
      }
    }

    let ateThisWeek = false;

    if (targetSheep) {
      // Calculate possible steps towards target sheep
      const dr = targetSheep.r - wolf.r;
      const dc = targetSheep.c - wolf.c;

      const candidateMoves: { r: number; c: number }[] = [];

      // Step 1: primary axis
      if (Math.abs(dr) >= Math.abs(dc) && dr !== 0) {
        candidateMoves.push({ r: wolf.r + (dr > 0 ? 1 : -1), c: wolf.c });
        if (dc !== 0) {
          candidateMoves.push({ r: wolf.r, c: wolf.c + (dc > 0 ? 1 : -1) });
        }
      } else if (dc !== 0) {
        candidateMoves.push({ r: wolf.r, c: wolf.c + (dc > 0 ? 1 : -1) });
        if (dr !== 0) {
          candidateMoves.push({ r: wolf.r + (dr > 0 ? 1 : -1), c: wolf.c });
        }
      }

      // Find first move that is within bounds and NOT occupied by another wolf
      let chosenMove: { r: number; c: number } | null = null;
      for (const move of candidateMoves) {
        if (move.r >= 0 && move.r < level.gridRows && move.c >= 0 && move.c < level.gridCols) {
          const posKey = `${move.r},${move.c}`;
          const isWolfPresent = nextWolves.some(
            w => w.id !== wolf.id && w.isAlive && w.r === move.r && w.c === move.c
          );
          if (!claimedWolfPositions.has(posKey) && !isWolfPresent) {
            chosenMove = move;
            break;
          }
        }
      }

      if (!chosenMove) {
        chosenMove = { r: wolf.r, c: wolf.c };
      }

      wolf.r = chosenMove.r;
      wolf.c = chosenMove.c;
      claimedWolfPositions.add(`${wolf.r},${wolf.c}`);

      events.push({
        week: nextWeek,
        type: 'wolf_move',
        r: wolf.r,
        c: wolf.c,
        sourceId: wolf.id,
        message: `Wolf moved to (${wolf.r + 1}, ${wolf.c + 1})`
      });

      // If wolf enters a cell with a sheep, the sheep is eaten instantly (leaving only the wolf)
      const sheepInCell = nextSheep.filter(s => s.isAlive && s.r === wolf.r && s.c === wolf.c);
      if (sheepInCell.length > 0) {
        const eatenSheep = sheepInCell[0];
        eatenSheep.isAlive = false;
        eatenSheep.deathReason = 'eaten';
        eatenSheep.deathWeek = nextWeek;
        wolf.starvedWeeks = 0;
        ateThisWeek = true;

        events.push({
          week: nextWeek,
          type: 'eat',
          r: wolf.r,
          c: wolf.c,
          sourceId: wolf.id,
          targetId: eatenSheep.id,
          message: `Wolf hunted sheep at (${wolf.r + 1}, ${wolf.c + 1})`
        });
      }
    } else {
      claimedWolfPositions.add(`${wolf.r},${wolf.c}`);
      wolf.starvedWeeks++;
    }

    if (!ateThisWeek && targetSheep) {
      wolf.starvedWeeks++;
    }

    // Check wolf starvation
    if (wolf.starvedWeeks >= level.rules.wolfStarveThreshold) {
      wolf.isAlive = false;
      wolf.deathReason = 'starved';
      wolf.deathWeek = nextWeek;
      claimedWolfPositions.delete(`${wolf.r},${wolf.c}`);
      events.push({
        week: nextWeek,
        type: 'wolf_starved',
        r: wolf.r,
        c: wolf.c,
        sourceId: wolf.id,
        message: `Wolf starved at (${wolf.r + 1}, ${wolf.c + 1}) after ${wolf.starvedWeeks} weeks without food`
      });
    }
  }

  const aliveSheepCount = nextSheep.filter(s => s.isAlive).length;
  const aliveWolvesCount = nextWolves.filter(w => w.isAlive).length;
  const activeGrassCount = nextGrid.flat().filter(c => c.isGrass && c.grassGrowth > 0).length;

  return {
    week: nextWeek,
    grid: nextGrid,
    sheep: nextSheep,
    wolves: nextWolves,
    events,
    aliveSheepCount,
    aliveWolvesCount,
    activeGrassCount,
  };
}

/**
 * Checks win or loss conditions for a simulation state at a specific week.
 */
export function evaluateSimulationOutcome(
  snapshot: SimulationSnapshot,
  level: LevelConfig
): 'ongoing' | 'victory' | 'defeat' {
  const { aliveSheepCount, aliveWolvesCount, week } = snapshot;

  // Both species must survive
  if (aliveSheepCount === 0) {
    return 'defeat'; // All sheep eaten/starved
  }

  if (aliveWolvesCount === 0 && level.rules.minSurvivingWolves > 0) {
    return 'defeat'; // Wolves starved
  }

  if (week >= level.targetWeeks) {
    if (
      aliveSheepCount >= level.rules.minSurvivingSheep &&
      aliveWolvesCount >= level.rules.minSurvivingWolves
    ) {
      return 'victory';
    } else {
      return 'defeat';
    }
  }

  return 'ongoing';
}
