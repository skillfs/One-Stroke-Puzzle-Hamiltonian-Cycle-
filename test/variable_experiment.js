// ============================================================
// Experiment: deception score & radius of gyration vs. backbite move count
// Goal: find the right "lever" for difficulty — confirm that backbite
// iteration count (not grid size) drives deception score, and check
// whether radius of gyration (R_g) is a cheap proxy for it.
// ============================================================

function getNeighbors(row, col, size) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs
    .map(([dr,dc]) => [row+dr, col+dc])
    .filter(([r,c]) => r >= 0 && r < size && c >= 0 && c < size);
}
function nodeKey(row, col) { return `${row},${col}`; }

function initZigzag(size) {
  const path = [];
  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) for (let col = 0; col < size; col++) path.push([row, col]);
    else for (let col = size - 1; col >= 0; col--) path.push([row, col]);
  }
  return path;
}

function backbiteMove(path, size) {
  let p = path.map(n => [...n]);
  if (Math.random() < 0.5) p = p.reverse();
  const endpoint = p[0], nextInPath = p[1];
  const neighbors = getNeighbors(endpoint[0], endpoint[1], size);
  const candidates = neighbors.filter(([r,c]) => !(r === nextInPath[0] && c === nextInPath[1]));
  if (candidates.length === 0) return p;
  const N = candidates[Math.floor(Math.random() * candidates.length)];
  const k = p.findIndex(([r,c]) => r === N[0] && c === N[1]);
  return [...p.slice(0, k).reverse(), ...p.slice(k)];
}

function runSolver(size, solution) {
  const stats = { deadEnds: 0, branches: 0, nodesVisited: 0 };
  const visited = new Set();
  const validNodes = new Set(solution.map(([r,c]) => nodeKey(r,c)));

  function solve(row, col, count) {
    if (count === size * size) return true;
    const neighbors = getNeighbors(row, col, size)
      .filter(([r,c]) => validNodes.has(nodeKey(r,c)) && !visited.has(nodeKey(r,c)));
    if (neighbors.length === 0) { stats.deadEnds++; return false; }
    if (neighbors.length >= 2) stats.branches++;
    for (const [nr, nc] of neighbors) {
      visited.add(nodeKey(nr, nc));
      stats.nodesVisited++;
      if (solve(nr, nc, count + 1)) return true;
      visited.delete(nodeKey(nr, nc));
    }
    return false;
  }
  const [sr, sc] = solution[0];
  visited.add(nodeKey(sr, sc));
  solve(sr, sc, 1);
  return stats;
}

function calcScore(stats, size) {
  const N = size * size;
  const deadEndScore = Math.min(stats.deadEnds / (N * 2), 1.0);
  const branchScore  = Math.min(stats.branches / N, 1.0);
  const nodesScore   = Math.min(stats.nodesVisited / (N * N), 1.0);
  return Math.round((deadEndScore * 0.50 + branchScore * 0.30 + nodesScore * 0.20) * 100);
}

// NOTE: classic radius-of-gyration (mean dist of points from centroid) is
// useless here — for a full-coverage Hamiltonian path the *point set* is
// always "every cell in the grid", so R_g is identical for every path
// regardless of order. Need order-sensitive shape metrics instead:

// End-to-end distance: how far apart the two endpoints are
function endToEndDistance(path) {
  const [r1, c1] = path[0];
  const [r2, c2] = path[path.length - 1];
  return Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2);
}

// Turn count: number of direction changes along the path (proxy for
// path "wiggliness" / local complexity)
function turnCount(path) {
  let turns = 0;
  let prevDir = null;
  for (let i = 1; i < path.length; i++) {
    const dir = [path[i][0] - path[i-1][0], path[i][1] - path[i-1][1]];
    if (prevDir && (dir[0] !== prevDir[0] || dir[1] !== prevDir[1])) turns++;
    prevDir = dir;
  }
  return turns;
}

// ── Experiment config ──────────────────────────────────────
const SIZE = 6;
const CHECKPOINTS = [0, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];
const TRIALS = 25; // average over multiple independent runs to smooth noise

const results = CHECKPOINTS.map(() => ({ score: [], e2e: [], turns: [] }));

for (let t = 0; t < TRIALS; t++) {
  let path = initZigzag(SIZE);
  let movesDone = 0;
  for (let ci = 0; ci < CHECKPOINTS.length; ci++) {
    const target = CHECKPOINTS[ci];
    while (movesDone < target) {
      path = backbiteMove(path, SIZE);
      movesDone++;
    }
    const stats = runSolver(SIZE, path);
    const score = calcScore(stats, SIZE);
    results[ci].score.push(score);
    results[ci].e2e.push(endToEndDistance(path));
    results[ci].turns.push(turnCount(path));
  }
}

function mean(arr) { return arr.reduce((a,b) => a+b, 0) / arr.length; }
function std(arr) { const m = mean(arr); return Math.sqrt(mean(arr.map(x => (x-m)**2))); }

console.log(`SIZE=${SIZE}x${SIZE}  TRIALS=${TRIALS}`);
console.log('moves | deceptionScore(mean±sd) | end2end(mean±sd) | turns(mean±sd)');
console.log('------+-------------------------+-------------------+----------------');
const rows = [];
CHECKPOINTS.forEach((m, i) => {
  const sMean = mean(results[i].score), sStd = std(results[i].score);
  const eMean = mean(results[i].e2e), eStd = std(results[i].e2e);
  const tMean = mean(results[i].turns), tStd = std(results[i].turns);
  console.log(`${String(m).padStart(5)} | ${sMean.toFixed(1).padStart(5)} ± ${sStd.toFixed(1).padEnd(4)}      | ${eMean.toFixed(2).padStart(5)} ± ${eStd.toFixed(2).padEnd(4)}     | ${tMean.toFixed(1).padStart(5)} ± ${tStd.toFixed(1)}`);
  rows.push({ moves: m, scoreMean: sMean, scoreStd: sStd, e2eMean: eMean, e2eStd: eStd, turnsMean: tMean, turnsStd: tStd });
});

require('fs').writeFileSync(
  require('path').join(__dirname, 'variable_experiment_results.json'),
  JSON.stringify({ size: SIZE, trials: TRIALS, rows }, null, 2)
);
console.log('\nSaved: test/variable_experiment_results.json');
