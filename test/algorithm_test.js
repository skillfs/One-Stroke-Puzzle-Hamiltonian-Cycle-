// ============================================================
// One-Stroke PCG — Algorithm Test
// Tests: Backbite Generator + Backtracking Solver + Deception Score
// ============================================================

// ── Helper: Grid Neighbors ──────────────────────────────────
function getNeighbors(row, col, size) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs
    .map(([dr,dc]) => [row+dr, col+dc])
    .filter(([r,c]) => r >= 0 && r < size && c >= 0 && c < size);
}

function nodeKey(row, col) { return `${row},${col}`; }

// ── Backbite Algorithm ──────────────────────────────────────
function initZigzag(size) {
  const path = [];
  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < size; col++) path.push([row, col]);
    } else {
      for (let col = size - 1; col >= 0; col--) path.push([row, col]);
    }
  }
  return path;
}

function backbiteMove(path, size) {
  let p = [...path.map(n => [...n])];

  // สุ่มเลือก endpoint (head หรือ tail)
  if (Math.random() < 0.5) p = p.reverse();

  const endpoint   = p[0];
  const nextInPath = p[1];

  const neighbors  = getNeighbors(endpoint[0], endpoint[1], size);
  const candidates = neighbors.filter(
    ([r,c]) => !(r === nextInPath[0] && c === nextInPath[1])
  );

  if (candidates.length === 0) return p;

  // สุ่ม neighbor
  const N = candidates[Math.floor(Math.random() * candidates.length)];
  const k = p.findIndex(([r,c]) => r === N[0] && c === N[1]);

  // Apply backbite: reverse(p[0..k-1]) + p[k..end]
  const newPath = [...p.slice(0, k).reverse(), ...p.slice(k)];
  return newPath;
}

function generateLevel(size, qualityFactor = 1.0) {
  let path = initZigzag(size);

  const targetMoves = Math.floor(
    qualityFactor * 10.0 * size * size * Math.log(size + 2) ** 2
  );

  // Phase 1: randomize
  let success = 0;
  let attempts = 0;
  while (success < targetMoves && attempts < targetMoves * 10) {
    const newPath = backbiteMove(path, size);
    const changed = newPath.some((n,i) => n[0] !== path[i][0] || n[1] !== path[i][1]);
    if (changed) success++;
    path = newPath;
    attempts++;
  }

  // Phase 2: unbiased
  for (let i = 0; i < targetMoves; i++) {
    path = backbiteMove(path, size);
  }

  return path;
}

