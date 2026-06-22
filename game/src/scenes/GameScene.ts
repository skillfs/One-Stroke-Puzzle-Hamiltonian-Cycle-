import Phaser from 'phaser';
import { CELL, COLORS, GAME, SCORING } from '../config/GameConfig';
import { CAMPAIGN_LEVELS } from '../levels/campaignLevels';
import type { Level } from '../levels/campaignLevels';

// ---- Types ----
interface GameData {
  mode: 'campaign' | 'endless';
  difficulty?: 'easy' | 'medium' | 'hard';
  levelIndex?: number;
}

export class GameScene extends Phaser.Scene {
  private gameData!: GameData;
  private level!: Level;
  private gridN = 5;
  private grid: (Phaser.GameObjects.Rectangle | null)[][] = [];
  private path: [number, number][] = [];
  private isDragging = false;
  private score = 0;
  private streak = 0;
  private usedHint = false;

  // UI refs
  private moveText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() { super('Game'); }

  init(data: GameData) {
    this.gameData = data;
    this.usedHint = false;
    this.path = [];

    if (data.mode === 'campaign') {
      const diff = data.difficulty ?? 'easy';
      const idx = data.levelIndex ?? 0;
      this.level = CAMPAIGN_LEVELS[diff][idx];
    } else {
      // TODO: Backbite PCG — ตอนนี้ใช้ easy level ชั่วคราว
      this.level = CAMPAIGN_LEVELS['easy'][0];
    }

    // guard: ถ้าไม่มี level data ให้กลับไปหน้าเลือกด่านแทนจอดำ
    if (!this.level) {
      console.warn('[GameScene] ไม่มีข้อมูลด่าน', data);
      this.scene.start(data.mode === 'endless' ? 'MainMenu' : 'LevelSelect');
      return;
    }
    this.gridN = this.level.gridSize;
  }

  create() {
    if (!this.level) return; // ถูก redirect ไปแล้วใน init
    this.drawBackground();
    this.drawTopBar();
    this.drawGrid();
    this.setupInput();
  }

  // ---- UI ----

