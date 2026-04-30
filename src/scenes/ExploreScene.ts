import Phaser from 'phaser';
import type { ChapterId, VocabItem } from '../data/vocab';
import { chapters, vocabItems } from '../data/vocab';
import { MAP_BASE, MAP_BLOCKERS, MAP_PROPS, MAP_SIZE } from '../data/mapLayers';
import {
  allChaptersCleared,
  chapterProgress,
  gameState,
} from '../systems/gameState';
import { createHud, createTouchPad, onSceneShutdown, showToast, updateHud } from '../ui/domLayer';

const WORLD_WIDTH = MAP_SIZE.width;
const WORLD_HEIGHT = MAP_SIZE.height;
const CELL = 120;
const ENCOUNTER_AURA_DEPTH = 8990;
const ENCOUNTER_SPRITE_DEPTH = 9000;
const BOSS_AURA_DEPTH = 9010;
const BOSS_SPRITE_DEPTH = 9020;
const FOG_DEPTH = 10000;

type Region = {
  id: ChapterId;
  x1: number;
  x2: number;
  start: { x: number; y: number };
  color: number;
};

type EncounterNode = {
  id: string;
  chapterId: ChapterId;
  x: number;
  y: number;
  item: VocabItem;
};

type EncounterObject = Phaser.GameObjects.Arc | Phaser.GameObjects.Container | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

type EncounterView = {
  node: EncounterNode;
  objects: EncounterObject[];
};

type BossView = {
  chapterId: ChapterId;
  x: number;
  y: number;
  objects: EncounterObject[];
};

type MoveDirection = 'down' | 'left' | 'right' | 'up';

const regions: Region[] = [
  { id: 'mouse-letter', x1: 0, x2: 790, start: { x: 180, y: 760 }, color: 0x6b8d64 },
  { id: 'cat-mouse', x1: 790, x2: 1600, start: { x: 920, y: 800 }, color: 0x9b8056 },
  { id: 'persian-diary', x1: 1600, x2: WORLD_WIDTH, start: { x: 1740, y: 760 }, color: 0x776b92 },
];

const positions: Record<ChapterId, Array<{ x: number; y: number }>> = {
  'mouse-letter': [
    { x: 210, y: 490 }, { x: 340, y: 930 }, { x: 520, y: 690 }, { x: 675, y: 360 },
    { x: 715, y: 1120 }, { x: 438, y: 1240 }, { x: 180, y: 1150 }, { x: 620, y: 900 },
  ],
  'cat-mouse': [
    { x: 900, y: 470 }, { x: 1050, y: 1000 }, { x: 1230, y: 650 }, { x: 1420, y: 390 },
    { x: 1520, y: 1150 }, { x: 1340, y: 1230 }, { x: 980, y: 1220 }, { x: 1460, y: 850 },
  ],
  'persian-diary': [
    { x: 1760, y: 470 }, { x: 1900, y: 980 }, { x: 2060, y: 620 }, { x: 2250, y: 390 },
    { x: 2280, y: 1120 }, { x: 2100, y: 1260 }, { x: 1740, y: 1190 }, { x: 2200, y: 820 },
  ],
};

const bossPositions: Record<ChapterId, { x: number; y: number }> = {
  'mouse-letter': { x: 720, y: 710 },
  'cat-mouse': { x: 1510, y: 720 },
  'persian-diary': { x: 2280, y: 720 },
};

function buildEncounters(): EncounterNode[] {
  return vocabItems.map((item) => {
    const chapterItems = vocabItems.filter((entry) => entry.chapterId === item.chapterId);
    const index = chapterItems.findIndex((entry) => entry.id === item.id);
    return {
      id: item.id,
      chapterId: item.chapterId,
      x: positions[item.chapterId][index].x,
      y: positions[item.chapterId][index].y,
      item,
    };
  });
}

