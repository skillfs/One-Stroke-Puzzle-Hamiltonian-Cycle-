# Design Decisions Log

บันทึกการตัดสินใจในการออกแบบระบบ เรียงตามลำดับเวลา

---

## [2026-06-16] Data Structure — 2D Array ✅ APPROVED

**การตัดสินใจ:** ใช้ **2D Array (Cell[][])** เป็น primary data structure สำหรับ Grid

**เหตุผลที่เลือก:**
- Grid ขนาดเล็ก (5×5 = 25 nodes, 6×6 = 36 nodes) ไม่มี memory issue
- Grid Graph มีลักษณะ Sparse — แต่ละ node มี neighbor สูงสุด 4 ตัว → Adjacency Matrix สิ้นเปลือง
- PCG research รองรับ: tile-based puzzle ใช้ 2D Array เป็นมาตรฐาน
- Backtracking algorithm ทำงานกับ 2D coordinate ได้ตรงโดยไม่ต้องแปลง

**โครงสร้างที่ตกลง (TypeScript):**
```typescript
type Cell = {
  row: number;
  col: number;
  visited: boolean;
}

type Grid = {
  size: number;
  cells: Cell[][];
  solution: [number, number][];
}

type DifficultyResult = {
  score: number;
  deadEnds: number;
  branches: number;
  level: 'Easy' | 'Medium' | 'Hard';
}
```

**ที่มาอ้างอิง:**
- Procedural Puzzle Generation: A Survey (ResearchGate)
- Graph and Its Representations — GeeksforGeeks
- Backtracking Algorithm for Hamiltonian Path Search (Academia.edu)

**สถานะ:** ✅ ผู้วิจัยอนุมัติแล้ว

---

---

## [2026-06-16] Backbite Algorithm — Pseudocode ✅ APPROVED (ปรับแล้ว)

**การตัดสินใจ:** ใช้ Backbite Algorithm ตาม Clisby / hamiltonian-snake implementation

**สิ่งที่ปรับหลังเทียบโค้ดจริง:**
- iterations formula: `size² × 10` → `10 × size² × log²(size+2)`
- เพิ่ม 2-Phase generation (Phase 1: randomize, Phase 2: unbiased)
- ระบุ Acceptance Probability เป็น known limitation สำหรับ Grid เล็ก

**ที่เก็บ pseudocode:** `pseudocode/backbite_algorithm.md`

**References:**
- Oberdorf et al. (2006) — paper ต้นกำเนิด Backbite
- https://clisby.net/projects/hamiltonian_path/
- https://github.com/hand-burger/hamiltonian-snake

**สถานะ:** ✅ ผู้วิจัยอนุมัติแล้ว

---

---

## [2026-06-16] Backtracking Solver + Deception Score ✅ APPROVED

**การตัดสินใจ:** ใช้ Backtracking Solver นับ 3 metrics → คำนวณ Deception Score 0-100

**Metrics และ Weights:**
| Metric | Weight | อ้างอิง |
|---|---|---|
| deadEnds (50%) | strongest predictor | Search Algorithm Statistics paper (2025) |
| branches (30%) | Decision Complexity | Procedural Puzzle Survey |
| nodesVisited (20%) | Search Space size | Search Algorithm Statistics paper |

**Threshold:**
- Easy: score < 30 (solver แทบไม่เจอ dead-end)
- Medium: score 30-64 (solver เจอ dead-end บ้าง)
- Hard: score ≥ 65 (solver เจอ dead-end เยอะ)

**หมายเหตุ:** threshold จะถูก calibrate หลัง User Study เดือนที่ 3

**ที่เก็บ pseudocode:** `pseudocode/backtracking_solver.md`

**สถานะ:** ✅ ผู้วิจัยอนุมัติแล้ว

---

## รายการที่รอการตัดสินใจ

- [x] Data Structure — 2D Array ✅
- [x] Backbite Algorithm pseudocode ✅
- [x] Backtracking Solver + Deception Score ✅
- [x] Deception Score threshold ✅
- [ ] Phaser 3 Scene Structure — วิธีแบ่ง Scene และ Module
- [ ] Backend สำหรับเก็บ log — Firebase vs Google Form vs local JSON

