// ============================================================
// Full sweep: hole% x accept-rate x grid-size, for the
// "punch holes then grow-walk until coverage threshold" hypothesis.
//
// Grid sizes: 3x3, 3x4, 4x4, 4x5, 5x5, 5x6, 6x6, 6x7, 7x7, 7x8, 8x8, 8x9, 9x9
// Hole%:      10, 15, 20, 25, 30
// Accept%:    75, 80, 85, 90, 95
// Max attempts per growth try: 10,000
// Trials per combo: 10 (kept modest — 13 sizes x 5 holes x 5 accepts x 10
//   trials = 3,250 runs, each up to 10,000 attempts, so this already takes
//   real time even at small grid sizes)
// ============================================================

function key(r,c){ return `${r},${c}`; }
function neighbors(r,c,rows,cols,blocked){
  return [[-1,0],[1,0],[0,-1],[0,1]]
    .map(([dr,dc]) => [r+dr,c+dc])
    .filter(([nr,nc]) => nr>=0 && nr<rows && nc>=0 && nc<cols && !blocked.has(key(nr,nc)));
}

function makeHoledGrid(rows, cols, holePercent) {
  const total = rows * cols;
  const numHoles = Math.floor(total * holePercent);
  const all = [];
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) all.push([r,c]);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const holes = new Set(all.slice(0, numHoles).map(([r,c]) => key(r,c)));
  const validCells = all.slice(numHoles);
  const start = validCells[Math.floor(Math.random() * validCells.length)];
  return { holes, validTotal: total - numHoles, start };
}

function growWalk(rows, cols, holes, start) {
  const visited = new Set([key(...start)]);
  const path = [start];
  let cur = start;
  while (true) {
    const ns = neighbors(cur[0], cur[1], rows, cols, holes).filter(([r,c]) => !visited.has(key(r,c)));
    if (ns.length === 0) break;
    cur = ns[Math.floor(Math.random() * ns.length)];
    visited.add(key(...cur));
    path.push(cur);
  }
  return path;
}

function attemptUntilThreshold(rows, cols, holes, start, validTotal, threshold, maxAttempts) {
  const target = Math.ceil(validTotal * threshold);
  let best = null;
  for (let a = 1; a <= maxAttempts; a++) {
    const path = growWalk(rows, cols, holes, start);
    if (!best || path.length > best.length) best = path;
    if (path.length >= target) return { success: true, attempts: a, path, target };
  }
  return { success: false, attempts: maxAttempts, path: best, target };
}

function runSolver(rows, cols, path, blockedHoles) {
  const stats = { deadEnds: 0, branches: 0, nodesVisited: 0, capped: false };
  const visited = new Set();
  const validSet = new Set(path.map(([r,c]) => key(r,c)));
  const TOTAL = path.length;
  const NODE_BUDGET = 20000;
  function solve(r, c, count) {
    if (count === TOTAL) return true;
    if (stats.nodesVisited >= NODE_BUDGET) { stats.capped = true; return true; }
    const ns = neighbors(r, c, rows, cols, blockedHoles)
      .filter(([nr,nc]) => validSet.has(key(nr,nc)) && !visited.has(key(nr,nc)));
    if (ns.length === 0) { stats.deadEnds++; return false; }
    if (ns.length >= 2) stats.branches++;
    for (const [nr, nc] of ns) {
      visited.add(key(nr, nc));
      stats.nodesVisited++;
      if (solve(nr, nc, count + 1)) return true;
      visited.delete(key(nr, nc));
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

// ── sweep config ──────────────────────────────────────────
const SIZES = [
  [3,3], [3,4], [4,4], [4,5], [5,5], [5,6], [6,6],
  [6,7], [7,7], [7,8], [8,8], [8,9], [9,9]
];
const HOLE_PERCENTS = [0.10, 0.15, 0.20, 0.25, 0.30];
const ACCEPT_THRESHOLDS = [0.75, 0.80, 0.85, 0.90, 0.95];
const MAX_ATTEMPTS = 10000;
const TRIALS = 10;

const summary = [];
const t0 = Date.now();
let comboIdx = 0;
const totalCombos = SIZES.length * HOLE_PERCENTS.length * ACCEPT_THRESHOLDS.length;

for (const [rows, cols] of SIZES) {
  for (const holePct of HOLE_PERCENTS) {
    for (const threshold of ACCEPT_THRESHOLDS) {
      comboIdx++;
      let successes = 0;
      const attemptsArr = [], scoreArr = [], coverageArr = [];
      for (let t = 0; t < TRIALS; t++) {
        const { holes, validTotal, start } = makeHoledGrid(rows, cols, holePct);
        const result = attemptUntilThreshold(rows, cols, holes, start, validTotal, threshold, MAX_ATTEMPTS);
        attemptsArr.push(result.attempts);
        const coverage = result.path.length / validTotal;
        coverageArr.push(coverage);
        if (result.success) {
          successes++;
          const stats = runSolver(rows, cols, result.path, holes);
          scoreArr.push(calcScore(stats, result.path.length));
        }
      }
      const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN;
      summary.push({
        rows, cols, size: `${rows}x${cols}`,
        holePct, threshold,
        successRate: successes / TRIALS,
        meanAttempts: mean(attemptsArr),
        meanCoverage: mean(coverageArr),
        meanScore: mean(scoreArr),
        scoreCount: scoreArr.length
      });
      if (comboIdx % 25 === 0) {
        process.stderr.write(`progress: ${comboIdx}/${totalCombos} combos, ${((Date.now()-t0)/1000).toFixed(1)}s elapsed\n`);
      }
    }
  }
}

process.stderr.write(`DONE: ${totalCombos} combos in ${((Date.now()-t0)/1000).toFixed(1)}s\n`);

require('fs').writeFileSync(
  require('path').join(__dirname, 'full_sweep_results.json'),
  JSON.stringify(summary)
);
console.log(`Saved ${summary.length} rows to test/full_sweep_results.json`);