export class ExploreScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private moveInput = new Phaser.Math.Vector2(0, 0);
  private keyboardInput = new Phaser.Math.Vector2(0, 0);
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private hud?: HTMLElement;
  private fog!: Phaser.GameObjects.Graphics;
  private triggerCooldownUntil = 0;
  private lastFogDrawAt = 0;
  private lastGateToastAt = 0;
  private encounterViews: EncounterView[] = [];
  private bossViews: BossView[] = [];
  private playerDirection: MoveDirection = 'down';
  private playerUsesWalkSheet = false;

  constructor() {
    super('ExploreScene');
  }

  create() {
    onSceneShutdown(this);
    this.resetMovementInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.resetMovementInput());
    this.drawMap();
    this.drawEncounters();
    this.createPlayer();
    this.createControls();
    this.createCameraAndFog();

    if (allChaptersCleared()) {
      this.time.delayedCall(300, () => this.scene.start('SummaryScene'));
      return;
    }

    this.hud = createHud(this.hudItems());
    createTouchPad((x, y) => this.moveInput.set(x, y));
    showToast('靠近發光的詞語精靈開始挑戰。手機可用左下角方向鍵移動。');
  }

  update(time: number, delta: number) {
    this.readKeyboard();
    this.movePlayer(delta);
    this.updateRegionStart();
    this.updateFog(time);
    this.checkEncounter(time);

    if (this.hud && time % 200 < 24) {
      updateHud(this.hud, this.hudItems());
    }
  }

  private drawMap() {
    if (this.textures.exists(MAP_BASE.key)) {
      this.add.image(0, 0, MAP_BASE.key)
        .setOrigin(0)
        .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
        .setDepth(0);
    } else {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x36515b, 1);
      graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    MAP_PROPS.forEach((prop) => {
      if (!this.textures.exists(prop.imageKey)) return;
      this.add.image(prop.x, prop.y, prop.imageKey)
        .setOrigin(0.5, 1)
        .setDisplaySize(prop.w, prop.h)
        .setDepth(prop.sortY);
    });
  }

  private drawEncounters() {
    this.encounterViews = [];
    this.bossViews = [];

    buildEncounters()
      .filter((node) => !gameState.completedVocab.has(node.id))
      .forEach((node) => {
        const aura = this.createEnemyAura(node.x, node.y, 50, ENCOUNTER_AURA_DEPTH);
        const spirit = this.createAnimatedSprite(
          node.x,
          node.y,
          `spirit-${node.item.spiritId}`,
          `spirit-${node.item.spiritId}-sheet`,
          `spirit-${node.item.spiritId}-idle`,
          68,
          68,
          ENCOUNTER_SPRITE_DEPTH,
        ).setVisible(false);
        this.encounterViews.push({ node, objects: [aura, spirit] });
      });

    chapters.forEach((chapter) => {
      const progress = chapterProgress(chapter.id);
      if (!progress.readyForBoss || progress.bossCleared) return;
      const position = bossPositions[chapter.id];
      const aura = this.createEnemyAura(position.x, position.y, 78, BOSS_AURA_DEPTH, true);
      const boss = this.createAnimatedSprite(
        position.x,
        position.y,
        'boss-spirit',
        'boss-spirit-sheet',
        'boss-spirit-idle',
        124,
        112,
        BOSS_SPRITE_DEPTH,
      ).setVisible(false);
      this.bossViews.push({ chapterId: chapter.id, x: position.x, y: position.y, objects: [aura, boss] });
    });
  }

  private createEnemyAura(x: number, y: number, radius: number, depth: number, boss = false): Phaser.GameObjects.Container {
    const visualRadius = boss ? radius * 1.08 : radius;
    const aura = this.add.container(x, y).setDepth(depth).setVisible(false);
    const shadow = this.add.ellipse(
      0,
      visualRadius * 0.24,
      visualRadius * 1.9,
      visualRadius * 0.52,
      0x130d08,
      boss ? 0.31 : 0.24,
    );
    const softGlow = this.add.circle(
      0,
      0,
      visualRadius * 0.9,
      0xffedb1,
      boss ? 0.13 : 0.09,
    );
    const innerRing = this.add.circle(
      0,
      0,
      visualRadius * 0.68,
      0xd6a84a,
      boss ? 0.08 : 0.055,
    ).setStrokeStyle(boss ? 3 : 2, 0xffedb1, boss ? 0.42 : 0.34);
    const outerRing = this.add.circle(
      0,
      0,
      visualRadius,
      0xfff4cf,
      boss ? 0.045 : 0.03,
    ).setStrokeStyle(boss ? 4 : 3, 0xfff4cf, boss ? 0.74 : 0.64);

    aura.add([shadow, softGlow, innerRing, outerRing]);
    this.tweens.add({
      targets: aura,
      scaleX: boss ? 1.055 : 1.06,
      scaleY: boss ? 1.055 : 1.06,
      alpha: boss ? 0.9 : 0.88,
      duration: boss ? 1500 : 1350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    return aura;
  }

  private createPlayer() {
    const sheetKey = `hero-${gameState.role.id}-sheet`;
    this.playerUsesWalkSheet = this.textures.exists(sheetKey);
    this.player = this.add.sprite(
      gameState.playerPosition.x,
      gameState.playerPosition.y,
      this.playerUsesWalkSheet ? sheetKey : `hero-${gameState.role.id}`,
      0,
    );
    this.player.setDisplaySize(120, 132);
    this.updatePlayerDepth();
  }

  private createControls() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key> | undefined;
  }

  private createCameraAndFog() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.fog = this.add.graphics().setDepth(FOG_DEPTH);
  }

  private readKeyboard() {
    const x = Number(Boolean(this.cursors?.right?.isDown || this.wasd?.D.isDown)) - Number(Boolean(this.cursors?.left?.isDown || this.wasd?.A.isDown));
    const y = Number(Boolean(this.cursors?.down?.isDown || this.wasd?.S.isDown)) - Number(Boolean(this.cursors?.up?.isDown || this.wasd?.W.isDown));
    this.keyboardInput.set(x, y);
  }

  private resetMovementInput() {
    this.moveInput.set(0, 0);
    this.keyboardInput.set(0, 0);
  }

  private movePlayer(delta: number) {
    const vector = this.keyboardInput.lengthSq() > 0 ? this.keyboardInput.clone() : this.moveInput.clone();
    if (vector.lengthSq() === 0) {
      this.stopPlayerAnimation();
      return;
    }

    vector.normalize();
    this.playPlayerAnimation(vector);
    const speed = 245;
    const nextX = Phaser.Math.Clamp(this.player.x + vector.x * speed * (delta / 1000), 34, WORLD_WIDTH - 34);
    const nextY = Phaser.Math.Clamp(this.player.y + vector.y * speed * (delta / 1000), 40, WORLD_HEIGHT - 40);
    this.tryMove(nextX, nextY);
    gameState.playerPosition = { x: this.player.x, y: this.player.y };
    this.updatePlayerDepth();
  }

  private createAnimatedSprite(
    x: number,
    y: number,
    staticKey: string,
    sheetKey: string,
    animationKey: string,
    width: number,
    height: number,
    depth: number,
  ) {
    const sprite = this.add.sprite(x, y, this.textures.exists(sheetKey) ? sheetKey : staticKey, 0);
    sprite.setDisplaySize(width, height).setDepth(depth);
    if (this.anims.exists(animationKey)) {
      sprite.play(animationKey);
    }
    return sprite;
  }

  private playPlayerAnimation(vector: Phaser.Math.Vector2) {
    const direction = this.directionFromVector(vector);
    this.playerDirection = direction;
    const animationKey = `hero-${gameState.role.id}-walk-${direction}`;
    if (this.anims.exists(animationKey) && this.player.anims.currentAnim?.key !== animationKey) {
      this.player.play(animationKey);
    }
  }

  private stopPlayerAnimation() {
    if (this.player.anims.isPlaying) {
      this.player.anims.stop();
    }
    if (this.playerUsesWalkSheet) {
      this.player.setFrame(this.neutralFrameForDirection(this.playerDirection));
    }
  }

  private directionFromVector(vector: Phaser.Math.Vector2): MoveDirection {
    if (Math.abs(vector.x) > Math.abs(vector.y)) {
      return vector.x < 0 ? 'left' : 'right';
    }
    return vector.y < 0 ? 'up' : 'down';
  }

  private neutralFrameForDirection(direction: MoveDirection) {
    const frames: Record<MoveDirection, number> = {
      down: 0,
      left: 4,
      right: 8,
      up: 12,
    };
    return frames[direction];
  }

  private tryMove(x: number, y: number) {
    if (!this.canEnterRegionAt(x)) {
      this.showRegionGateToast();
      return;
    }

    if (!this.isBlocked(x, y)) {
      this.player.setPosition(x, y);
      return;
    }
    if (!this.isBlocked(x, this.player.y)) {
      this.player.setPosition(x, this.player.y);
      return;
    }
    if (!this.isBlocked(this.player.x, y)) {
      this.player.setPosition(this.player.x, y);
    }
  }

  private isBlocked(x: number, y: number) {
    const body = new Phaser.Geom.Rectangle(x - 18, y - 26, 36, 52);
    return MAP_BLOCKERS.some((blocker) => {
      const rect = new Phaser.Geom.Rectangle(blocker.x, blocker.y, blocker.w, blocker.h);
      return Phaser.Geom.Intersects.RectangleToRectangle(rect, body);
    });
  }

  private updatePlayerDepth() {
    this.player.setDepth(this.player.y + 20);
  }

  private canEnterRegionAt(x: number) {
    const region = this.regionAt(x);
    if (!region) return true;
    if (region.id === 'mouse-letter') return true;
    if (region.id === 'cat-mouse') return gameState.clearedBosses.has('mouse-letter');
    return gameState.clearedBosses.has('cat-mouse');
  }

  private regionAt(x: number) {
    return regions.find((entry) => x >= entry.x1 && x < entry.x2);
  }

  private showRegionGateToast() {
    if (this.time.now - this.lastGateToastAt < 1000) return;
    this.lastGateToastAt = this.time.now;
    showToast('先擊敗本區 Boss，才可前往下一區。');
  }

  private updateRegionStart() {
    const region = this.regionAt(this.player.x);
    if (region) {
      gameState.lastRegionStart = region.start;
    }
  }

  private updateFog(time: number) {
    const centerX = Math.floor(this.player.x / CELL);
    const centerY = Math.floor(this.player.y / CELL);

    for (let y = centerY - 2; y <= centerY + 2; y += 1) {
      for (let x = centerX - 2; x <= centerX + 2; x += 1) {
        const cellCenterX = x * CELL + CELL / 2;
        if (x >= 0 && y >= 0 && this.canEnterRegionAt(cellCenterX)) {
          gameState.discoveredCells.add(`${x}:${y}`);
        }
      }
    }

    this.updateEncounterVisibility();

    if (time - this.lastFogDrawAt < 160) return;
    this.lastFogDrawAt = time;
    this.fog.clear();
    this.fog.fillStyle(0x0d151a, 0.62);

    for (let y = 0; y < Math.ceil(WORLD_HEIGHT / CELL); y += 1) {
      for (let x = 0; x < Math.ceil(WORLD_WIDTH / CELL); x += 1) {
        if (!gameState.discoveredCells.has(`${x}:${y}`)) {
          this.fog.fillRect(x * CELL, y * CELL, CELL + 2, CELL + 2);
        }
      }
    }
  }

  private updateEncounterVisibility() {
    this.encounterViews.forEach((view) => {
      const visible = !gameState.completedVocab.has(view.node.id)
        && this.canEnterRegionAt(view.node.x)
        && this.isPointDiscovered(view.node.x, view.node.y);
      view.objects.forEach((object) => object.setVisible(visible));
    });

    this.bossViews.forEach((view) => {
      const progress = chapterProgress(view.chapterId);
      const visible = progress.readyForBoss
        && !progress.bossCleared
        && this.canEnterRegionAt(view.x)
        && this.isPointDiscovered(view.x, view.y);
      view.objects.forEach((object) => object.setVisible(visible));
    });
  }

  private isPointDiscovered(x: number, y: number) {
    return gameState.discoveredCells.has(this.cellKey(x, y));
  }

  private cellKey(x: number, y: number) {
    return `${Math.floor(x / CELL)}:${Math.floor(y / CELL)}`;
  }

  private checkEncounter(time: number) {
    if (time < this.triggerCooldownUntil) return;

    const regular = buildEncounters().find((node) => {
      if (gameState.completedVocab.has(node.id)) return false;
      if (!this.canEnterRegionAt(node.x) || !this.isPointDiscovered(node.x, node.y)) return false;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y) < 66;
    });

    if (regular) {
      this.triggerCooldownUntil = time + 1000;
      this.scene.start('BattleScene', {
        kind: 'vocab',
        chapterId: regular.chapterId,
        vocabId: regular.id,
      });
      return;
    }

    const bossChapter = chapters.find((chapter) => {
      const progress = chapterProgress(chapter.id);
      if (!progress.readyForBoss || progress.bossCleared) return false;
      const position = bossPositions[chapter.id];
      if (!this.canEnterRegionAt(position.x) || !this.isPointDiscovered(position.x, position.y)) return false;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, position.x, position.y) < 86;
    });

    if (bossChapter) {
      this.triggerCooldownUntil = time + 1000;
      this.scene.start('BattleScene', {
        kind: 'boss',
        chapterId: bossChapter.id,
      });
    }
  }

  private hudItems() {
    const region = regions.find((entry) => this.player && this.player.x >= entry.x1 && this.player.x < entry.x2);
    const chapter = chapters.find((entry) => entry.id === region?.id) ?? chapters[0];
    const progress = chapterProgress(chapter.id);
    return [
      `${gameState.role.label} HP ${gameState.hp}/${gameState.maxHp}`,
      `${gameState.difficulty.name}`,
      `${chapter.region} ${progress.completed}/8`,
      `全書 ${gameState.completedVocab.size}/24`,
    ];
  }
}
