// ============================================================
// Hypothesis test: random-hole grid + growth-walk-until-coverage-threshold
//
//   1. grid size M x M  for M in [5,6,7,8]
//   2. punch holes up to N% of cells, N in [30,25,20,15,10]
//   3. pick 1 random start cell
//   4. random self-avoiding walk from start; stop once it covers
//      80% or 90% of the *valid* (non-hole) cells, OR gets stuck earlier
//   5. unwalked valid cells become holes too (final level = walked path only)
//   6. run the deception-score solver on the resulting level
//
// This directly tests the attrition concern raised earlier: how often
// does the walk actually reach 80%/90% coverage before getting stuck,
// and what does the resulting deception score look like.
// ============================================================

function key(r,c){ return `${r},${c}`; }
function neighbors(r,c,size,blocked){
  return [[-1,0],[1,0],[0,-1],[0,1]]
    .map(([dr,dc]) => [r+dr,c+dc])
    .filter(([nr,nc]) => nr>=0 && nr<size && nc>=0 && nc<size && !blocked.has(key(nr,nc)));
}

function makeHoledGrid(size, holePercent) {
  const total = size * size;
  const numHoles = Math.floor(total * holePercent);
  const allCells = [];
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) allCells.push([r,c]);
  // shuffle
  for (let i = allCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
  }
  const holes = new Set(allCells.slice(0, numHoles).map(([r,c]) => key(r,c)));
  const validCells = allCells.slice(numHoles);
  const start = validCells[Math.floor(Math.random() * validCells.length)];
  return { holes, validTotal: total - numHoles, start };
}

// one growth attempt: random self-avoiding walk until stuck
function growWalk(size, holes, start) {
  const visited = new Set([key(...start)]);
  const path = [start];
  let cur = start;
  while (true) {
    const ns = neighbors(cur[0], cur[1], size, holes).filter(([r,c]) => !visited.has(key(r,c)));
    if (ns.length === 0) break;
    cur = ns[Math.floor(Math.random() * ns.length)];
    visited.add(key(...cur));
    path.push(cur);
  }
  return path;
}

// retry growth from the same hole layout/start until coverage threshold met
// or attempt budget exhausted
function attemptUntilThreshold(size, holes, start, validTotal, threshold, maxAttempts) {
  const target = Math.ceil(validTotal * threshold);
  let best = null;
  for (let a = 1; a <= maxAttempts; a++) {
    const path = growWalk(size, holes, start);
    if (!best || path.length > best.length) best = path;
    if (path.length >= target) return { success: true, attempts: a, path, target };
  }
  return { success: false, attempts: maxAttempts, path: best, target };
}

function runSolver(size, path, blockedHoles) {
  const stats = { deadEnds: 0, branches: 0, nodesVisited: 0 };
  const visited = new Set();
  const validSet = new Set(path.map(([r,c]) => key(r,c)));
  const TOTAL = path.length;
  function solve(r, c, count) {
    if (count === TOTAL) return true;
    const ns = neighbors(r, c, size, blockedHoles)
      .filter(([nr,nc]) => validSet.has(key(nr,nc)) && !visited.has(key(nr,nc)));
    if (ns.length === 0) { stats.deadEnds++; return false; }
    if (ns.length >= 2) stats.branches++;
    for (const [nr, nc] of ns) {
      visited.add(key(nr,nc));
      stats.nodesVisited++;
      if (solve(nr, nc, count + 1)) return true;
      visited.delete(key(nr,nc));
    }
    return false;
  }
  visited.add(key(...path[0]));
  solve(path[0][0], path[0][1], 1);
  return stats;
}

function calcScore(stats, N) {
  const deadEndScore = Math.min(stats.deadEnds / (N * 2), 1.0);
  const branchScore  = Math.min(stats.branches / N, 1.0);
  const nodesScore   = Math.min(stats.nodesVisited / (N * N), 1.0);
  return Math.round((deadEndScore*0.50 + branchScore*0.30 + nodesScore*0.20) * 100);
}

// ── Experiment grid ──────────────────────────────────────────
const SIZES = [5, 6, 7, 8];
const HOLE_PERCENTS = [0.30, 0.25, 0.20, 0.15, 0.10];
const ACCEPT_THRESHOLDS = [0.80, 0.90];
const TRIALS = 15;
const MAX_ATTEMPTS = 300;

const summary = [];

for (const size of SIZES) {
  for (const holePct of HOLE_PERCENTS) {
    for (const threshold of ACCEPT_THRESHOLDS) {
      let successes = 0;
      const attemptsArr = [], scoreArr = [], coverageArr = [];
      for (let t = 0; t < TRIALS; t++) {
        const { holes, validTotal, start } = makeHoledGrid(size, holePct);
        const result = attemptUntilThreshold(size, holes, start, validTotal, threshold, MAX_ATTEMPTS);
        attemptsArr.push(result.attempts);
        const coverage = result.path.length / validTotal;
        coverageArr.push(coverage);
        if (result.success) {
          successes++;
          const stats = runSolver(size, result.path, holes);
          const score = calcScore(stats, result.path.length);
          scoreArr.push(score);
        }
      }
      const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN;
      summary.push({
        size, holePct, threshold,
        successRate: successes / TRIALS,
        meanAttempts: mean(attemptsArr),
        meanCoverage: mean(coverageArr),
        meanScore: mean(scoreArr),
        scoreCount: scoreArr.length
      });
    }
  }
}

console.log('size | hole% | accept | successRate | meanAttempts | meanCoverage | meanScore(n)');
console.log('-----+-------+--------+-------------+--------------+--------------+-------------');
summary.forEach(r => {
  console.log(
    `${String(r.size).padStart(4)} | ${String(Math.round(r.holePct*100)).padStart(4)}% | ${String(Math.round(r.threshold*100)).padStart(5)}% | ` +
    `${(r.successRate*100).toFixed(0).padStart(10)}% | ${r.meanAttempts.toFixed(1).padStart(12)} | ${(r.meanCoverage*100).toFixed(1).padStart(11)}% | ` +
    `${isNaN(r.meanScore) ? 'n/a'.padStart(9) : r.meanScore.toFixed(1).padStart(9)} (${r.scoreCount})`
  );
});

require('fs').writeFileSync(
  require('path').join(__dirname, 'hole_walk_experiment_results.json'),
  JSON.stringify(summary, null, 2)
);
console.log('\nSaved: test/hole_walk_experiment_results.json');