  private drawBackground() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
  }

  private drawTopBar() {
    const isEndless = this.gameData.mode === 'endless';
    const cx = GAME.width / 2;

    // Back button
    const back = this.add.text(20, 30, '← Back', {
      fontSize: '16px', color: '#888888',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => {
      this.scene.start(isEndless ? 'MainMenu' : 'LevelSelect');
    });

    // Title
    const title = isEndless
      ? `Level ${this.streak + 1}`
      : `${this.gameData.difficulty} ${(this.gameData.levelIndex ?? 0) + 1}`;
    this.add.text(cx, 30, title, {
      fontSize: '16px', color: '#7F77DD',
    }).setOrigin(0.5);

    // Reset
    const reset = this.add.text(GAME.width - 20, 30, '↺ Reset', {
      fontSize: '16px', color: '#888888',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    reset.on('pointerdown', () => this.resetLevel());

    // Score / Moves display
    if (isEndless) {
      this.scoreText = this.add.text(cx, 60, `Score: ${this.score}`, {
        fontSize: '20px', color: '#EF9F27', fontStyle: 'bold',
      }).setOrigin(0.5);
    } else {
      this.moveText = this.add.text(cx, 60, `0 / ${this.gridN * this.gridN}`, {
        fontSize: '16px', color: '#888888',
      }).setOrigin(0.5);
    }
  }

  // ---- Grid ----

  private drawGrid() {
    const n = this.gridN;
    const maxSize = Math.min(GAME.width, GAME.height - 160) - 40;
    const cellSize = Math.floor((maxSize - CELL.gap * (n + 1)) / n);
    const totalW = n * cellSize + CELL.gap * (n + 1);
    const startX = (GAME.width - totalW) / 2 + CELL.gap;
    const startY = 100;

    this.grid = Array.from({ length: n }, () => Array(n).fill(null));

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const x = startX + c * (cellSize + CELL.gap) + cellSize / 2;
        const y = startY + r * (cellSize + CELL.gap) + cellSize / 2;

        const rect = this.add.rectangle(x, y, cellSize, cellSize, COLORS.empty)
          .setInteractive();

        // Store position in data for hit-testing
        rect.setData({ r, c, cx: x, cy: y, size: cellSize });
        this.grid[r][c] = rect;
      }
    }

    // ระบายสีจุดเริ่มต้นตายตัว (สีส้ม) ให้ผู้เล่นเห็นว่าต้องเริ่มตรงไหน
    this.redrawPath();
  }

  // ---- Input ----

  private setupInput() {
    // กด/แตะ: เริ่มที่จุดเริ่ม หรือต่อช่องที่ติดกับช่องล่าสุด (ทีละช่องก็ได้)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const cell = this.getCellAt(p.x, p.y);
      if (!cell) return;
      this.isDragging = true;
      this.tryExtend(cell[0], cell[1]);
    });

    // ลาก: ต่อช่องระหว่างลากเมาส์/นิ้ว
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      const cell = this.getCellAt(p.x, p.y);
      if (!cell) return;
      this.tryExtend(cell[0], cell[1]);
    });

    this.input.on('pointerup', () => { this.isDragging = false; });
  }

  // ต่อ path ไปยังช่อง (r,c) — ใช้ได้ทั้งการแตะทีละช่องและการลาก
  private tryExtend(r: number, c: number) {
    const [sr, sc] = this.level.start;

    // ยังไม่เริ่ม: path ต้องเริ่มที่จุดเริ่มต้นตายตัวเสมอ
    if (this.path.length === 0) {
      if (r === sr && c === sc) {
        // กดที่จุดเริ่มต้น
        this.path = [[sr, sc]];
      } else if (Math.abs(r - sr) + Math.abs(c - sc) === 1) {
        // กดช่องที่ติดกับจุดเริ่ม → ต่อจากจุดเริ่มให้อัตโนมัติ
        this.path = [[sr, sc], [r, c]];
      } else {
        return; // ช่องอื่นที่ไม่ติดจุดเริ่ม → ยังเริ่มไม่ได้
      }
      this.updateCounter();
      this.redrawPath();
      return;
    }

    const last = this.path[this.path.length - 1];
    if (last[0] === r && last[1] === c) return; // ช่องเดิม

    // ถอยหลัง: แตะ/ลากกลับช่องก่อนหน้า
    const prev = this.path[this.path.length - 2];
    if (prev && prev[0] === r && prev[1] === c) {
      this.path.pop();
      this.updateCounter();
      this.redrawPath();
      return;
    }

    // ต้องติดกับช่องล่าสุด และยังไม่เคยเดินผ่าน
    const dr = Math.abs(r - last[0]), dc = Math.abs(c - last[1]);
    if (dr + dc !== 1) return;
    if (this.path.some(([pr, pc]) => pr === r && pc === c)) return;

    this.path.push([r, c]);
    this.updateCounter();
    this.redrawPath();

    // ชนะเมื่อครบทุกช่อง (จบที่ไหนก็ได้)
    if (this.path.length === this.gridN * this.gridN) {
      this.isDragging = false;
      this.time.delayedCall(200, () => this.onWin());
    }
  }

  // ตัวนับช่องที่เดินแล้ว (รวมช่องเริ่ม)
  private updateCounter() {
    this.moveText?.setText(`${this.path.length} / ${this.gridN * this.gridN}`);
  }

  private getCellAt(px: number, py: number): [number, number] | null {
    for (let r = 0; r < this.gridN; r++) {
      for (let c = 0; c < this.gridN; c++) {
        const rect = this.grid[r][c];
        if (!rect) continue;
        const cx = rect.getData('cx');
        const cy = rect.getData('cy');
        const size = rect.getData('size');
        const half = size / 2;
        if (px >= cx - half && px <= cx + half && py >= cy - half && py <= cy + half) {
          return [r, c];
        }
      }
    }
    return null;
  }

  private redrawPath() {
    // จุดเริ่มต้นตายตัว = สีส้ม (แสดงตลอด), ช่องในเส้นทาง = สีม่วง
    const [sr, sc] = this.level.start;
    const pathSet = new Set(this.path.map(([r, c]) => `${r},${c}`));
    for (let r = 0; r < this.gridN; r++) {
      for (let c = 0; c < this.gridN; c++) {
        const isStart = r === sr && c === sc;
        const inPath = pathSet.has(`${r},${c}`);
        const color = isStart ? COLORS.endpoint : inPath ? COLORS.primary : COLORS.empty;
        this.grid[r][c]?.setFillStyle(color);
      }
    }
  }

  private resetLevel() {
    this.path = [];
    this.usedHint = false;
    this.updateCounter();
    this.redrawPath();
  }

  // ---- Win ----

  private onWin() {
    if (this.gameData.mode === 'campaign') {
      const d = this.gameData.difficulty!;
      const n = (this.gameData.levelIndex ?? 0) + 1;
      localStorage.setItem(`${d}_${n}_cleared`, '1');

      this.scene.start('Result', {
        difficulty: d,
        levelIndex: this.gameData.levelIndex,
      });
    } else {
      // Endless: compute score and load next
      const s = this.calcEndlessScore();
      this.score += s;
      this.streak++;
      this.scoreText.setText(`Score: ${this.score}`);

      // Update best
      const best = parseInt(localStorage.getItem('endlessBest') ?? '0');
      if (this.score > best) localStorage.setItem('endlessBest', `${this.score}`);

      // TODO: generate next level with Backbite PCG
      this.time.delayedCall(500, () => {
        this.scene.restart({ mode: 'endless' });
      });
    }
  }

  private calcEndlessScore(): number {
    const optimal = this.gridN * this.gridN;
    let s = SCORING.basePerLevel;
    if (this.path.length <= optimal) s += SCORING.efficiencyBonus;
    if (!this.usedHint) s = Math.round(s * SCORING.noHintMultiplier);
    s += this.streak * SCORING.streakBonus;
    return s;
  }
}
