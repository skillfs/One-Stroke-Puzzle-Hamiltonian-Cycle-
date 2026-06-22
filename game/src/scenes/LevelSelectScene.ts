import Phaser from 'phaser';
import { COLORS, HEX, LAYOUT, LEVELS, TYPO, textStyle } from '../config/GameConfig';
import { CAMPAIGN_LEVELS } from '../levels/campaignLevels';

type Difficulty = 'easy' | 'medium' | 'hard';

export class LevelSelectScene extends Phaser.Scene {
  private difficulty: Difficulty = 'easy';

  // objects ของ level grid ที่ต้องลบทิ้งเมื่อเปลี่ยน tab (ไม่ใช้ Container เพราะ
  // input hit-testing ของ child ใน Container เป็นจุดพลาดง่ายใน Phaser)
  private gridObjects: Phaser.GameObjects.GameObject[] = [];
  private tabBgs: Phaser.GameObjects.Rectangle[] = [];

  constructor() { super('LevelSelect'); }

  create() {
    const cx = LAYOUT.centerX;

    this.add.text(cx, 40, 'เลือกด่าน', textStyle(TYPO.h1, HEX.text, true))
      .setOrigin(0.5);

    // ---- Back button ----
    const back = this.add.text(LAYOUT.safeMargin, 40, '← Back', textStyle(TYPO.label, HEX.textMuted))
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MainMenu'));
    back.on('pointerover', () => back.setAlpha(0.6));
    back.on('pointerout',  () => back.setAlpha(1));

    this.createTabs(cx);
    this.drawLevelGrid();
  }

  private createTabs(cx: number) {
    const tabs: Difficulty[] = ['easy', 'medium', 'hard'];
    const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    const { width: tabW, height: tabH, gap } = LAYOUT.tab;

    // จัดกึ่งกลาง: ความกว้างรวม 3 tab แล้วหา startX จาก center (ดู Design.md §6)
    const totalW = tabs.length * tabW + (tabs.length - 1) * gap;
    const startX = cx - totalW / 2;
    const y = 100;

    this.tabBgs = [];

    tabs.forEach((d, i) => {
      const tabCx = startX + i * (tabW + gap) + tabW / 2;
      const bg = this.add.rectangle(tabCx, y, tabW, tabH,
        d === this.difficulty ? COLORS.primary : COLORS.empty
      ).setInteractive({ useHandCursor: true });

      this.add.text(tabCx, y, labels[d], textStyle(TYPO.h3, HEX.text)).setOrigin(0.5);

      bg.on('pointerdown', () => this.selectTab(d));
      this.tabBgs.push(bg);
    });
  }

  private selectTab(d: Difficulty) {
    this.difficulty = d;
    const order: Difficulty[] = ['easy', 'medium', 'hard'];
    this.tabBgs.forEach((bg, i) => {
      bg.setFillStyle(order[i] === d ? COLORS.primary : COLORS.empty);
    });
    this.drawLevelGrid();
  }

  private drawLevelGrid() {
    // ลบ grid เดิม
    this.gridObjects.forEach(o => o.destroy());
    this.gridObjects = [];

    const total = LEVELS[this.difficulty];
    const available = CAMPAIGN_LEVELS[this.difficulty].length;
    const { size: cell, gap, cols } = LAYOUT.levelCell;
    const startY = 170;
    const cx = LAYOUT.centerX;
    const gridW = cols * cell + (cols - 1) * gap;
    const offsetX = cx - gridW / 2; // จัดกึ่งกลางจาก center (ดู Design.md §6)

    // กรณีความยากนี้ยังไม่มีด่าน
    if (available === 0) {
      const msg = this.add.text(cx, 320, 'ยังไม่มีด่าน\n(coming soon)',
        { ...textStyle(TYPO.h3, HEX.textMuted), align: 'center' }).setOrigin(0.5);
      this.gridObjects.push(msg);
      return;
    }

    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = offsetX + col * (cell + gap) + cell / 2;
      const y = startY + row * (cell + gap) + cell / 2;

      const hasData = i < available;
      const cleared = this.getLevelCleared(this.difficulty, i + 1);
      const prevCleared = i === 0 || this.getLevelCleared(this.difficulty, i);
      const playable = hasData && prevCleared;

      const fill = cleared ? COLORS.secondary : playable ? COLORS.empty : COLORS.bgPanel;
      const bg = this.add.rectangle(x, y, cell, cell, fill);
      this.gridObjects.push(bg);

      const numColor = playable || cleared ? HEX.text : HEX.textDisabled;
      const numTxt = this.add.text(x, y, `${i + 1}`, textStyle(TYPO.h3, numColor)).setOrigin(0.5);
      this.gridObjects.push(numTxt);

      if (cleared) {
        const check = this.add.text(x + cell / 2 - 12, y - cell / 2 + 12, '✓',
          textStyle(TYPO.label, HEX.bgDark, true)).setOrigin(0.5);
        this.gridObjects.push(check);
      }

      if (playable) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.scene.start('Game', {
            mode: 'campaign',
            difficulty: this.difficulty,
            levelIndex: i,
          });
        });
        bg.on('pointerover', () => bg.setFillStyle(COLORS.primary));
        bg.on('pointerout',  () => bg.setFillStyle(cleared ? COLORS.secondary : COLORS.empty));
      }
    }
  }

  private getLevelCleared(d: Difficulty, n: number): boolean {
    return localStorage.getItem(`${d}_${n}_cleared`) === '1';
  }
}
