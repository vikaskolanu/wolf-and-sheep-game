// Generate verified solutions for ALL 7 levels in 1-indexed format matching the UI tile coordinates (1,1 to N,N)

const GAME_LEVELS = [
  {
    id: 1,
    title: "Level 1 — Solitary Pasture (4×4)",
    gridRows: 4,
    gridCols: 4,
    targetWeeks: 8,
    budgets: { grass: 6, sheep: 3, wolves: 1 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 2,
    title: "Level 2 — Pasture Outpost (4×4)",
    gridRows: 4,
    gridCols: 4,
    targetWeeks: 10,
    budgets: { grass: 8, sheep: 4, wolves: 2 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 3,
    title: "Level 3 — Two Hunters (5×5)",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 12,
    budgets: { grass: 10, sheep: 4, wolves: 2 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 4,
    title: "Level 4 — Multi-Flock Breeding (5×5)",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 15,
    budgets: { grass: 12, sheep: 5, wolves: 3 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 5,
    title: "Level 5 — Predator Balance (5×5)",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 20,
    budgets: { grass: 14, sheep: 6, wolves: 4 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 6,
    title: "Level 6 — Master Apex (5×5)",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 30,
    budgets: { grass: 16, sheep: 8, wolves: 5 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  },
  {
    id: 7,
    title: "Level 7 — Apex Equilibrium (5×5)",
    gridRows: 5,
    gridCols: 5,
    targetWeeks: 30,
    budgets: { grass: 16, sheep: 8, wolves: 6 },
    rules: { wolfStarveThreshold: 4, sheepStarveThreshold: 1, sheepReproInterval: 2, grassRegrowthInterval: 3, minSurvivingSheep: 1, minSurvivingWolves: 1 }
  }
];

const DIRECTION_OFFSETS = [
  { r: -1, c: 0 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
];

function stepSimulation(snapshot, level) {
  const nextWeek = snapshot.week + 1;
  const nextGrid = snapshot.grid.map(row => row.map(cell => ({ ...cell })));
  const nextSheep = snapshot.sheep.map(s => ({ ...s }));
  const nextWolves = snapshot.wolves.map(w => ({ ...w }));

  for (let r = 0; r < level.gridRows; r++) {
    for (let c = 0; c < level.gridCols; c++) {
      const cell = nextGrid[r][c];
      if (cell.isGrass && cell.grassGrowth < cell.grassMaxGrowth) {
        if (cell.grassRegrowCountdown > 0) cell.grassRegrowCountdown--;
        else cell.grassGrowth = Math.min(cell.grassMaxGrowth, cell.grassGrowth + 1);
      }
    }
  }

  const newlySpawnedSheep = [];
  const wolvesFedOnTheSpot = new Set();
  nextSheep.sort((a, b) => (a.r * 100 + a.c) - (b.r * 100 + b.c));

  for (const sheep of nextSheep) {
    if (!sheep.isAlive) continue;
    const cell = nextGrid[sheep.r][sheep.c];

    if (cell.isGrass) {
      sheep.starvedWeeks = 0;
      sheep.fedRecently = true;
      sheep.reproductionCooldown--;

      if (sheep.reproductionCooldown <= 0) {
        const emptyAdjacentGrass = [];
        const emptyAdjacentLand = [];
        const adjacentWolfCells = [];

        for (const dir of DIRECTION_OFFSETS) {
          const nr = sheep.r + dir.r;
          const nc = sheep.c + dir.c;

          if (nr >= 0 && nr < level.gridRows && nc >= 0 && nc < level.gridCols) {
            const isSheepPresent =
              nextSheep.some(s => s.isAlive && s.r === nr && s.c === nc) ||
              newlySpawnedSheep.some(s => s.isAlive && s.r === nr && s.c === nc);

            if (!isSheepPresent) {
              const wolfPresent = nextWolves.find(w => w.isAlive && w.r === nr && w.c === nc);
              if (wolfPresent) adjacentWolfCells.push({ r: nr, c: nc, wolf: wolfPresent });
              else if (nextGrid[nr][nc].isGrass) emptyAdjacentGrass.push({ r: nr, c: nc });
              else emptyAdjacentLand.push({ r: nr, c: nc });
            }
          }
        }

        let birthPos = null;
        let targetWolf = null;

        if (emptyAdjacentGrass.length > 0) birthPos = emptyAdjacentGrass[0];
        else if (emptyAdjacentLand.length > 0) birthPos = emptyAdjacentLand[0];
        else if (adjacentWolfCells.length > 0) {
          birthPos = { r: adjacentWolfCells[0].r, c: adjacentWolfCells[0].c };
          targetWolf = adjacentWolfCells[0].wolf;
        }

        if (birthPos) {
          const isBirthOnGrass = nextGrid[birthPos.r][birthPos.c].isGrass;
          const newSheepId = `sheep_w${nextWeek}_${birthPos.r}_${birthPos.c}`;

          if (targetWolf) {
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
          } else {
            newlySpawnedSheep.push({
              id: newSheepId,
              r: birthPos.r,
              c: birthPos.c,
              isAlive: true,
              starvedWeeks: 0,
              fedRecently: isBirthOnGrass,
              reproductionCooldown: level.rules.sheepReproInterval,
            });
          }

          sheep.reproductionCooldown = level.rules.sheepReproInterval;
        }
      }
    } else {
      sheep.starvedWeeks++;
      sheep.fedRecently = false;
      if (sheep.starvedWeeks >= level.rules.sheepStarveThreshold) {
        sheep.isAlive = false;
      }
    }
  }

  nextSheep.push(...newlySpawnedSheep);

  nextWolves.sort((a, b) => (a.r * 100 + a.c) - (b.r * 100 + b.c));

  for (const wolf of nextWolves) {
    if (!wolf.isAlive) continue;

    if (wolvesFedOnTheSpot.has(wolf.id)) {
      continue;
    }

    const aliveSheepList = nextSheep.filter(s => s.isAlive);
    if (aliveSheepList.length === 0) {
      wolf.starvedWeeks++;
      if (wolf.starvedWeeks >= level.rules.wolfStarveThreshold) wolf.isAlive = false;
      continue;
    }

    let targetSheep = null;
    let minDist = Infinity;
    for (const s of aliveSheepList) {
      const dist = Math.abs(wolf.r - s.r) + Math.abs(wolf.c - s.c);
      if (dist < minDist) {
        minDist = dist;
        targetSheep = s;
      }
    }

    if (!targetSheep) {
      wolf.starvedWeeks++;
      if (wolf.starvedWeeks >= level.rules.wolfStarveThreshold) wolf.isAlive = false;
      continue;
    }

    const possibleMoves = [];
    for (const dir of DIRECTION_OFFSETS) {
      const nr = wolf.r + dir.r;
      const nc = wolf.c + dir.c;
      if (nr >= 0 && nr < level.gridRows && nc >= 0 && nc < level.gridCols) {
        const isOtherWolf = nextWolves.some(w => w !== wolf && w.isAlive && w.r === nr && w.c === nc);
        if (!isOtherWolf) {
          const distToTarget = Math.abs(nr - targetSheep.r) + Math.abs(nc - targetSheep.c);
          possibleMoves.push({ r: nr, c: nc, dist: distToTarget });
        }
      }
    }

    if (possibleMoves.length > 0) {
      possibleMoves.sort((a, b) => a.dist - b.dist);
      const chosenMove = possibleMoves[0];
      wolf.r = chosenMove.r;
      wolf.c = chosenMove.c;

      const victim = nextSheep.find(s => s.isAlive && s.r === wolf.r && s.c === wolf.c);
      if (victim) {
        victim.isAlive = false;
        wolf.starvedWeeks = 0;
      } else {
        wolf.starvedWeeks++;
        if (wolf.starvedWeeks >= level.rules.wolfStarveThreshold) wolf.isAlive = false;
      }
    } else {
      wolf.starvedWeeks++;
      if (wolf.starvedWeeks >= level.rules.wolfStarveThreshold) wolf.isAlive = false;
    }
  }

  return {
    week: nextWeek,
    grid: nextGrid,
    sheep: nextSheep,
    wolves: nextWolves,
    aliveSheepCount: nextSheep.filter(s => s.isAlive).length,
    aliveWolvesCount: nextWolves.filter(w => w.isAlive).length,
  };
}

function simulate(placement, level) {
  const grid = Array.from({ length: level.gridRows }, (_, r) =>
    Array.from({ length: level.gridCols }, (_, c) => ({
      r,
      c,
      isGrass: placement.grass[r][c],
      grassGrowth: 5,
      grassMaxGrowth: 5,
      grassRegrowCountdown: 0,
    }))
  );

  const sheep = placement.sheep.map(([r, c], idx) => ({
    id: `sheep_${idx}`,
    r,
    c,
    isAlive: true,
    starvedWeeks: 0,
    fedRecently: grid[r][c].isGrass,
    reproductionCooldown: 1,
  }));

  const wolves = placement.wolves.map(([r, c], idx) => ({
    id: `wolf_${idx}`,
    r,
    c,
    isAlive: true,
    starvedWeeks: 0,
    targetSheepId: null,
  }));

  let snap = { week: 0, grid, sheep, wolves, aliveSheepCount: sheep.length, aliveWolvesCount: wolves.length };

  for (let w = 1; w <= level.targetWeeks; w++) {
    snap = stepSimulation(snap, level);
    if (snap.aliveSheepCount < level.rules.minSurvivingSheep || snap.aliveWolvesCount < level.rules.minSurvivingWolves) {
      return { won: false, week: w, finalSheep: snap.aliveSheepCount, finalWolves: snap.aliveWolvesCount };
    }
  }

  return { won: true, week: level.targetWeeks, finalSheep: snap.aliveSheepCount, finalWolves: snap.aliveWolvesCount };
}

function randomPlacement(level) {
  const allCoords = [];
  for (let r = 0; r < level.gridRows; r++) {
    for (let c = 0; c < level.gridCols; c++) allCoords.push([r, c]);
  }

  const shuffledGrass = [...allCoords].sort(() => Math.random() - 0.5);
  const grass = Array.from({ length: level.gridRows }, () => Array(level.gridCols).fill(false));
  shuffledGrass.slice(0, level.budgets.grass).forEach(([r, c]) => { grass[r][c] = true; });

  const shuffledEnt = [...allCoords].sort(() => Math.random() - 0.5);
  const sheep = shuffledEnt.slice(0, level.budgets.sheep);
  const wolves = shuffledEnt.slice(level.budgets.sheep, level.budgets.sheep + level.budgets.wolves);

  return { grass, sheep, wolves };
}

for (const level of GAME_LEVELS) {
  let winning = null;
  for (let i = 0; i < 40000; i++) {
    const p = randomPlacement(level);
    const res = simulate(p, level);
    if (res.won) {
      winning = { p, res };
      break;
    }
  }

  console.log(`\n========================================================================`);
  console.log(`LEVEL ${level.id} (${level.gridRows}×${level.gridCols}) — ${level.title}`);
  console.log(`Target: ${level.targetWeeks}w | Grass: ${level.budgets.grass} | Sheep: ${level.budgets.sheep} | Wolves: ${level.budgets.wolves}`);
  console.log(`Outcome: VICTORY (Final Sheep: ${winning.res.finalSheep}, Final Wolves: ${winning.res.finalWolves})`);
  console.log(`========================================================================`);

  const grass1Indexed = [];
  for (let r = 0; r < level.gridRows; r++) {
    for (let c = 0; c < level.gridCols; c++) {
      if (winning.p.grass[r][c]) grass1Indexed.push(`(${r+1},${c+1})`);
    }
  }
  console.log(`🌿 Grass (${level.budgets.grass}):`, grass1Indexed.join(', '));
  console.log(`🐑 Sheep (${level.budgets.sheep}):`, winning.p.sheep.map(([r, c]) => `(${r+1},${c+1})`).join(', '));
  console.log(`🐺 Wolves (${level.budgets.wolves}):`, winning.p.wolves.map(([r, c]) => `(${r+1},${c+1})`).join(', '));

  console.log(`\nVisual Board (Row 1..${level.gridRows}, Col 1..${level.gridCols}):`);
  let header = "   ";
  for (let c = 1; c <= level.gridCols; c++) header += `  ${c}  `;
  console.log(header);
  console.log("   +" + "----+".repeat(level.gridCols));

  for (let r = 0; r < level.gridRows; r++) {
    let rowStr = ` ${r+1} |`;
    for (let c = 0; c < level.gridCols; c++) {
      const isGrass = winning.p.grass[r][c];
      const hasSheep = winning.p.sheep.some(([sr, sc]) => sr === r && sc === c);
      const hasWolf = winning.p.wolves.some(([wr, wc]) => wr === r && wc === c);

      let sym = isGrass ? ' .  ' : '    ';
      if (hasWolf && isGrass) sym = ' 🐺.';
      else if (hasWolf) sym = ' 🐺 ';
      else if (hasSheep && isGrass) sym = ' 🐑.';
      else if (hasSheep) sym = ' 🐑 ';

      rowStr += sym + '|';
    }
    console.log(rowStr);
    console.log("   +" + "----+".repeat(level.gridCols));
  }
}