// ── Backtracking Solver ─────────────────────────────────────
function runSolver(size, solution) {
  const stats = { deadEnds: 0, branches: 0, nodesVisited: 0 };
  const visited = new Set();

  // สร้าง valid grid จาก solution (ทุก node ใน solution ถือว่าเปิด)
  const validNodes = new Set(solution.map(([r,c]) => nodeKey(r,c)));

  function solve(row, col, count) {
    if (count === size * size) return true;

    const neighbors = getNeighbors(row, col, size)
      .filter(([r,c]) => validNodes.has(nodeKey(r,c)) && !visited.has(nodeKey(r,c)));

    if (neighbors.length === 0) {
      stats.deadEnds++;
      return false;
    }
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

// ── Deception Score ─────────────────────────────────────────
function calcScore(stats, size) {
  const N = size * size;
  const deadEndScore  = Math.min(stats.deadEnds    / (N * 2), 1.0);
  const branchScore   = Math.min(stats.branches    / N,       1.0);
  const nodesScore    = Math.min(stats.nodesVisited / (N * N), 1.0);

  const score = deadEndScore * 0.50
              + branchScore  * 0.30
              + nodesScore   * 0.20;

  return Math.round(score * 100);
}

function classify(score) {
  if (score < 30)  return 'Easy';
  if (score < 65)  return 'Medium';
  return 'Hard';
}

// ── Validation ──────────────────────────────────────────────
function validatePath(path, size) {
  const total = size * size;
  if (path.length !== total) return { ok: false, reason: `length=${path.length} ≠ ${total}` };

  const seen = new Set();
  for (const [r,c] of path) {
    const k = nodeKey(r,c);
    if (seen.has(k)) return { ok: false, reason: `duplicate node (${r},${c})` };
    seen.add(k);
  }

  for (let i = 0; i < path.length - 1; i++) {
    const [r1,c1] = path[i];
    const [r2,c2] = path[i+1];
    const dr = Math.abs(r1-r2), dc = Math.abs(c1-c2);
    if (dr + dc !== 1) return { ok: false, reason: `non-adjacent step at i=${i}` };
  }

  return { ok: true };
}

// ── Test Runner ─────────────────────────────────────────────
function separator(label) {
  console.log('\n' + '═'.repeat(55));
  console.log(`  ${label}`);
  console.log('═'.repeat(55));
}

function printGrid(path, size) {
  const order = {};
  path.forEach(([r,c], i) => { order[nodeKey(r,c)] = i + 1; });

  for (let r = 0; r < size; r++) {
    let row = '';
    for (let c = 0; c < size; c++) {
      const n = order[nodeKey(r,c)];
      row += String(n).padStart(3);
    }
    console.log(row);
  }
}

// ────────────────────────────────────────────────────────────
//  TEST 1: Zigzag Initial Path
// ────────────────────────────────────────────────────────────
separator('TEST 1: Zigzag Initial Path (4×4)');
const zigzag = initZigzag(4);
const v1 = validatePath(zigzag, 4);
console.log('Valid:', v1.ok ? '✅' : `❌ ${v1.reason}`);
console.log('Path:', zigzag.map(([r,c]) => `[${r},${c}]`).join('→'));

// ────────────────────────────────────────────────────────────
//  TEST 2: Single Backbite Move
// ────────────────────────────────────────────────────────────
separator('TEST 2: Single Backbite Move (4×4)');
const before = initZigzag(4);
const after  = backbiteMove([...before.map(n=>[...n])], 4);
const v2 = validatePath(after, 4);
console.log('Before:', before.map(([r,c]) => `[${r},${c}]`).join('→'));
console.log('After: ', after.map(([r,c])  => `[${r},${c}]`).join('→'));
console.log('Valid:', v2.ok ? '✅' : `❌ ${v2.reason}`);
const changed = after.some((n,i) => n[0] !== before[i][0] || n[1] !== before[i][1]);
console.log('Path changed:', changed ? '✅' : '⚠️  same (valid — no candidate found)');

// ────────────────────────────────────────────────────────────
//  TEST 3: Generate Level 5×5
// ────────────────────────────────────────────────────────────
separator('TEST 3: Generate Level 5×5');
const t3start = Date.now();
const path5 = generateLevel(5);
const t3ms = Date.now() - t3start;
const v3 = validatePath(path5, 5);
console.log('Valid:', v3.ok ? '✅' : `❌ ${v3.reason}`);
console.log(`Time: ${t3ms}ms`);
console.log('Grid (เลขคือลำดับการเดิน):');
printGrid(path5, 5);

// ────────────────────────────────────────────────────────────
//  TEST 4: Generate Level 6×6
// ────────────────────────────────────────────────────────────
separator('TEST 4: Generate Level 6×6');
const t4start = Date.now();
const path6 = generateLevel(6);
const t4ms = Date.now() - t4start;
const v4 = validatePath(path6, 6);
console.log('Valid:', v4.ok ? '✅' : `❌ ${v4.reason}`);
console.log(`Time: ${t4ms}ms`);
console.log('Grid:');
printGrid(path6, 6);

// ────────────────────────────────────────────────────────────
//  TEST 5: Deception Score — Zigzag (ควร Easy)
// ────────────────────────────────────────────────────────────
separator('TEST 5: Deception Score — Zigzag 5×5 (คาด Easy)');
const zigzag5 = initZigzag(5);
const stats5z = runSolver(5, zigzag5);
const score5z = calcScore(stats5z, 5);
console.log('Stats:  ', stats5z);
console.log('Score:  ', score5z);
console.log('Level:  ', classify(score5z));
console.log('คาดหวัง: Easy —', classify(score5z) === 'Easy' ? '✅' : '⚠️ ตรวจสอบ weight');

// ────────────────────────────────────────────────────────────
//  TEST 6: Deception Score — Random paths (compare difficulty)
// ────────────────────────────────────────────────────────────
separator('TEST 6: Deception Score — เปรียบเทียบ 10 ด่านสุ่ม (5×5)');
const results = [];
for (let i = 0; i < 10; i++) {
  const path  = generateLevel(5, 1.0);
  const stats = runSolver(5, path);
  const score = calcScore(stats, 5);
  const level = classify(score);
  results.push({ score, level, deadEnds: stats.deadEnds, branches: stats.branches });
}
results.sort((a,b) => a.score - b.score);

console.log('Score | Level  | deadEnds | branches');
console.log('------+--------+----------+---------');
results.forEach(r => {
  const lvl = r.level.padEnd(6);
  const de  = String(r.deadEnds).padStart(8);
  const br  = String(r.branches).padStart(8);
  console.log(`  ${String(r.score).padStart(3)} | ${lvl} | ${de} | ${br}`);
});

const easyCount  = results.filter(r => r.level === 'Easy').length;
const medCount   = results.filter(r => r.level === 'Medium').length;
const hardCount  = results.filter(r => r.level === 'Hard').length;
console.log(`\nDistribution: Easy=${easyCount}, Medium=${medCount}, Hard=${hardCount}`);

// ────────────────────────────────────────────────────────────
//  TEST 7: Randomness Check — endpoints ไม่ซ้ำกัน
// ────────────────────────────────────────────────────────────
separator('TEST 7: Randomness — start/end ของ 10 ด่าน (5×5)');
const endpoints = new Set();
for (let i = 0; i < 10; i++) {
  const p = generateLevel(5);
  const start = nodeKey(...p[0]);
  const end   = nodeKey(...p[p.length-1]);
  endpoints.add(`${start}→${end}`);
  console.log(`  ด่าน ${i+1}: start=${start} end=${end}`);
}
console.log(`\nUnique endpoint pairs: ${endpoints.size}/10`);
console.log(endpoints.size >= 5 ? '✅ มีความหลากหลายพอ' : '⚠️ randomness อาจไม่พอ');

console.log('\n' + '═'.repeat(55));
console.log('  ✅ ทุก test เสร็จสิ้น');
console.log('═'.repeat(55) + '\n');
