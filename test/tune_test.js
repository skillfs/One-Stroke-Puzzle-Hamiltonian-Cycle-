// ============================================================
// Tuning Test — ทดสอบ config ต่าง ๆ แล้วเปรียบเทียบ distribution
// ตัวแปรที่ปรับ:
//   1. weights (deadEnd / branch / nodes)
//   2. threshold (Easy/Medium/Hard cutoff)
//   3. qualityFactor (ความ random ของ Backbite)
//   4. startNode ของ Solver (ตรง vs ไม่ตรง solution)
// ============================================================

// ── Core (เหมือน algorithm_test.js) ──────────────────────────
function getNeighbors(row, col, size) {
  return [[-1,0],[1,0],[0,-1],[0,1]]
    .map(([dr,dc]) => [row+dr, col+dc])
    .filter(([r,c]) => r>=0 && r<size && c>=0 && c<size);
}
function nodeKey(r,c) { return `${r},${c}`; }

function initZigzag(size) {
  const path = [];
  for (let r = 0; r < size; r++) {
    if (r%2===0) for (let c=0;c<size;c++) path.push([r,c]);
    else         for (let c=size-1;c>=0;c--) path.push([r,c]);
  }
  return path;
}

function backbiteMove(path, size) {
  let p = path.map(n=>[...n]);
  if (Math.random() < 0.5) p = p.reverse();
  const endpoint = p[0], next = p[1];
  const candidates = getNeighbors(endpoint[0],endpoint[1],size)
    .filter(([r,c]) => !(r===next[0]&&c===next[1]));
  if (!candidates.length) return p;
  const N = candidates[Math.floor(Math.random()*candidates.length)];
  const k = p.findIndex(([r,c]) => r===N[0]&&c===N[1]);
  return [...p.slice(0,k).reverse(), ...p.slice(k)];
}

function generateLevel(size, qualityFactor=1.0) {
  let path = initZigzag(size);
  const target = Math.floor(qualityFactor * 10 * size*size * Math.log(size+2)**2);
  let success=0, attempts=0;
  while (success<target && attempts<target*10) {
    const np = backbiteMove(path, size);
    if (np.some((n,i)=>n[0]!==path[i][0]||n[1]!==path[i][1])) success++;
    path=np; attempts++;
  }
  for (let i=0;i<target;i++) path=backbiteMove(path,size);
  return path;
}

function runSolver(size, solution, startFromSolution=true) {
  const stats = {deadEnds:0, branches:0, nodesVisited:0};
  const valid = new Set(solution.map(([r,c])=>nodeKey(r,c)));
  const visited = new Set();

  function solve(r,c,count) {
    if (count===size*size) return true;
    const nb = getNeighbors(r,c,size)
      .filter(([nr,nc])=>valid.has(nodeKey(nr,nc))&&!visited.has(nodeKey(nr,nc)));
    if (!nb.length) { stats.deadEnds++; return false; }
    if (nb.length>=2) stats.branches++;
    for (const [nr,nc] of nb) {
      visited.add(nodeKey(nr,nc)); stats.nodesVisited++;
      if (solve(nr,nc,count+1)) return true;
      visited.delete(nodeKey(nr,nc));
    }
    return false;
  }

  // startFromSolution=true → เริ่มจาก node แรกของ solution (ง่ายกว่า)
  // startFromSolution=false → เริ่มจาก [0,0] เสมอ (ยากกว่าถ้า solution ไม่เริ่มตรงนั้น)
  const [sr,sc] = startFromSolution ? solution[0] : [0,0];
  visited.add(nodeKey(sr,sc));
  solve(sr,sc,1);
  return stats;
}

function calcScore(stats, size, w={dead:0.5, branch:0.3, nodes:0.2}) {
  const N = size*size;
  const d = Math.min(stats.deadEnds    / (N*2), 1.0);
  const b = Math.min(stats.branches    / N,     1.0);
  const n = Math.min(stats.nodesVisited/(N*N),  1.0);
  return Math.round((d*w.dead + b*w.branch + n*w.nodes)*100);
}

function classify(score, t={easy:30, hard:65}) {
  if (score < t.easy) return 'Easy';
  if (score < t.hard) return 'Medium';
  return 'Hard';
}

// ── Run N levels และคืน distribution ────────────────────────
function runBatch(label, size, n, qualityFactor, weights, thresholds, startFromSol) {
  const dist = {Easy:0, Medium:0, Hard:0};
  const scores = [];
  for (let i=0;i<n;i++) {
    const path  = generateLevel(size, qualityFactor);
    const stats = runSolver(size, path, startFromSol);
    const score = calcScore(stats, size, weights);
    const level = classify(score, thresholds);
    dist[level]++;
    scores.push(score);
  }
  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/n);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  return {label, dist, avg, min, max};
}

