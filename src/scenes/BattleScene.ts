import Phaser from 'phaser';
import type { VocabItem } from '../data/vocab';
import { getItemById, getItemsForChapter } from '../data/vocab';
import {
  allChaptersCleared,
  applyAnswer,
  damagePlayer,
  gameState,
  markBossCleared,
  resetGame,
  resetHpAtRegionStart,
  shuffledOptions,
} from '../systems/gameState';
import type { BattlePayload } from '../systems/gameState';
import { bindActivation, clearDomLayer, createScreen, makeButton, mountDomElement, onSceneShutdown } from '../ui/domLayer';

type BattleActorSide = 'hero' | 'enemy';

type BattleActorConfig = {
  x: number;
  y: number;
  side: BattleActorSide;
  staticKey: string;
  sheetKey?: string;
  animationKey?: string;
  width: number;
  height: number;
  maxHp: number;
  currentHp: number;
  hpLabel: string;
  boss?: boolean;
};

type BattleActorView = {
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  hpGraphics: Phaser.GameObjects.Graphics;
  hpText: Phaser.GameObjects.Text;
  hpWidth: number;
  hpHeight: number;
  hpX: number;
  hpY: number;
  maxHp: number;
  hpLabel: string;
  fillColor: number;
};

export class BattleScene extends Phaser.Scene {
  private payload!: BattlePayload;
  private questions: VocabItem[] = [];
  private questionIndex = 0;
  private bossHp = 3;
  private enemyAttackCount = 0;
  private hintUsed = false;
  private heroView?: BattleActorView;
  private enemyView?: BattleActorView;
  private enemy?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

  constructor() {
    super('BattleScene');
  }

  init(data: BattlePayload) {
    this.payload = data;
    this.questions = this.resolveQuestions(data);
    this.questionIndex = 0;
    this.bossHp = 3;
    this.enemyAttackCount = 0;
    this.hintUsed = false;
    this.heroView = undefined;
    this.enemyView = undefined;
    this.enemy = undefined;
  }

