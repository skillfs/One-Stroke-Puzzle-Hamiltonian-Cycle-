# Backbite Algorithm — Pseudocode (ฉบับสมบูรณ์)

> อัปเดตล่าสุด: 2026-06-16
> เปรียบเทียบและปรับปรุงจาก: hamiltonian-snake (hand-burger), Nathan Clisby implementation

---

## ส่วนที่ 1: Helper Functions

```
FUNCTION getGridNeighbors(node, size):
  [r, c] = node
  neighbors = []
  IF r-1 >= 0    : neighbors.append([r-1, c])  // บน
  IF r+1 < size  : neighbors.append([r+1, c])  // ล่าง
  IF c-1 >= 0    : neighbors.append([r, c-1])  // ซ้าย
  IF c+1 < size  : neighbors.append([r, c+1])  // ขวา
  RETURN neighbors


FUNCTION initZigzagPath(size):
  // สร้าง Hamiltonian Path แบบ Serpentine (Zigzag) เป็น starting point
  path = []
  FOR row = 0 TO size-1:
    IF row is even:
      FOR col = 0 TO size-1:
        path.append([row, col])
    ELSE:
      FOR col = size-1 TO 0:
        path.append([row, col])
  RETURN path

// ตัวอย่างบน 4×4:
// → [0,0][0,1][0,2][0,3]
// ← [1,3][1,2][1,1][1,0]
// → [2,0][2,1][2,2][2,3]
// ← [3,3][3,2][3,1][3,0]
```

---

## ส่วนที่ 2: Backbite Move

```
FUNCTION backbiteMove(path, size):

  // --- Step 1: เลือก endpoint แบบสุ่ม ---
  IF random() < 0.5:
    PASS                      // ใช้ Head (path[0]) — ไม่ต้องทำอะไร
  ELSE:
    path = REVERSE(path)      // ใช้ Tail → กลับทิศให้ Tail กลายเป็น Head

  endpoint   = path[0]        // endpoint ที่เลือก
  nextInPath = path[1]        // node ถัดไปในเส้นทาง

  // --- Step 2: หา neighbor ที่ valid ---
  neighbors  = getGridNeighbors(endpoint, size)
  candidates = [n FOR n IN neighbors IF n != nextInPath]
  // ตัด nextInPath ออก เพราะ edge นั้นมีอยู่แล้ว

  IF candidates is empty:
    RETURN path               // ไม่มีทางเดินใหม่ → ข้ามรอบนี้ (นับเป็น fail)

  // --- Step 3: เลือก neighbor แบบสุ่ม ---
  N = randomChoice(candidates)
  k = path.indexOf(N)         // ตำแหน่งของ N ใน path

  // --- Step 4: Apply Backbite ---
  // เพิ่ม edge: endpoint → N       (สร้าง loop ใน subpath[0..k])
  // ตัด edge:  path[k-1] → path[k] (ทำลาย loop)
  // ผลลัพธ์:  กลับทิศ subpath[0..k-1] แล้วต่อกับ subpath[k..end]

  newPath = REVERSE(path[0 .. k-1]) + path[k .. last]
  RETURN newPath
```

### ภาพประกอบ Backbite Move:
```
ก่อน:  [A - B - C - D - E - F - G]
        ↑ endpoint=A   ↑ N=D (k=3)

ทำ:    REVERSE(A,B,C) + [D,E,F,G]
     = [C, B, A, D, E, F, G]

หลัง:  [C - B - A - D - E - F - G]
        ↑ head ใหม่           ↑ tail เดิม (ไม่เปลี่ยน)
```

---

## ส่วนที่ 3: Generate Level (Full Pipeline)

```
FUNCTION generateLevel(size, qualityFactor = 1.0):

  // --- Phase 0: สร้าง path ตั้งต้น ---
  path = initZigzagPath(size)

  // --- คำนวณ target iterations ---
  // สูตรจาก Clisby / hamiltonian-snake research:
  targetMoves = floor(qualityFactor * 10.0 * size² * log(size + 2)²)
  // ตัวอย่าง: size=5 → 10 * 25 * log(7)² ≈ 10 * 25 * 3.77 ≈ 943 moves
  // ตัวอย่าง: size=6 → 10 * 36 * log(8)² ≈ 10 * 36 * 4.16 ≈ 1498 moves

  // --- Phase 1: Randomize จนได้ targetMoves ที่สำเร็จ ---
  successCount = 0
  WHILE successCount < targetMoves:
    newPath = backbiteMove(path, size)
    IF newPath != path:
      successCount++          // นับเฉพาะ move ที่ path เปลี่ยนจริง
    path = newPath

  // --- Phase 2: รัน iterations เพิ่มอีก targetMoves ครั้ง (unbiased) ---
  // เพื่อให้ Markov Chain เข้าสู่ stationary distribution
  FOR i = 1 TO targetMoves:
    path = backbiteMove(path, size)

  RETURN path   // Hamiltonian Path ที่ random และ unbiased แล้ว


FUNCTION buildGrid(size, solution):
  grid = new Cell[size][size]
  FOR each [r, c] IN solution:
    grid[r][c] = { row: r, col: c, visited: false }
  grid.solution = solution
  RETURN grid
```

---

## ส่วนที่ 4: Complexity Analysis

| ขั้นตอน | Time Complexity |
|---|---|
| initZigzagPath | O(N²) |
| backbiteMove (1 ครั้ง) | O(N²) — indexOf scan |
| generateLevel Phase 1+2 | O(N² × targetMoves) |
| targetMoves (size=5) | ~943 |
| targetMoves (size=6) | ~1,498 |
| รวมบน 6×6 | ~1,498 × 36 ≈ 53,928 ops — เร็วมาก (<1ms) |

---

## เปรียบเทียบกับ Implementation จริง

| ประเด็น | Pseudocode เดิม | ปรับหลังเทียบโค้ด | hamiltonian-snake (จริง) |
|---|---|---|---|
| Data Structure | `[row,col][]` | `[row,col][]` ✅ | `[x,y][]` |
| Initial Path | Zigzag | Zigzag ✅ | Serpentine |
| เลือก endpoint | สุ่ม 50/50 | สุ่ม 50/50 ✅ | สุ่ม 50/50 |
| Reverse subpath | ✅ | ✅ | ✅ |
| iterations formula | `size² × 10` | `10 × size² × log²(size+2)` ✅ | `q × 10 × n² × log²(n+2)` |
| 2-Phase generation | ❌ | ✅ | ✅ |
| Acceptance probability | ❌ | ระบุข้อจำกัด* | ✅ (full) |

*หมายเหตุ: Acceptance probability ที่ปรับตามตำแหน่ง endpoint (corner/edge/center)
ถูก simplify ออกสำหรับ Grid ขนาดเล็ก (5×5, 6×6) ของโปรเจกต์นี้
และระบุเป็น limitation ในเล่มวิทยานิพนธ์

---

## References

- Oberdorf, R., Ferguson, A., Jacobsen, J. L., Kondev, J. (2006). *Secondary structures in long compact polymers.* Phys. Rev. E 74, 051801.
- Clisby, N. Hamiltonian Path Generator. https://clisby.net/projects/hamiltonian_path/
- hand-burger. Hamiltonian Snake. https://github.com/hand-burger/hamiltonian-snake
