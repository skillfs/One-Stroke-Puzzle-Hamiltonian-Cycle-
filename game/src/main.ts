import Phaser from 'phaser';
import { GAME } from './config/GameConfig';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME.width,
  height: GAME.height,
  backgroundColor: GAME.backgroundColor,
  parent: 'app',
  scene: [MainMenuScene, LevelSelectScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

(window as any).game = game;