  create() {
    onSceneShutdown(this);
    document.body.classList.add('battle-active');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => document.body.classList.remove('battle-active'));
    this.drawBattlefield();
    this.renderBattlePanel();
  }

  private resolveQuestions(data: BattlePayload) {
    if (data.kind === 'boss') {
      return Phaser.Utils.Array.Shuffle([...getItemsForChapter(data.chapterId)]);
    }
    const item = data.vocabId ? getItemById(data.vocabId) : undefined;
    return item ? [item] : [];
  }

  private drawBattlefield() {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x213d4a, 0x233b4a, 0x536b55, 0x66586f, 1);
    graphics.fillRect(0, 0, 960, 640);
    graphics.fillStyle(0xfff4cf, 0.08);
    graphics.fillCircle(248, 148, 128);
    graphics.fillCircle(704, 142, 146);
    graphics.fillStyle(0x17232b, 0.18);
    graphics.fillEllipse(210, 520, 520, 118);
    graphics.fillEllipse(730, 500, 620, 130);
    graphics.lineStyle(2, 0xfff4cf, 0.08);
    graphics.strokeCircle(704, 142, 146);

    this.heroView = this.createBattleActor({
      x: 254,
      y: 160,
      side: 'hero',
      staticKey: `hero-${gameState.role.id}`,
      width: 118,
      height: 142,
      maxHp: gameState.maxHp,
      currentHp: gameState.hp,
      hpLabel: 'HP',
    });

    const item = this.currentItem();
    const texture = this.payload.kind === 'boss' ? 'boss-spirit' : `spirit-${item.spiritId}`;
    const sheet = this.payload.kind === 'boss' ? 'boss-spirit-sheet' : `spirit-${item.spiritId}-sheet`;
    const animation = this.payload.kind === 'boss' ? 'boss-spirit-idle' : `spirit-${item.spiritId}-idle`;
    this.enemyView = this.createBattleActor({
      x: 706,
      y: this.payload.kind === 'boss' ? 146 : 160,
      side: 'enemy',
      staticKey: texture,
      sheetKey: sheet,
      animationKey: animation,
      width: this.payload.kind === 'boss' ? 176 : 124,
      height: this.payload.kind === 'boss' ? 160 : 124,
      maxHp: this.payload.kind === 'boss' ? 3 : 1,
      currentHp: this.payload.kind === 'boss' ? this.bossHp : 1,
      hpLabel: this.payload.kind === 'boss' ? 'Boss HP' : 'HP',
      boss: this.payload.kind === 'boss',
    });
    this.enemy = this.enemyView.sprite;
    this.refreshBattleHpBars();
  }

  private createBattleActor(config: BattleActorConfig): BattleActorView {
    const root = this.add.container(config.x, config.y);
    const haloRadius = config.boss ? 112 : 96;
    const spriteY = config.boss ? 48 : config.side === 'hero' ? 42 : 46;
    const shadowY = config.boss ? 106 : 94;
    const hpWidth = config.boss ? 160 : config.side === 'hero' ? 150 : 138;
    const hpHeight = 20;
    const hpY = config.boss ? 150 : 132;
    const fillColor = config.side === 'hero' ? 0x79aeb4 : 0xd6a541;

    const halo = this.add.circle(0, 0, haloRadius, 0xf2f0df, config.boss ? 0.17 : 0.13)
      .setStrokeStyle(3, 0xfff4cf, config.boss ? 0.18 : 0.12);
    const shadow = this.add.ellipse(
      0,
      shadowY,
      config.boss ? 278 : 218,
      config.boss ? 50 : 40,
      0x18232d,
      config.boss ? 0.34 : 0.3,
    );
    const sprite = this.createActorSprite(config).setPosition(0, spriteY);
    const hpGraphics = this.add.graphics();
    const hpText = this.add.text(0, hpY, '', {
      fontFamily: 'Microsoft JhengHei, PingFang TC, Noto Sans TC, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#17232b',
    }).setOrigin(0.5);

    root.add([halo, shadow, sprite, hpGraphics, hpText]);
    this.tweens.add({
      targets: sprite,
      y: sprite.y - (config.boss ? 12 : 10),
      duration: config.side === 'hero' ? 940 : 780,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const view: BattleActorView = {
      root,
      sprite,
      hpGraphics,
      hpText,
      hpWidth,
      hpHeight,
      hpX: -hpWidth / 2,
      hpY,
      maxHp: config.maxHp,
      hpLabel: config.hpLabel,
      fillColor,
    };
    this.updateBattleActorHp(view, config.currentHp);
    return view;
  }

  private createActorSprite(config: BattleActorConfig) {
    const sprite = config.sheetKey && this.textures.exists(config.sheetKey)
      ? this.add.sprite(0, 0, config.sheetKey, 0)
      : this.add.image(0, 0, config.staticKey);
    sprite.setDisplaySize(config.width, config.height);
    if (sprite instanceof Phaser.GameObjects.Sprite && config.animationKey && this.anims.exists(config.animationKey)) {
      sprite.play(config.animationKey);
    }
    return sprite;
  }

  private refreshBattleHpBars() {
    if (this.heroView) {
      this.updateBattleActorHp(this.heroView, gameState.hp);
    }
    if (this.enemyView) {
      this.updateBattleActorHp(this.enemyView, this.payload.kind === 'boss' ? this.bossHp : 1);
    }
  }

  private updateBattleActorHp(view: BattleActorView, currentHp: number) {
    const hp = Phaser.Math.Clamp(currentHp, 0, view.maxHp);
    const ratio = view.maxHp > 0 ? hp / view.maxHp : 0;
    const innerPadding = 4;
    const fillWidth = Math.max(0, (view.hpWidth - innerPadding * 2) * ratio);

    view.hpGraphics.clear();
    view.hpGraphics.fillStyle(0x101820, 0.5);
    view.hpGraphics.fillRoundedRect(view.hpX - 2, view.hpY - view.hpHeight / 2 - 2, view.hpWidth + 4, view.hpHeight + 4, 6);
    view.hpGraphics.fillStyle(0xfff8e8, 0.94);
    view.hpGraphics.fillRoundedRect(view.hpX, view.hpY - view.hpHeight / 2, view.hpWidth, view.hpHeight, 6);
    if (fillWidth > 0) {
      view.hpGraphics.fillStyle(view.fillColor, 0.88);
      view.hpGraphics.fillRoundedRect(
        view.hpX + innerPadding,
        view.hpY - view.hpHeight / 2 + innerPadding,
        fillWidth,
        view.hpHeight - innerPadding * 2,
        4,
      );
    }
    view.hpGraphics.lineStyle(2, 0x17232b, 0.82);
    view.hpGraphics.strokeRoundedRect(view.hpX, view.hpY - view.hpHeight / 2, view.hpWidth, view.hpHeight, 6);
    view.hpText.setText(`${view.hpLabel} ${hp}/${view.maxHp}`);
  }

  private renderBattlePanel(feedbackText = '') {
    const item = this.currentItem();
    const options = shuffledOptions(item);
    let selected = '';

    clearDomLayer();
    const panel = document.createElement('section');
    panel.className = 'battle-panel';

    const question = document.createElement('div');
    question.className = 'question';
    question.textContent = item.sentence;

    const answerGrid = document.createElement('div');
    answerGrid.className = 'answer-grid';

    const confirmButton = makeButton('確認答案', 'primary-button', () => {
      if (selected) {
        this.confirmAnswer(selected);
      }
    });
    confirmButton.setAttribute('disabled', 'true');

    options.forEach((option) => {
      const button = makeButton(option, 'answer-button', () => {
        selected = option;
        answerGrid.querySelectorAll('.answer-button').forEach((element) => element.classList.remove('selected'));
        button.classList.add('selected');
        confirmButton.removeAttribute('disabled');
      });
      answerGrid.append(button);
    });

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = feedbackText;

    const actions = document.createElement('div');
    actions.className = 'battle-actions';
    actions.append(confirmButton);

    if (gameState.role.id === 'scholar') {
      const hintButton = makeButton(this.hintUsed ? '首字提示已使用' : '首字提示', '', () => {
        if (this.hintUsed) return;
        this.hintUsed = true;
        feedback.textContent = `首字提示：${item.term.charAt(0)}`;
        hintButton.setAttribute('disabled', 'true');
        hintButton.textContent = '首字提示已使用';
      });
      if (this.hintUsed) {
        hintButton.setAttribute('disabled', 'true');
      }
      actions.append(hintButton);
    } else {
      const status = document.createElement('div');
      status.className = 'tag';
      status.textContent = gameState.role.id === 'mage' ? '法師 Boss 傷害 +1' : '護衛生命較高';
      actions.append(status);
    }

    panel.append(question, answerGrid, actions, feedback);
    mountDomElement(panel);
    this.refreshBattleHpBars();
  }

  private confirmAnswer(answer: string) {
    const item = this.currentItem();
    const correct = answer === item.term;

    if (correct) {
      this.handleCorrect(item);
      return;
    }

    this.handleWrong(item);
  }

  private handleCorrect(item: VocabItem) {
    applyAnswer({ correct: true, vocabId: item.id });
    this.flashEnemy(0x84d37b);

    if (this.payload.kind === 'vocab') {
      this.refreshBattleHpBars();
      this.renderBattlePanel(`答對了！「${item.term}」已收服。`);
      this.time.delayedCall(800, () => this.scene.start('ExploreScene'));
      return;
    }

    this.bossHp -= gameState.role.id === 'mage' ? 2 : 1;
    this.refreshBattleHpBars();
    if (this.bossHp <= 0) {
      markBossCleared(this.payload.chapterId);
      this.renderBattlePanel(`Boss 被擊退了！你完成了 ${item.chapterTitle} 的挑戰。`);
      this.time.delayedCall(900, () => {
        this.scene.start(allChaptersCleared() ? 'SummaryScene' : 'ExploreScene');
      });
      return;
    }

    this.questionIndex = (this.questionIndex + 1) % this.questions.length;
    this.renderBattlePanel(`答對了！Boss 受到傷害，下一題來了。`);
  }

  private handleWrong(item: VocabItem) {
    applyAnswer({ correct: false, vocabId: item.id });
    this.enemyAttackCount += 1;
    const strong = gameState.difficulty.strongEvery !== null && this.enemyAttackCount % gameState.difficulty.strongEvery === 0;
    const damage = strong ? gameState.difficulty.strongDamage : gameState.difficulty.wrongDamage;
    damagePlayer(damage);
    this.refreshBattleHpBars();
    this.cameras.main.shake(180, 0.006);

    if (gameState.hp <= 0) {
      this.showDefeat(item.term);
      return;
    }

    this.renderBattlePanel(`答錯了。敵人${strong ? '強攻' : '攻擊'}，扣 ${damage} HP。`);
  }

  private showDefeat(term: string) {
    clearDomLayer();
    const screen = createScreen();
    const panel = document.createElement('div');
    panel.className = 'summary-panel';

    const title = document.createElement('h2');
    title.textContent = '戰敗';

    const message = document.createElement('p');
    message.className = 'support';
    message.textContent = `正確答案：${term}`;

    const actions = document.createElement('div');
    actions.className = 'battle-actions';

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'primary-button';
    retry.textContent = '從目前區域重新開始';
    bindActivation(retry, () => {
      resetHpAtRegionStart();
      this.scene.start('ExploreScene');
    });

    const home = document.createElement('button');
    home.type = 'button';
    home.textContent = '返回開始畫面';
    bindActivation(home, () => {
      resetGame();
      this.scene.start('MenuScene');
    });

    actions.append(retry, home);
    panel.append(title, message, actions);
    screen.append(panel);
  }

  private flashEnemy(color: number) {
    if (!this.enemy) return;
    this.enemy.setTint(color);
    this.time.delayedCall(180, () => this.enemy?.clearTint());
  }

  private currentItem() {
    const item = this.questions[this.questionIndex];
    if (!item) {
      throw new Error('Battle started without a vocab item');
    }
    return item;
  }
}
