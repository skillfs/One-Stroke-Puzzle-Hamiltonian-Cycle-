import Phaser from 'phaser';
import { COLORS, HEX, LAYOUT, TYPO, textStyle } from '../config/GameConfig';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create() {
    const cx = LAYOUT.centerX;

    // ---- Title ----
    this.add.text(cx, 160, 'One Stroke', textStyle(TYPO.display, HEX.primary, true))
      .setOrigin(0.5);
    this.add.text(cx, 205, 'Puzzle Game', textStyle(TYPO.caption, HEX.textMuted))
      .setOrigin(0.5);

    // ---- Buttons (ระยะห่างเท่ากันทุกปุ่ม ดู Design.md §6) ----
    const step = LAYOUT.button.height + LAYOUT.button.gap; // 64
    const firstY = 300;
    this.createButton(cx, firstY,            'เล่นเกม',      () => this.scene.start('LevelSelect'), true);
    this.createButton(cx, firstY + step,     'Endless Mode', () => this.scene.start('Game', { mode: 'endless' }));
    this.createButton(cx, firstY + step * 2, 'ตั้งค่า',       () => { /* TODO: SettingsScene */ });

    // ---- Best Score ----
    const best = localStorage.getItem('endlessBest') ?? '0';
    this.add.text(cx, 540, `Best Score: ${best}`, textStyle(TYPO.caption, HEX.textMuted))
      .setOrigin(0.5);
  }

  private createButton(
    x: number, y: number, label: string,
    onClick: () => void, primary = false
  ) {
    const { width, height } = LAYOUT.button;
    const bg = this.add.rectangle(x, y, width, height,
      primary ? COLORS.primary : COLORS.empty
    ).setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, textStyle(TYPO.h3, HEX.text)).setOrigin(0.5);

    bg.on('pointerover',  () => bg.setAlpha(0.85));
    bg.on('pointerout',   () => bg.setAlpha(1));
    bg.on('pointerdown',  onClick);
  }
}
