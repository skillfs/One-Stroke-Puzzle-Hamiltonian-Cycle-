export interface Level {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  start: [number, number];      // จุดเริ่มต้นเท่านั้น — จบที่ไหนก็ได้ถ้าครบทุกช่อง
  solution: [number, number][]; // optimal path (สำหรับคำนวณ stars)
}

// Hard-coded level 1 — 5x5 serpentine path
// เริ่มซ้ายบน ลากครบ 25 ช่อง (จบที่ไหนก็ได้)
const EASY_1: Level = {
  id: 1,
  difficulty: 'easy',
  gridSize: 5,
  start: [0, 0],
  solution: [
    [0,0],[0,1],[0,2],[0,3],[0,4],
    [1,4],[1,3],[1,2],[1,1],[1,0],
    [2,0],[2,1],[2,2],[2,3],[2,4],
    [3,4],[3,3],[3,2],[3,1],[3,0],
    [4,0],[4,1],[4,2],[4,3],[4,4],
  ],
};

export const CAMPAIGN_LEVELS: Record<Level['difficulty'], Level[]> = {
  easy:   [EASY_1],
  medium: [],
  hard:   [],
};
