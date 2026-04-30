import type { ChapterId, VocabItem } from '../data/vocab';
import { chapters, getItemsForChapter, vocabItems } from '../data/vocab';

export type DifficultyId = 'easy' | 'normal';
export type RoleId = 'guardian' | 'mage' | 'scholar';

export type Difficulty = {
  id: DifficultyId;
  name: string;
  description: string;
  wrongDamage: number;
  strongEvery: number | null;
  strongDamage: number;
};

export type Role = {
  id: RoleId;
  label: string;
  placeholderName: string;
  hp: number;
  description: string;
};

export type BattleKind = 'vocab' | 'boss';

export type BattlePayload = {
  kind: BattleKind;
  chapterId: ChapterId;
  vocabId?: string;
};

export const difficulties: Difficulty[] = [
  {
    id: 'easy',
    name: '簡單',
    description: '答錯扣 1 HP，敵人只會普通攻擊。',
    wrongDamage: 1,
    strongEvery: null,
    strongDamage: 1,
  },
  {
    id: 'normal',
    name: '普通',
    description: '答錯扣 2 HP；敵人每 3 次攻擊會強攻。',
    wrongDamage: 2,
    strongEvery: 3,
    strongDamage: 3,
  },
];

export const roles: Role[] = [
  {
    id: 'guardian',
    label: '護衛型',
    placeholderName: '[角色一]',
    hp: 12,
    description: '生命最高，適合第一次挑戰。',
  },
  {
    id: 'mage',
    label: '法師型',
    placeholderName: '[角色二]',
    hp: 8,
    description: 'Boss 戰答對時造成 2 點傷害。',
  },
  {
    id: 'scholar',
    label: '學者型',
    placeholderName: '[角色三]',
    hp: 5,
    description: '每場戰鬥可用一次首字提示。',
  },
];

type BattleResult = {
  correct: boolean;
  vocabId: string;
};

type RuntimeState = {
  difficulty: Difficulty;
  role: Role;
  hp: number;
  maxHp: number;
  completedVocab: Set<string>;
  clearedBosses: Set<ChapterId>;
  wrongTerms: Map<string, number>;
  totalAnswers: number;
  correctAnswers: number;
  startTime: number;
  playerPosition: { x: number; y: number };
  lastRegionStart: { x: number; y: number };
  discoveredCells: Set<string>;
};

const defaultDifficulty = difficulties[0];
const defaultRole = roles[0];

export const gameState: RuntimeState = {
  difficulty: defaultDifficulty,
  role: defaultRole,
  hp: defaultRole.hp,
  maxHp: defaultRole.hp,
  completedVocab: new Set<string>(),
  clearedBosses: new Set<ChapterId>(),
  wrongTerms: new Map<string, number>(),
  totalAnswers: 0,
  correctAnswers: 0,
  startTime: Date.now(),
  playerPosition: { x: 180, y: 760 },
  lastRegionStart: { x: 180, y: 760 },
  discoveredCells: new Set<string>(),
};

export function resetGame() {
  gameState.hp = gameState.role.hp;
  gameState.maxHp = gameState.role.hp;
  gameState.completedVocab.clear();
  gameState.clearedBosses.clear();
  gameState.wrongTerms.clear();
  gameState.totalAnswers = 0;
  gameState.correctAnswers = 0;
  gameState.startTime = Date.now();
  gameState.playerPosition = { x: 180, y: 760 };
  gameState.lastRegionStart = { x: 180, y: 760 };
  gameState.discoveredCells.clear();
}

export function setDifficulty(id: DifficultyId) {
  gameState.difficulty = difficulties.find((difficulty) => difficulty.id === id) ?? defaultDifficulty;
}

export function setRole(id: RoleId) {
  gameState.role = roles.find((role) => role.id === id) ?? defaultRole;
  gameState.maxHp = gameState.role.hp;
  gameState.hp = gameState.maxHp;
}

export function applyAnswer(result: BattleResult) {
  gameState.totalAnswers += 1;
  if (result.correct) {
    gameState.correctAnswers += 1;
    gameState.completedVocab.add(result.vocabId);
    return;
  }

  const item = vocabItems.find((entry) => entry.id === result.vocabId);
  if (item) {
    gameState.wrongTerms.set(item.term, (gameState.wrongTerms.get(item.term) ?? 0) + 1);
  }
}

export function damagePlayer(amount: number) {
  gameState.hp = Math.max(0, gameState.hp - amount);
}

export function resetHpAtRegionStart() {
  gameState.hp = gameState.maxHp;
  gameState.playerPosition = { ...gameState.lastRegionStart };
}

export function chapterProgress(chapterId: ChapterId) {
  const items = getItemsForChapter(chapterId);
  const completed = items.filter((item) => gameState.completedVocab.has(item.id)).length;
  return {
    completed,
    total: items.length,
    bossCleared: gameState.clearedBosses.has(chapterId),
    readyForBoss: completed === items.length,
  };
}

export function allChaptersCleared() {
  return chapters.every((chapter) => gameState.clearedBosses.has(chapter.id));
}

export function markBossCleared(chapterId: ChapterId) {
  gameState.clearedBosses.add(chapterId);
}

export function elapsedSeconds() {
  return Math.max(0, Math.round((Date.now() - gameState.startTime) / 1000));
}

export function accuracyText() {
  if (gameState.totalAnswers === 0) return '0%';
  return `${Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)}%`;
}

export function shuffledOptions(item: VocabItem) {
  return [...item.options].sort(() => Math.random() - 0.5);
}
