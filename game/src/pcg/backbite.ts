// ====================================================
//  Backbite Algorithm — Hamiltonian Path Generator
//  อ้างอิง: pseudocode/backbite_algorithm.md
//  (Oberdorf et al. 2006, Clisby, hamiltonian-snake)
// ====================================================

export type Cell = [number, number];
export type Path = Cell[];

// predicate: ช่อง (r,c) เป็นช่องที่เดินได้ไหม (false = obstacle)
// ถ้าไม่ส่ง = กระดานเต็ม (ทุกช่องเดินได้)
export type IsFree = (r: number, c: number) => boolean;

const key = (r: number, c: number) => r * 10000 + c; // unique key สำหรับ grid < 10000

// ---- Helper: เพื่อนบ้าน 4 ทิศ (กรอง obstacle + ขอบ) ----
export function getGridNeighbors(
  node: Cell, size: number, isFree?: IsFree
): Cell[] {
  const [r, c] = node;
  const out: Cell[] = [];
  const ok = (rr: number, cc: number) =>
    rr >= 0 && rr < size && cc >= 0 && cc < size && (!isFree || isFree(rr, cc));
  if (ok(r - 1, c)) out.push([r - 1, c]); // บน
  if (ok(r + 1, c)) out.push([r + 1, c]); // ล่าง
  if (ok(r, c - 1)) out.push([r, c - 1]); // ซ้าย
  if (ok(r, c + 1)) out.push([r, c + 1]); // ขวา
  return out;
}

// ---- สร้าง path ตั้งต้นแบบ Serpentine (เฉพาะกระดานเต็ม) ----
export function initZigzagPath(size: number): Path {
  const path: Path = [];
  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < size; col++) path.push([row, col]);
    } else {
      for (let col = size - 1; col >= 0; col--) path.push([row, col]);
    }
  }
  return path;
}

// ---- Backbite move 1 ครั้ง ----
// คืน path ใหม่ (อาจเท่าเดิมถ้า move ล้มเหลว)
export function backbiteMove(
  path: Path, size: number, rng: () => number = Math.random, isFree?: IsFree
): Path {
  // Step 1: เลือก endpoint สุ่ม 50/50 (head หรือ tail)
  let p = path;
  if (rng() < 0.5) {
    p = path.slice().reverse();
  }

  const endpoint = p[0];
  const nextInPath = p[1];

  // Step 2: หา neighbor ที่ valid (ตัด edge ที่มีอยู่แล้วออก)
  const neighbors = getGridNeighbors(endpoint, size, isFree);
  const candidates = neighbors.filter(
    n => !(n[0] === nextInPath[0] && n[1] === nextInPath[1])
  );
  if (candidates.length === 0) return path; // fail → ข้ามรอบนี้

  // Step 3: เลือก neighbor สุ่ม
  const N = candidates[Math.floor(rng() * candidates.length)];
  const k = p.findIndex(([r, c]) => r === N[0] && c === N[1]);
  if (k < 0) return path; // ไม่ควรเกิด

  // Step 4: REVERSE(p[0..k-1]) + p[k..end]
  const head = p.slice(0, k).reverse();
  const tail = p.slice(k);
  return head.concat(tail);
}

// ---- Generate Hamiltonian path (full pipeline) ----
export function generateLevel(
  size: number,
  qualityFactor = 1.0,
  rng: () => number = Math.random,
  isFree?: IsFree,
  initialPath?: Path,
): Path {
  // Phase 0: path ตั้งต้น (กระดานเต็มใช้ zigzag, มี obstacle ต้องส่ง initialPath มา)
  let path = initialPath ? initialPath.slice() : initZigzagPath(size);

  const targetMoves = Math.floor(
    qualityFactor * 10.0 * size * size * Math.pow(Math.log(size + 2), 2)
  );

  // Phase 1: randomize จนได้ targetMoves ที่ "สำเร็จ" (path เปลี่ยนจริง)
  let success = 0;
  let guard = 0;
  const guardMax = targetMoves * 50 + 1000; // กัน loop ไม่รู้จบ
  while (success < targetMoves && guard++ < guardMax) {
    const next = backbiteMove(path, size, rng, isFree);
    if (!samePath(next, path)) success++;
    path = next;
  }

  // Phase 2: unbiased pass — รันเพิ่มอีก targetMoves ครั้งให้เข้า stationary distribution
  for (let i = 0; i < targetMoves; i++) {
    path = backbiteMove(path, size, rng, isFree);
  }

  return path;
}

function samePath(a: Path, b: Path): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
}

// ---- ตรวจสอบความถูกต้องของ path (ใช้ใน test) ----
export function validatePath(path: Path, size: number, freeCount?: number): {
  ok: boolean; reason?: string;
} {
  const expected = freeCount ?? size * size;
  if (path.length !== expected) {
    return { ok: false, reason: `length ${path.length} != ${expected}` };
  }
  const seen = new Set<number>();
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i];
    const id = key(r, c);
    if (seen.has(id)) return { ok: false, reason: `ซ้ำที่ ${r},${c}` };
    seen.add(id);
    if (i > 0) {
      const [pr, pc] = path[i - 1];
      if (Math.abs(r - pr) + Math.abs(c - pc) !== 1) {
        return { ok: false, reason: `ก้าว ${i} ไม่ติดกัน` };
      }
    }
  }
  return { ok: true };
}
