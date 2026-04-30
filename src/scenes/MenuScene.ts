import Phaser from 'phaser';
import { bindActivation, createScreen, onSceneShutdown } from '../ui/domLayer';
import { difficulties, resetGame, setDifficulty } from '../systems/gameState';
import type { DifficultyId } from '../systems/gameState';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    onSceneShutdown(this);
    this.drawBackground();

    const screen = createScreen();
    screen.classList.add('home-screen');

    const shell = document.createElement('div');
    shell.className = 'home-shell';

    const title = document.createElement('h1');
    title.className = 'home-title';
    title.textContent = '詞語大冒險';

    const buttons = document.createElement('div');
    buttons.className = 'home-difficulty-list';

    difficulties.forEach((difficulty) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'home-difficulty-button';
      button.textContent = difficulty.name;
      button.setAttribute('aria-label', `選擇${difficulty.name}難度`);
      bindActivation(button, () => {
        setDifficulty(difficulty.id as DifficultyId);
        resetGame();
        this.scene.start('CharacterScene');
      });
      buttons.append(button);
    });

    shell.append(title, buttons);
    screen.append(shell);
  }

  private drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x244451, 0x244451, 0x6a7d5a, 0x243541, 1);
    graphics.fillRect(0, 0, 960, 640);

    graphics.fillStyle(0xfff0bb, 0.18);
    for (let i = 0; i < 28; i += 1) {
      graphics.fillCircle(80 + i * 34, 90 + Math.sin(i) * 28, 3 + (i % 3));
    }

    graphics.fillStyle(0x223a31, 0.92);
    graphics.fillEllipse(260, 620, 520, 170);
    graphics.fillStyle(0x5b6d58, 0.88);
    graphics.fillEllipse(720, 612, 620, 160);
    graphics.lineStyle(3, 0xe2bf66, 0.48);
    graphics.strokeCircle(730, 168, 82);
  }
}
