import Phaser from 'phaser';
import { vocabItems } from '../data/vocab';
import { accuracyText, elapsedSeconds, gameState, resetGame } from '../systems/gameState';
import { bindActivation, createScreen, onSceneShutdown } from '../ui/domLayer';

export class SummaryScene extends Phaser.Scene {
  constructor() {
    super('SummaryScene');
  }

  create() {
    onSceneShutdown(this);
    this.drawCelebration();
    this.renderSummary();
  }

  private drawCelebration() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x243d48, 0x243d48, 0x6d8a65, 0x7b6c91, 1);
    graphics.fillRect(0, 0, 960, 640);
    graphics.fillStyle(0xfff1bd, 0.22);
    for (let i = 0; i < 42; i += 1) {
      graphics.fillCircle(36 + (i * 81) % 900, 54 + (i * 47) % 520, 3 + (i % 5));
    }
    this.add.image(360, 330, 'hero-guardian').setDisplaySize(100, 120);
    this.add.image(480, 302, 'hero-mage').setDisplaySize(100, 120);
    this.add.image(600, 330, 'hero-scholar').setDisplaySize(100, 120);
  }

  private renderSummary() {
    const screen = createScreen();
    const panel = document.createElement('section');
    panel.className = 'summary-panel';

    const title = document.createElement('h2');
    title.textContent = '通關成績摘要';

    const support = document.createElement('p');
    support.className = 'support';
    support.textContent = '你完成了三個課文地區的詞語挑戰。';

    const stats = document.createElement('div');
    stats.className = 'summary-stats';
    [
      `角色：${gameState.role.placeholderName}｜${gameState.role.label}`,
      `難度：${gameState.difficulty.name}`,
      `完成度：${gameState.completedVocab.size}/${vocabItems.length}`,
      `答對率：${accuracyText()}`,
      `用時：${this.formatTime(elapsedSeconds())}`,
    ].forEach((text) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = text;
      stats.append(tag);
    });

    const missTitle = document.createElement('h2');
    missTitle.textContent = '需要再溫習的詞語';

    const missList = document.createElement('div');
    missList.className = 'miss-list';
    const wrongTerms = [...gameState.wrongTerms.entries()];
    if (wrongTerms.length === 0) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = '沒有錯題，做得很好！';
      missList.append(tag);
    } else {
      wrongTerms.forEach(([term, count]) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = `${term} × ${count}`;
        missList.append(tag);
      });
    }

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'primary-button';
    replay.textContent = '再玩一次';
    bindActivation(replay, () => {
      resetGame();
      this.scene.start('MenuScene');
    });

    panel.append(title, support, stats, missTitle, missList, replay);
    screen.append(panel);
  }

  private formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}分${rest.toString().padStart(2, '0')}秒`;
  }
}
