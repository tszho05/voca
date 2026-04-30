export type ChapterId = 'mouse-letter' | 'cat-mouse' | 'persian-diary';

export type VocabItem = {
  id: string;
  chapterId: ChapterId;
  chapterTitle: string;
  regionName: string;
  term: string;
  sentence: string;
  options: string[];
  spiritId: number;
};

const chapterMeta: Record<ChapterId, { title: string; region: string }> = {
  'mouse-letter': {
    title: '《老鼠寫信》',
    region: '寧靜森林郵路',
  },
  'cat-mouse': {
    title: '《貓鼠一家親》',
    region: '貓鼠協議鎮',
  },
  'persian-diary': {
    title: '《波斯貓阿姨的日記》',
    region: '遠方日記遺跡',
  },
};

function item(
  id: string,
  chapterId: ChapterId,
  term: string,
  sentence: string,
  options: string[],
  spiritId: number,
): VocabItem {
  return {
    id,
    chapterId,
    chapterTitle: chapterMeta[chapterId].title,
    regionName: chapterMeta[chapterId].region,
    term,
    sentence,
    options,
    spiritId,
  };
}

export const vocabItems: VocabItem[] = [
  item('mouse-letter-park',     'mouse-letter', '寧靜',    '深夜的公園十分____，只聽到蟲鳴和微風吹過樹葉的聲音。',                       ['寧靜',    '歡騰',     '遙遠',     '缺乏'],    0),
  item('mouse-letter-market',   'mouse-letter', '叫嚷',    '弟弟在超級市場裏大聲____，要求媽媽買玩具他，令旁人側目。',                 ['叫嚷',    '研讀',     '協議',     '歎息'],    1),
  item('mouse-letter-kitchen',  'mouse-letter', '東跑西竄', '那隻老鼠在廚房裏____，把媽媽剛準備好的食材弄得一塌糊塗。',                  ['東跑西竄', '妮妮道來', '恍然大悟', '毫不起眼'], 2),
  item('mouse-letter-grade',    'mouse-letter', '歎息',    '爸爸看到我的成績表後，忍不住搖頭____，叫我要加倍努力。',                       ['歎息',    '控制',     '爭執',     '傳遍'],    3),
  item('mouse-letter-coach',    'mouse-letter', '指導',    '教練親自____我們練習游泳，使大家的泳術大有進步。',                           ['指導',    '翻弄',     '距離',     '丟臉'],    0),
  item('mouse-letter-gift',     'mouse-letter', '迫不及待', '小華____地打開了聖誕禮物，發現裏面是心儀已久的積木。',                     ['迫不及待', '提心吊膽', '無言以對', '妮妮道來'], 1),
  item('mouse-letter-wardrobe', 'mouse-letter', '翻弄',    '姐姐在衣櫃裏____了半天，才找到那件她最喜愛的裙子。',                         ['翻弄',    '指導',     '研讀',     '控制'],    2),
  item('mouse-letter-friendly', 'mouse-letter', '鄰居',    '我們的____非常熱情，每逢節日都會邀請我們到他們家中作客。',                   ['鄰居',    '距離',     '缺乏',     '歡騰'],    3),

  item('cat-mouse-stadium',   'cat-mouse', '歡騰',    '香港足球隊勝出比賽後，球場內的球迷頓時____起來，非常熱鬧。',           ['歡騰',    '寧靜',     '傳遍',     '研讀'],    4),
  item('cat-mouse-grandma',   'cat-mouse', '妮妮道來', '婆婆坐在搖椅上____，向孫兒們講述她年輕時的「冒險故事」。',                         ['妮妮道來', '東跑西竄', '迫不及待', '毫不起眼'], 5),
  item('cat-mouse-accused',   'cat-mouse', '激憤',    '聽到有人誣告好友作弊，小強感到十分____，立刻站出來為朋友申辯。',                 ['激憤',    '歡騰',     '歎息',     '遙遠'],    6),
  item('cat-mouse-vase',      'cat-mouse', '毫不起眼', '這件____的舊花瓶，原來是百年前的珍貴古董，價值連城。',                          ['毫不起眼', '恍然大悟', '無言以對', '提心吊膽'], 7),
  item('cat-mouse-captain',   'cat-mouse', '爭執',    '兩位同學因為選班長的問題發生____，幸好班主任及時調解，大家才和好如初。',         ['爭執',    '寧靜',     '傳遍',     '研讀'],    4),
  item('cat-mouse-glass',     'cat-mouse', '無言以對', '老師問誰把課室的玻璃打破了，做錯事的同學____，默默地低下頭來。',                  ['無言以對', '叫嚷',    '控制',     '傳遍'],    5),
  item('cat-mouse-peace',     'cat-mouse', '協議',    '兩國代表簽署了和平____，承諾停止一切衝突，共同維護地區穩定。',                   ['協議',    '指導',     '缺乏',     '翻弄'],    6),
  item('cat-mouse-climbing',  'cat-mouse', '提心吊膽', '媽媽____地看着弟弟在攀爬架上玩耍，生怕他一不小心跌了下來。',               ['提心吊膽', '妮妮道來', '毫不起眼', '距離'],    7),

  item('persian-diary-school',    'persian-diary', '傳遍',    '學校要停課的消息在早上就____全校，同學們又驚又喜。',                    ['傳遍',    '鄰居',     '控制',     '研讀'],    8),
  item('persian-diary-anger',     'persian-diary', '控制',    '小明生氣時很難____情緒，媽媽教他先深呼吸，讓自己冷靜下來。',              ['控制',    '叫嚷',     '協議',     '遙遠'],    9),
  item('persian-diary-textbook',  'persian-diary', '研讀',    '阿文花了整個週末____課本，務求對每一課都了如指掌。',                ['研讀',    '歎息',     '歡騰',     '爭執'],    10),
  item('persian-diary-brother',   'persian-diary', '恍然大悟', '媽媽解釋了弟弟哭泣的原因後，我才____，原來是自己早上說錯話傷害了他。',    ['恍然大悟', '東跑西竄', '毫不起眼', '激憤'],    11),
  item('persian-diary-perform',   'persian-diary', '丟臉',    '小偉在台上表演時出了錯，他覺得十分____，恨不得立刻躲起來。',      ['丟臉',    '寧靜',     '指導',     '傳遍'],    8),
  item('persian-diary-mountain',  'persian-diary', '缺乏',    '這個山區的小學____基本的教學設備，孩子們只能坐在泥地上上課。',            ['缺乏',    '翻弄',     '協議',     '歡騰'],    9),
  item('persian-diary-grandpa',   'persian-diary', '距離',    '雖然爺爺住得很遠，但我們每天視像通話，感覺彼此的____一點也不遠。',        ['距離',    '鄰居',     '叫嚷',     '無言以對'], 10),
  item('persian-diary-space',     'persian-diary', '遙遠',    '太空人駕駛飛船，探索那些____的星球，為人類帶來更多對宇宙的認識。',        ['遙遠',    '迫不及待', '控制',     '歎息'],    11),
];

export const chapters = Object.entries(chapterMeta).map(([id, value]) => ({
  id: id as ChapterId,
  title: value.title,
  region: value.region,
}));

export function getItemsForChapter(chapterId: ChapterId) {
  return vocabItems.filter((item) => item.chapterId === chapterId);
}

export function getItemById(id: string) {
  return vocabItems.find((item) => item.id === id);
}
