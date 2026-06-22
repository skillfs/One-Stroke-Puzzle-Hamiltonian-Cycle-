import Phaser from 'phaser';
import { COLORS, GAME } from '../config/GameConfig';
import { CAMPAIGN_LEVELS } from '../levels/campaignLevels';

interface ResultData {
  difficulty: 'easy' | 'medium' | 'hard';
  levelIndex: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data: ResultData) { (this as any)._d = data; }

  create() {
    const d: ResultData = (this as any)._d;
    const cx = GAME.width / 2;

    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add.text(cx, 230, 'ผ่านแล้ว!', {
      fontSize: '36px', color: '#5DCAA5', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Buttons
    const { difficulty: diff, levelIndex: idx } = d;
    const hasNext = idx + 1 < CAMPAIGN_LEVELS[diff].length;

    if (hasNext) {
      this.createButton(cx, 360, 'ด่านถัดไป →', () => {
        this.scene.start('Game', {
          mode: 'campaign', difficulty: diff, levelIndex: idx + 1,
        });
      }, true);
    }

    this.createButton(cx, 420, 'เล่นใหม่', () => {
      this.scene.start('Game', {
        mode: 'campaign', difficulty: diff, levelIndex: idx,
      });
    });

    this.createButton(cx, 480, 'เลือกด่าน', () => {
      this.scene.start('LevelSelect');
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void, primary = false) {
    const bg = this.add.rectangle(x, y, 220, 48,
      primary ? COLORS.primary : COLORS.empty
    ).setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1));
    bg.on('pointerdown',  onClick);
  }
}
