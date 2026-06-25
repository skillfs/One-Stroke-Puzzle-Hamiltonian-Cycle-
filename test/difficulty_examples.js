// ============================================================
// Generate concrete example levels for Easy / Medium / Hard
// so the human can eyeball whether the score's classification
// actually matches what looks hard to a person.
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

function generateLevel(size, moves) {
  let path = initZigzag(size);
  for (let i = 0; i < moves; i++) path = backbiteMove(path, size);
  return path;
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

function classify(score) {
  if (score < 30) return 'Easy';
  if (score < 65) return 'Medium';
  return 'Hard';
}

function gridString(path, size) {
  const order = {};
  path.forEach(([r,c], i) => { order[nodeKey(r,c)] = i + 1; });
  const lines = [];
  for (let r = 0; r < size; r++) {
    let row = '';
    for (let c = 0; c < size; c++) row += String(order[nodeKey(r,c)]).padStart(3);
    lines.push(row);
  }
  return lines.join('\n');
}

const SIZE = 5;
const NEEDED = 3;
const buckets = { Easy: [], Medium: [], Hard: [] };
const seen = { Easy: new Set(), Medium: new Set(), Hard: new Set() };

let attempts = 0;
while ((buckets.Easy.length < NEEDED || buckets.Medium.length < NEEDED || buckets.Hard.length < NEEDED) && attempts < 20000) {
  attempts++;
  const moves = Math.floor(Math.random() * 200); // vary moves so Easy levels (few moves) also show up
  const path = generateLevel(SIZE, moves);
  const stats = runSolver(SIZE, path);
  const score = calcScore(stats, SIZE);
  const level = classify(score);
  if (buckets[level].length >= NEEDED) continue;
  const sig = gridString(path, SIZE);
  if (seen[level].has(sig)) continue;
  seen[level].add(sig);
  buckets[level].push({ moves, score, stats, grid: sig, start: path[0], end: path[path.length-1] });
}

console.log(`SIZE=${SIZE}x${SIZE}  attempts=${attempts}\n`);
for (const level of ['Easy', 'Medium', 'Hard']) {
  console.log('='.repeat(50));
  console.log(`${level}  (${buckets[level].length}/${NEEDED} found)`);
  console.log('='.repeat(50));
  buckets[level].forEach((ex, i) => {
    console.log(`\n--- ${level} #${i+1} | score=${ex.score} | deadEnds=${ex.stats.deadEnds} branches=${ex.stats.branches} nodesVisited=${ex.stats.nodesVisited} | backbiteMoves=${ex.moves} ---`);
    console.log(`start=${ex.start} end=${ex.end}`);
    console.log(ex.grid);
  });
}

require('fs').writeFileSync(
  require('path').join(__dirname, 'difficulty_examples_results.json'),
  JSON.stringify({ size: SIZE, buckets }, null, 2)
);
console.log('\nSaved: test/difficulty_examples_results.json');