// ── Print Table ──────────────────────────────────────────────
function printResult(r) {
  const {label,dist,avg,min,max} = r;
  const total = dist.Easy+dist.Medium+dist.Hard;
  const pct = v => `${v}(${Math.round(v/total*100)}%)`;
  console.log(
    label.padEnd(32),
    `E:${pct(dist.Easy).padEnd(9)}`,
    `M:${pct(dist.Medium).padEnd(9)}`,
    `H:${pct(dist.Hard).padEnd(9)}`,
    `avg=${avg} min=${min} max=${max}`
  );
}

// ============================================================
//  EXPERIMENT A — ปรับ qualityFactor (ความ random ของ Backbite)
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT A: qualityFactor  (size=5, n=30, weights=default, threshold=default)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
const wDefault = {dead:0.5, branch:0.3, nodes:0.2};
const tDefault = {easy:30, hard:65};
[0.5, 1.0, 2.0, 4.0].forEach(q => {
  const r = runBatch(`qualityFactor=${q}`, 5, 30, q, wDefault, tDefault, true);
  printResult(r);
});

// ============================================================
//  EXPERIMENT B — ปรับ Weights
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT B: weights  (size=5, n=30, qFactor=1.0, threshold=default)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
[
  {label:'dead=0.50 branch=0.30 nodes=0.20', w:{dead:0.50,branch:0.30,nodes:0.20}},
  {label:'dead=0.60 branch=0.30 nodes=0.10', w:{dead:0.60,branch:0.30,nodes:0.10}},
  {label:'dead=0.40 branch=0.50 nodes=0.10', w:{dead:0.40,branch:0.50,nodes:0.10}},
  {label:'dead=0.70 branch=0.20 nodes=0.10', w:{dead:0.70,branch:0.20,nodes:0.10}},
  {label:'dead=0.33 branch=0.33 nodes=0.34', w:{dead:0.33,branch:0.33,nodes:0.34}},
].forEach(({label,w}) => {
  const r = runBatch(label, 5, 30, 1.0, w, tDefault, true);
  printResult(r);
});

// ============================================================
//  EXPERIMENT C — ปรับ Threshold
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT C: threshold  (size=5, n=30, qFactor=1.0, weights=default)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
[
  {label:'easy<30 hard<65 (default)',  t:{easy:30,hard:65}},
  {label:'easy<20 hard<50',            t:{easy:20,hard:50}},
  {label:'easy<40 hard<70',            t:{easy:40,hard:70}},
  {label:'easy<15 hard<40',            t:{easy:15,hard:40}},
].forEach(({label,t}) => {
  const r = runBatch(label, 5, 30, 1.0, wDefault, t, true);
  printResult(r);
});

// ============================================================
//  EXPERIMENT D — startNode: ตรง solution vs [0,0]
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT D: startNode of Solver  (size=5, n=30, qFactor=1.0, default)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
[
  {label:'start=solution[0] (easy)',  s:true},
  {label:'start=[0,0] always (hard)', s:false},
].forEach(({label,s}) => {
  const r = runBatch(label, 5, 30, 1.0, wDefault, tDefault, s);
  printResult(r);
});

// ============================================================
//  EXPERIMENT E — ขนาด Grid (5×5 vs 6×6)
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT E: Grid size  (n=30, qFactor=1.0, weights=default, threshold=default)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
[5,6].forEach(size => {
  const r = runBatch(`size=${size}×${size}`, size, 30, 1.0, wDefault, tDefault, true);
  printResult(r);
});

// ============================================================
//  EXPERIMENT F — Best Config ที่คิดว่าดีที่สุด (รัน 50 ด่าน)
// ============================================================
console.log('\n' + '═'.repeat(90));
console.log('  EXPERIMENT F: Best Config Candidate (n=50 ด่าน)');
console.log('═'.repeat(90));
console.log('Config'.padEnd(32), 'Easy'.padEnd(13), 'Medium'.padEnd(13), 'Hard'.padEnd(13), 'Score stats');
console.log('-'.repeat(90));
// เป้าหมาย: Easy≈33%, Medium≈34%, Hard≈33%
const candidates = [
  {label:'qF=2.0 dead=0.60 t:15/40 s=true',  q:2.0, w:{dead:0.60,branch:0.30,nodes:0.10}, t:{easy:15,hard:40}, s:true},
  {label:'qF=2.0 dead=0.70 t:20/50 s=false',  q:2.0, w:{dead:0.70,branch:0.20,nodes:0.10}, t:{easy:20,hard:50}, s:false},
  {label:'qF=4.0 dead=0.50 t:30/65 s=false',  q:4.0, w:{dead:0.50,branch:0.30,nodes:0.20}, t:{easy:30,hard:65}, s:false},
  {label:'qF=1.0 equal t:15/40 s=false',      q:1.0, w:{dead:0.33,branch:0.33,nodes:0.34}, t:{easy:15,hard:40}, s:false},
];
candidates.forEach(({label,q,w,t,s}) => {
  const r = runBatch(label, 5, 50, q, w, t, s);
  printResult(r);
});

console.log('\n' + '═'.repeat(90));
console.log('  ✅ ทุก Experiment เสร็จสิ้น');
console.log('═'.repeat(90) + '\n');
