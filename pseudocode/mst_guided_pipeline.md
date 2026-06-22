# MST-Guided Hamiltonian Path — Pseudocode

> วันที่: 2026-06-22
> เป้าหมาย: สร้างด่าน Hamiltonian Path ที่ (1) ไม่เป็น blob (2) มีช่องว่างกระจาย (3) มี trap (articulation) ได้ — โดยการันตี solvable เสมอ

---

## แนวคิดหลัก

```
Full N×M Grid
   │
   ▼ ยุบครึ่ง (coarse)
Coarse Grid (N/2 × M/2)
   │
   ▼ สุ่ม Spanning Tree แบบ "ไม่ครบ" (Partial)
Partial Spanning Tree  ──── coarse cell ที่ไม่ถูกครอบ = SPACE
   │
   ▼ Wall-Following (เดินเลียบรอบต้นไม้)
Hamiltonian Path บน Fine Grid (เฉพาะส่วนที่ถูกครอบ)
   │
   ▼ วัด
Trap Score / Articulation Points
```

หัวใจ: ทุกขั้นตอนรักษาคุณสมบัติ "เส้นเดียว degree ≤ 2" ไว้เสมอ — ไม่มีการแตกกิ่งบน path
trap เกิดจาก "รูปทรงของ space ที่สร้างคอขวด" เท่านั้น

---

## ส่วนที่ 1: ยุบ Grid เป็น Coarse Grid

```
// Fine grid ต้องเป็นเลขคู่ทั้งกว้างและสูง (เพราะยุบครึ่งพอดี)
FUNCTION toCoarse(fineSize):
  RETURN floor(fineSize / 2)

// แต่ละ coarse cell (cr, cc) ครอบ fine cell 2×2:
//   (2*cr,   2*cc)   (2*cr,   2*cc+1)
//   (2*cr+1, 2*cc)   (2*cr+1, 2*cc+1)
FUNCTION coarseToFineQuad(cr, cc):
  RETURN [
    [2*cr,   2*cc],
    [2*cr,   2*cc+1],
    [2*cr+1, 2*cc],
    [2*cr+1, 2*cc+1]
  ]
```

---

## ส่วนที่ 2: สร้าง Partial Spanning Tree (Randomized Prim's)

```
FUNCTION buildPartialSpanningTree(coarseW, coarseH, coveragePct):
  totalCoarseCells = coarseW * coarseH
  targetCells = floor(totalCoarseCells * coveragePct / 100)

  // เริ่มจาก coarse cell สุ่ม 1 จุด
  start = randomCell(coarseW, coarseH)
  visited = { start }
  treeEdges = []           // edge ระหว่าง coarse cell ที่อยู่ใน tree
  frontier = []            // candidate edges ที่ขยายได้ (จาก visited ไปยัง unvisited)

  addFrontierEdgesOf(start, frontier, visited)

  WHILE visited.size < targetCells AND frontier is not empty:
    // สุ่มเลือก edge จาก frontier (= Randomized Prim's)
    edge = popRandom(frontier)
    [from, to] = edge
    IF to IN visited: CONTINUE        // อาจถูกเพิ่มซ้ำ ข้ามไป

    visited.add(to)
    treeEdges.append(edge)
    addFrontierEdgesOf(to, frontier, visited)

  RETURN { visited, treeEdges }
  // coarse cell ที่ไม่อยู่ใน visited = SPACE (ช่องว่าง)


FUNCTION addFrontierEdgesOf(cell, frontier, visited):
  FOR neighbor IN getCoarseNeighbors(cell):     // บน ล่าง ซ้าย ขวา
    IF neighbor NOT IN visited:
      frontier.append([cell, neighbor])
```

**Parameter `coveragePct`** ควบคุมว่า partial tree ครอบ coarse grid กี่ %
→ ควบคุม "จำนวน space" ได้ตรงๆ (100% = เต็ม grid ไม่มี space)

---

## ส่วนที่ 3: สร้างคอขวด (Trap) ด้วยการตัดกิ่ง

