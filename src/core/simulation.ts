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
 * Assigns each alive wolf to the closest untargeted alive sheep deterministically.
 */
export function assignWolfTargets(wolves: WolfEntity[], sheep: SheepEntity[]): Map<string, string | null> {
  const aliveWolves = wolves.filter(w => w.isAlive).sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
  const aliveSheep = sheep.filter(s => s.isAlive).sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
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
    wolfPos: number;
    sheepPos: number;
  }

  const pairs: Pair[] = [];
  for (const w of aliveWolves) {
    for (const s of aliveSheep) {
      pairs.push({
        wolfId: w.id,
        sheepId: s.id,
        dist: manhattanDist(w.r, w.c, s.r, s.c),
        wolfPos: w.r * 100 + w.c,
        sheepPos: s.r * 100 + s.c,
      });
    }
  }

  // Sort pairs deterministically: by distance ascending, then wolf position, then sheep position
  pairs.sort((a, b) => {
    if (a.dist !== b.dist) return a.dist - b.dist;
    if (a.wolfPos !== b.wolfPos) return a.wolfPos - b.wolfPos;
    return a.sheepPos - b.sheepPos;
  });

  const targetedSheepIds = new Set<string>();
  const assignedWolves = new Set<string>();

  for (const p of pairs) {
    if (!assignedWolves.has(p.wolfId) && !targetedSheepIds.has(p.sheepId)) {
      targetMap.set(p.wolfId, p.sheepId);
      assignedWolves.add(p.wolfId);
      targetedSheepIds.add(p.sheepId);
    }
  }

  // Any remaining wolves target the closest sheep deterministically
  for (const w of aliveWolves) {
    if (!assignedWolves.has(w.id)) {
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
 * Executes a single week simulation tick (100% deterministic).
 */
export function stepSimulation(
  currentSnapshot: SimulationSnapshot,
  level: LevelConfig
): SimulationSnapshot {
  const nextWeek = currentSnapshot.week + 1;
  const events: SimulationEvent[] = [];

  // Deep clone current grid state
  const nextGrid: CellState[][] = currentSnapshot.grid.map(row =>
    row.map(cell => ({ ...cell }))
  );
  
  // Clone entities sorted deterministically by position
  const nextSheep: SheepEntity[] = currentSnapshot.sheep
    .map(s => ({ ...s }))
    .sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));

  const nextWolves: WolfEntity[] = currentSnapshot.wolves
    .map(w => ({ ...w }))
    .sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));

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

  // 2. Sheep Grazing & Reproduction Phase (Every week on grassland)
  const newlySpawnedSheep: SheepEntity[] = [];

  // Fixed deterministic direction priority: Up, Right, Down, Left
  const DIRECTION_OFFSETS = [
    { r: -1, c: 0 },
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
  ];

  for (const sheep of nextSheep) {
    if (!sheep.isAlive) continue;

    const cell = nextGrid[sheep.r][sheep.c];

    if (cell.isGrass) {
      // Sheep is in grassland with food
      sheep.starvedWeeks = 0;
      sheep.fedRecently = true;
      sheep.reproductionCooldown--;

      // Sheep in grasslands reproduce every week when cooldown reaches 0
      if (sheep.reproductionCooldown <= 0) {
        // Collect adjacent directions within grid bounds
        const emptyAdjacentGrass: { r: number; c: number }[] = [];
        const emptyAdjacentLand: { r: number; c: number }[] = [];
        const adjacentWolfCells: { r: number; c: number; wolf: WolfEntity }[] = [];

        for (const dir of DIRECTION_OFFSETS) {
          const nr = sheep.r + dir.r;
          const nc = sheep.c + dir.c;

          if (nr >= 0 && nr < level.gridRows && nc >= 0 && nc < level.gridCols) {
            const isSheepPresent =
              nextSheep.some(s => s.isAlive && s.r === nr && s.c === nc) ||
              newlySpawnedSheep.some(s => s.isAlive && s.r === nr && s.c === nc);

            if (!isSheepPresent) {
              const wolfPresent = nextWolves.find(w => w.isAlive && w.r === nr && w.c === nc);
              if (wolfPresent) {
                adjacentWolfCells.push({ r: nr, c: nc, wolf: wolfPresent });
              } else if (nextGrid[nr][nc].isGrass) {
                emptyAdjacentGrass.push({ r: nr, c: nc });
              } else {
                emptyAdjacentLand.push({ r: nr, c: nc });
              }
            }
          }
        }

        // Deterministic Priority: First available empty grass > empty land > adjacent wolf cell
        let birthPos: { r: number; c: number } | null = null;
        let targetWolf: WolfEntity | null = null;

        if (emptyAdjacentGrass.length > 0) {
          birthPos = emptyAdjacentGrass[0];
        } else if (emptyAdjacentLand.length > 0) {
          birthPos = emptyAdjacentLand[0];
        } else if (adjacentWolfCells.length > 0) {
          birthPos = { r: adjacentWolfCells[0].r, c: adjacentWolfCells[0].c };
          targetWolf = adjacentWolfCells[0].wolf;
        }

        if (birthPos) {
          const isBirthOnGrass = nextGrid[birthPos.r][birthPos.c].isGrass;
          const newSheepId = `sheep_w${nextWeek}_p${sheep.r}_${sheep.c}_to_${birthPos.r}_${birthPos.c}`;

          if (targetWolf) {
            // Sheep reproduced into a cell occupied by a wolf:
            // The wolf eats the sheep on the spot, resets hunger, and remains in place
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
              message: `Sheep multiplied into wolf cell at (${birthPos.r + 1}, ${birthPos.c + 1}) — wolf ate it on the spot and remained in place`
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

          // Reset parent cooldown (every week)
          sheep.reproductionCooldown = level.rules.sheepReproInterval;
        } else {
          // No space to reproduce this week - ready again next week
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

  // 3. Assign Wolf Targets & Move Wolves (1 step per week)
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
      // Calculate possible single steps towards target sheep
      const dr = targetSheep.r - wolf.r;
      const dc = targetSheep.c - wolf.c;

      const candidateMoves: { r: number; c: number }[] = [];

      // Primary axis step first, then secondary
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

      // Find first valid move within bounds and NOT occupied by another wolf
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

    // Check wolf starvation (dies after 3 weeks without food)
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
 * Evaluates simulation outcome at the end of a week.
 */
export function evaluateSimulationOutcome(
  snapshot: SimulationSnapshot,
  level: LevelConfig
): 'victory' | 'defeat' | 'in_progress' {
  const { aliveSheepCount, aliveWolvesCount, week } = snapshot;

  // Defeat condition 1: All sheep dead
  if (aliveSheepCount < level.rules.minSurvivingSheep) {
    return 'defeat';
  }

  // Defeat condition 2: All wolves dead before target weeks (predator collapse)
  if (aliveWolvesCount < level.rules.minSurvivingWolves && week < level.targetWeeks) {
    return 'defeat';
  }

  // Victory condition: Reached target weeks with both species alive
  if (week >= level.targetWeeks) {
    if (
      aliveSheepCount >= level.rules.minSurvivingSheep &&
      aliveWolvesCount >= level.rules.minSurvivingWolves
    ) {
      return 'victory';
    }
    return 'defeat';
  }

  return 'in_progress';
}
