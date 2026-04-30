import Phaser from 'phaser';
import { MAP_BASE, MAP_PROP_ASSETS } from '../data/mapLayers';

const heroSpecs = [
  { key: 'hero-guardian', robe: 0x3f7b69, trim: 0xd8b456 },
  { key: 'hero-mage', robe: 0x446f96, trim: 0xe6c25a },
  { key: 'hero-scholar', robe: 0xa85f57, trim: 0xf1d38a },
];

const spiritColors = [
  0x68a678, 0x88bdc5, 0xd2a34b, 0xb377b8,
  0xd66b61, 0x6da1d2, 0xe0c35c, 0x88aa62,
  0x9f8fcb, 0xc88954, 0x69b6a6, 0xd7879b,
];

const spiritSlugs = [
  'hush-leaf',
  'letter-wing',
  'ink-tail',
  'rest-acorn',
  'pact-bell',
  'market-lantern',
  'tiny-scroll',
  'brave-button',
  'diary-wisp',
  'moon-glyph',
  'memory-orb',
  'far-star',
];

const heroDirections = [
  { name: 'down', frames: [0, 1, 2, 3] },
  { name: 'left', frames: [4, 5, 6, 7] },
  { name: 'right', frames: [8, 9, 10, 11] },
  { name: 'up', frames: [12, 13, 14, 15] },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image(MAP_BASE.key, MAP_BASE.path);
    MAP_PROP_ASSETS.forEach((asset) => {
      this.load.image(asset.key, asset.path);
    });

    heroSpecs.forEach((spec) => {
      const folder = `assets/sprites/${spec.key}`;
      this.load.image(spec.key, `${folder}/player_sheet-1.png`);
      this.load.spritesheet(`${spec.key}-sheet`, `${folder}/sheet-transparent.png`, {
        frameWidth: 96,
        frameHeight: 96,
      });
    });

    spiritSlugs.forEach((slug, index) => {
      const folder = `assets/sprites/spirit-${index}-${slug}`;
      this.load.image(`spirit-${index}`, `${folder}/idle-1.png`);
      this.load.spritesheet(`spirit-${index}-sheet`, `${folder}/sheet-transparent.png`, {
        frameWidth: 96,
        frameHeight: 96,
      });
    });

    this.load.image('boss-spirit', 'assets/sprites/boss-spirit/idle-1.png');
    this.load.spritesheet('boss-spirit-sheet', 'assets/sprites/boss-spirit/sheet-transparent.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    this.createHeroTextures();
    this.createSpiritTextures();
    this.createAnimations();
    this.scene.start('MenuScene');
  }

  private createHeroTextures() {
    heroSpecs.forEach((spec) => {
      if (this.textures.exists(spec.key)) return;

      const graphics = this.add.graphics();
      graphics.fillStyle(0x1b2630, 0.24);
      graphics.fillEllipse(32, 66, 44, 14);
      graphics.fillStyle(spec.robe, 1);
      graphics.fillRoundedRect(16, 24, 32, 38, 12);
      graphics.fillStyle(0xf4d7ae, 1);
      graphics.fillCircle(32, 20, 13);
      graphics.fillStyle(spec.trim, 1);
      graphics.fillTriangle(32, 0, 18, 23, 46, 23);
      graphics.lineStyle(4, spec.trim, 1);
      graphics.strokeLineShape(new Phaser.Geom.Line(22, 38, 42, 38));
      graphics.lineStyle(3, 0x23333d, 0.75);
      graphics.strokeRoundedRect(16, 24, 32, 38, 12);
      graphics.generateTexture(spec.key, 64, 76);
      graphics.destroy();
    });
  }

  private createSpiritTextures() {
    spiritColors.forEach((color, index) => {
      if (this.textures.exists(`spirit-${index}`)) return;

      const graphics = this.add.graphics();
      const accent = Phaser.Display.Color.ValueToColor(color).brighten(24).color;
      graphics.fillStyle(0x192933, 0.22);
      graphics.fillEllipse(34, 58, 46, 12);
      graphics.fillStyle(color, 1);
      graphics.fillCircle(34, 34, 22);
      graphics.fillStyle(accent, 0.95);
      graphics.fillEllipse(22, 26, 18, 10);
      graphics.fillEllipse(46, 26, 18, 10);
      graphics.fillStyle(0xfff8e8, 0.95);
      graphics.fillCircle(27, 33, 4);
      graphics.fillCircle(41, 33, 4);
      graphics.fillStyle(0x24333d, 0.95);
      graphics.fillCircle(28, 34, 2);
      graphics.fillCircle(40, 34, 2);
      graphics.lineStyle(3, 0xfff8e8, 0.85);
      graphics.strokeCircle(34, 34, 24);
      if (index % 3 === 0) {
        graphics.fillStyle(0xe8c765, 1);
        graphics.fillTriangle(34, 4, 25, 20, 43, 20);
      }
      graphics.generateTexture(`spirit-${index}`, 72, 72);
      graphics.destroy();
    });

    if (this.textures.exists('boss-spirit')) return;

    const boss = this.add.graphics();
    boss.fillStyle(0x1b2630, 0.25);
    boss.fillEllipse(62, 98, 78, 20);
    boss.fillStyle(0x5e5b9b, 1);
    boss.fillCircle(62, 54, 42);
    boss.fillStyle(0xe4bd56, 1);
    boss.fillTriangle(62, 2, 38, 38, 86, 38);
    boss.fillStyle(0xfff8e8, 1);
    boss.fillCircle(48, 52, 7);
    boss.fillCircle(76, 52, 7);
    boss.lineStyle(5, 0xfff8e8, 0.8);
    boss.strokeCircle(62, 54, 45);
    boss.generateTexture('boss-spirit', 124, 112);
    boss.destroy();
  }

  private createAnimations() {
    heroSpecs.forEach((spec) => {
      const sheetKey = `${spec.key}-sheet`;
      if (!this.textures.exists(sheetKey)) return;

      heroDirections.forEach((direction) => {
        const animationKey = `${spec.key}-walk-${direction.name}`;
        if (this.anims.exists(animationKey)) return;
        this.anims.create({
          key: animationKey,
          frames: direction.frames.map((frame) => ({ key: sheetKey, frame })),
          frameRate: 7,
          repeat: -1,
        });
      });
    });

    spiritSlugs.forEach((_, index) => {
      const sheetKey = `spirit-${index}-sheet`;
      const animationKey = `spirit-${index}-idle`;
      if (!this.textures.exists(sheetKey) || this.anims.exists(animationKey)) return;
      this.anims.create({
        key: animationKey,
        frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
    });

    if (this.textures.exists('boss-spirit-sheet') && !this.anims.exists('boss-spirit-idle')) {
      this.anims.create({
        key: 'boss-spirit-idle',
        frames: this.anims.generateFrameNumbers('boss-spirit-sheet', { start: 0, end: 8 }),
        frameRate: 5,
        repeat: -1,
      });
    }
  }
}
