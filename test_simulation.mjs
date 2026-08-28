function manhattanDist(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function assignWolfTargets(wolves, sheep) {
  const aliveWolves = wolves.filter(w => w.isAlive);
  const aliveSheep = sheep.filter(s => s.isAlive);
  const targetMap = new Map();

  if (aliveSheep.length === 0) {
    aliveWolves.forEach(w => targetMap.set(w.id, null));
    return targetMap;
  }

  const pairs = [];
  for (const w of aliveWolves) {
    for (const s of aliveSheep) {
      pairs.push({
        wolfId: w.id,
        sheepId: s.id,
        dist: manhattanDist(w.r, w.c, s.r, s.c),
      });
    }
  }

  pairs.sort((a, b) => a.dist - b.dist);

  const targetedSheepIds = new Set();
  const assignedWolves = new Set();

  for (const p of pairs) {
    if (!assignedWolves.has(p.wolfId) && !targetedSheepIds.has(p.sheepId)) {
      targetMap.set(p.wolfId, p.sheepId);
      assignedWolves.add(p.wolfId);
      targetedSheepIds.add(p.sheepId);
    }
  }

  for (const w of aliveWolves) {
    if (!assignedWolves.has(w.id)) {
      let closestSheep = null;
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("--- Executing Simulation Verification Tests ---");

// Test 1: Distance metric
assert(manhattanDist(0, 0, 3, 4) === 7, "Manhattan distance (0,0) to (3,4) is 7");

// Test 2: Wolf targeting closest untargeted prey
const wolves = [
  { id: 'w1', r: 0, c: 0, isAlive: true },
  { id: 'w2', r: 0, c: 4, isAlive: true },
];

const sheep = [
  { id: 's1', r: 0, c: 1, isAlive: true },
  { id: 's2', r: 0, c: 3, isAlive: true },
];

const targets = assignWolfTargets(wolves, sheep);
assert(targets.get('w1') === 's1', "Wolf 1 (0,0) targets nearest sheep s1 (0,1)");
assert(targets.get('w2') === 's2', "Wolf 2 (0,4) targets closest untargeted sheep s2 (0,3)");

console.log("🎉 All verification test assertions passed!");