```
FUNCTION pruneForTraps(treeEdges, visited, branchCutRate):
  // หา leaf node ของ tree (degree = 1 ใน tree)
  degree = computeDegree(treeEdges)

  FOR EACH cell IN visited WHERE degree[cell] == 1:
    IF random() < branchCutRate:
      // ตัด leaf ทิ้งจาก tree → กลายเป็น "ซอกตัน" ที่ wall-following
      // จะวิ่งผ่านแล้วต้องย้อนออกมา (สร้าง corridor ปลายตัน)
      // หมายเหตุ: นี่ตัดที่ COARSE level ก่อน wall-following
      //          ผลคือ fine path ยังคงเป็นเส้นเดียว (ไม่แตกกิ่ง)
      //          แต่รูปทรงจะมี "แขนยื่นแคบ" ให้เดินผิดได้
      markAsDeadEndBranch(cell)

  RETURN treeEdges, visited
```

> หมายเหตุสำคัญ: การ "ตัดกิ่ง" ในที่นี้คือการเลือกว่า**coarse cell ไหนจะรวมอยู่ใน
> tree หรือไม่** (กำหนดรูปทรงของ space) — ไม่ใช่การแตกกิ่งออกจาก path จริง
> ดังนั้น fine-grain Hamiltonian Path ที่ได้จาก wall-following ยังคงเป็น
> เส้นเดียวบริสุทธิ์เสมอ (degree ≤ 2 ทุกจุด ยกเว้น 2 ปลาย)

---

## ส่วนที่ 4: Wall-Following (เดินเลียบรอบ Tree)

นี่คือเทคนิคมาตรฐานสำหรับแปลง Spanning Tree → Hamiltonian Path/Cycle
หลักการ: เดินบน fine grid โดย "ชิดผนังด้านหนึ่ง" ของ tree เสมอ (เช่น ชิดขวา)
ทำให้เดินผ่านทุก fine cell ที่อยู่ในโควตา (quad ของ coarse cell ที่ visited) ครบรอบเดียว

```
FUNCTION wallFollow(visited, treeEdges, coarseW, coarseH):
  // เปลี่ยน edge list เป็น adjacency map เพื่อเช็คทิศที่ "เชื่อมได้" ระหว่าง
  // coarse cell สองอันที่อยู่ติดกัน (เดินทะลุ "กำแพง" ได้เฉพาะตรงที่มี edge)
  adj = buildAdjacencyMap(treeEdges)

  // เริ่มที่ fine cell มุมหนึ่งของ coarse cell ราก (root)
  root = pickRootCoarseCell(visited)
  startFine = coarseToFineQuad(root)[0]

  path = []
  current = startFine
  prevDir = null

  // DFS เดินรอบต้นไม้แบบ "ชิดมือขวา" (right-hand rule)
  // อาศัยคุณสมบัติ: ต้นไม้ไม่มี cycle จึงเดินรอบได้แบบ Euler tour บน fine grid
  // (รายละเอียดการ derive ทิศจาก adjacency อยู่ในขั้น Implementation)
  REPEAT:
    path.append(current)
    nextCell = chooseNextByWallFollowing(current, prevDir, adj, visited)
    IF nextCell is null: BREAK   // เดินจนกลับมาจุดเริ่ม (ครบรอบ)
    prevDir = directionOf(current, nextCell)
    current = nextCell
  UNTIL current == startFine

  RETURN path   // Hamiltonian Path/Cycle บน fine grid (เฉพาะ coarse cell ที่ visited)
```

> Implementation note: วิธี derive ทิศทาง wall-following ที่นิยมใช้คือแปลง
> spanning tree เป็น "double-tree" แล้วสร้าง Eulerian circuit รอบมัน
> ซึ่งบน grid 2×2 ต่อ coarse-cell จะให้ Hamiltonian cycle ของ fine grid โดยอัตโนมัติ
> (เทคนิคนี้ใช้กันแพร่หลายใน AI ของเกม Snake)

---

## ส่วนที่ 5: คำนวณ Trap Score

