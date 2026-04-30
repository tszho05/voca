import Phaser from 'phaser';
import { bindActivation, createScreen, onSceneShutdown } from '../ui/domLayer';
import { resetGame, roles, setRole } from '../systems/gameState';
import type { RoleId } from '../systems/gameState';

const roleCopy: Record<RoleId, { title: string; detail: string }> = {
  guardian: {
    title: '[角色一]｜護衛型',
    detail: 'HP 12｜適合第一次挑戰。',
  },
  mage: {
    title: '[角色二]｜法師型',
    detail: 'HP 8｜Boss 戰答對時造成 2 點傷害。',
  },
  scholar: {
    title: '[角色三]｜學者型',
    detail: 'HP 5｜每場戰鬥可用一次首字提示。',
  },
};

const rolePortraits: Record<RoleId, string> = {
  guardian: 'assets/characters/hero-guardian-select.png',
  mage: 'assets/characters/hero-mage-select.png',
  scholar: 'assets/characters/hero-scholar-select.png',
};

export class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
  }

  create() {
    onSceneShutdown(this);
    this.drawBackground();

    const screen = createScreen();
    screen.classList.add('character-screen');

    const layout = document.createElement('section');
    layout.className = 'character-layout';

    const title = document.createElement('h1');
    title.className = 'character-title';
    title.textContent = '選擇角色';

    const grid = document.createElement('div');
    grid.className = 'character-grid';

    roles.forEach((role) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'character-card';
      card.setAttribute('aria-label', `選擇${roleCopy[role.id].title}`);

      const frame = document.createElement('div');
      frame.className = 'character-portrait-frame';

      const portrait = document.createElement('img');
      portrait.className = 'character-portrait';
      portrait.alt = roleCopy[role.id].title;
      portrait.src = rolePortraits[role.id as RoleId];
      frame.append(portrait);

      const name = document.createElement('div');
      name.className = 'character-name';
      name.textContent = roleCopy[role.id].title;

      const detail = document.createElement('div');
      detail.className = 'character-detail';
      detail.textContent = roleCopy[role.id].detail;

      card.append(frame, name, detail);
      bindActivation(card, () => {
        setRole(role.id as RoleId);
        resetGame();
        this.scene.start('ExploreScene');
      });
      grid.append(card);
    });

    layout.append(title, grid);
    screen.append(layout);
  }

  private drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x263d49, 0x263d49, 0x7b6e58, 0x384f52, 1);
    graphics.fillRect(0, 0, 960, 640);

    graphics.fillStyle(0x1b2f38, 0.42);
    graphics.fillRoundedRect(104, 136, 206, 318, 18);
    graphics.fillRoundedRect(377, 106, 206, 348, 18);
    graphics.fillRoundedRect(650, 136, 206, 318, 18);

    graphics.fillStyle(0xfff0bb, 0.13);
    for (let i = 0; i < 22; i += 1) {
      graphics.fillCircle(56 + i * 43, 76 + Math.sin(i * 1.8) * 22, 2 + (i % 4));
    }

    graphics.fillStyle(0x1b2f38, 0.7);
    graphics.fillEllipse(250, 620, 480, 120);
    graphics.fillStyle(0x5b6d58, 0.62);
    graphics.fillEllipse(725, 618, 560, 118);
  }
}
