import Phaser from 'phaser';
import './styles.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CharacterScene } from './scenes/CharacterScene';
import { ExploreScene } from './scenes/ExploreScene';
import { BattleScene } from './scenes/BattleScene';
import { SummaryScene } from './scenes/SummaryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 640,
  backgroundColor: '#203541',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, MenuScene, CharacterScene, ExploreScene, BattleScene, SummaryScene],
};

new Phaser.Game(config);