```
FUNCTION computeTrapScore(path, playableSet):
  pathIndex = buildIndexMap(path)     // key(r,c) → index บน path
  score = 0
  decisionPoints = findDecisionPoints(path, playableSet)  // node ที่มี ≥3 ทาง

  FOR EACH dp IN decisionPoints:
    correctNext = path[ pathIndex[dp] + 1 ]   // ทิศที่ "ถูก" ตาม solution

    FOR EACH neighbor IN getNeighbors(dp, playableSet):
      IF neighbor == correctNext: CONTINUE    // ข้ามทิศที่ถูก

      // เดินหลอกไปทาง neighbor แล้ววัดความลึกก่อนตัน
      depth = exploreTrapDepth(neighbor, dp, playableSet, pathIndex)
      score += depth

  RETURN score


FUNCTION exploreTrapDepth(start, cameFrom, playableSet, pathIndex):
  // BFS/DFS จากจุดที่เดินผิด นับว่าเข้าไปได้กี่ช่องก่อนตัน
  // (ตันแปลว่า: ไม่มีทางต่อที่ไม่ใช่ cameFrom และไม่กลับไป solution path ได้)
  depth = 0
  current = start
  prev = cameFrom

  WHILE true:
    neighbors = getNeighbors(current, playableSet) MINUS prev
    IF neighbors is empty: RETURN depth + 1      // ตันจริง
    IF neighbors.length > 1: RETURN depth + 1     // แยกอีก ถือว่า "หลุดออกจาก trap เดี่ยว"
    depth += 1
    prev = current
    current = neighbors[0]
    IF depth > playableSet.size: RETURN depth     // safety guard
```

**ตีความ Trap Score:**
- depth ต่ำ (1-2) = trap ตื้น ผู้เล่นรู้ตัวเร็ว → ง่าย
- depth สูง (5+) = trap ลึก ผู้เล่นเสียเวลานานก่อนรู้ตัว → ยาก/ลวงดี
- Trap Score รวม = Σ depth ของทุก decision point × ทุกทางที่ผิด

---

## ส่วนที่ 6: Pipeline เต็ม

```
FUNCTION generateMSTGuidedLevel(fineW, fineH, coveragePct, branchCutRate):
  coarseW = toCoarse(fineW)
  coarseH = toCoarse(fineH)

  { visited, treeEdges } = buildPartialSpanningTree(coarseW, coarseH, coveragePct)
  { treeEdges, visited } = pruneForTraps(treeEdges, visited, branchCutRate)

  path = wallFollow(visited, treeEdges, coarseW, coarseH)

  playableSet = setOf(path)
  trapScore = computeTrapScore(path, playableSet)

  RETURN {
    path,                                    // Hamiltonian path บน fine grid
    space: allFineCells(fineW,fineH) MINUS playableSet,
    trapScore,
    coverage: playableSet.size / (fineW*fineH)
  }
```

---

## Complexity

| ขั้นตอน | Time Complexity |
|---|---|
| buildPartialSpanningTree | O(coarseCells × log coarseCells) — heap-based Prim's |
| wallFollow | O(fineCells) |
| computeTrapScore | O(decisionPoints × playableCells) worst case |
| รวม | O(N×M) ระดับเดียวกับ Backbite — เร็วมาก |

---

## ข้อแตกต่างจาก Backbite/Chain ที่ทำไปก่อนหน้า

| คุณสมบัติ | Backbite (tail-cut) | Chain | MST-Guided |
|---|---|---|---|
| Retry rate | 0% | ต้อง retry หา layout | **≈0%** (การันตีโดย tree) |
| รูปทรง space | เกาะกลุ่มปลาย (blob) | กระจายเป็นก้อนแยก | **กระจายทั่ว grid** |
| ควบคุม trap | ไม่มี (วัดเฉย ๆ) | ไม่มี | **ควบคุมตรงผ่าน branchCutRate** |
| ควบคุมปริมาณ space | Fill% ตรงๆ | ไม่ตรง (ขึ้นกับสุ่ม block) | **coveragePct ตรงๆ** |
