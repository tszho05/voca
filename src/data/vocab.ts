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
  item('mouse-letter-market',   'mouse-letter', '叫嚷',    '市場上的小販正在大聲____，吸引途人的目光。',                                           ['叫嚷',    '研讀',     '協議',     '歎息'],    1),
  item('mouse-letter-kitchen',  'mouse-letter', '東跑西竄', '小偷正在____，躲避警察的追捕。',                                                       ['東跑西竄', '娓娓道來', '恍然大悟', '毫不起眼'], 2),
  item('mouse-letter-wardrobe', 'mouse-letter', '翻弄',    '弟弟不停____着玩具箱，尋找他深愛的玩具。',                                             ['翻弄',    '指導',     '研讀',     '控制'],    2),
  item('mouse-letter-coach',    'mouse-letter', '指導',    '在老師耐心____下，同學們都創造出獨特的視藝作品。',                                     ['指導',    '翻弄',     '距離',     '丟臉'],    0),
  item('mouse-letter-friendly', 'mouse-letter', '鄰居',    '這位老太太是居住在我隔壁的____，她為人慷慨，經常送一些自己製作的包點給我們。',         ['鄰居',    '距離',     '缺乏',     '歡騰'],    3),
  item('mouse-letter-gift',     'mouse-letter', '迫不及待', '我在中文測考中取得一百分，____地回家告訴爸媽這個好消息。',                             ['迫不及待', '提心吊膽', '無言以對', '娓娓道來'], 1),
  item('mouse-letter-grade',    'mouse-letter', '歎息',    '看到新型冠狀病毒的染病人數不斷上升，大家都不禁搖頭____。',                             ['歎息',    '控制',     '爭執',     '傳遍'],    3),
  item('mouse-letter-park',     'mouse-letter', '寧靜',    '伯父愛在____的鄉村生活，並不喜歡都市的繁忙。',                                         ['寧靜',    '歡騰',     '遙遠',     '缺乏'],    0),

  item('cat-mouse-stadium',   'cat-mouse', '歡騰',    '我班運動健兒衝過終點時，全班同學都一起____。',                         ['歡騰',    '寧靜',     '傳遍',     '研讀'],    4),
  item('cat-mouse-grandma',   'cat-mouse', '娓娓道來', '小強把事情的始末____，大家才了解到事情的真相。',                       ['娓娓道來', '東跑西竄', '迫不及待', '毫不起眼'], 5),
  item('cat-mouse-glass',     'cat-mouse', '無言以對', '這次小明真的做錯了，面對大家的質問，他____。',                         ['無言以對', '叫嚷',     '控制',     '傳遍'],    5),
  item('cat-mouse-accused',   'cat-mouse', '激憤',    '小月一錯再錯，不願悔改的態度，令大家十分____。',                       ['激憤',    '歡騰',     '歎息',     '遙遠'],    6),
  item('cat-mouse-captain',   'cat-mouse', '爭執',    '弟弟和妹妹為了誰先玩新玩具而發生____，各不相讓，結果被媽媽教訓。',       ['爭執',    '寧靜',     '傳遍',     '研讀'],    4),
  item('cat-mouse-vase',      'cat-mouse', '毫不起眼', '這小餐館看來____，裝潢簡單，卻是世界聞名的食府。',                     ['毫不起眼', '恍然大悟', '無言以對', '提心吊膽'], 7),
  item('cat-mouse-peace',     'cat-mouse', '協議',    '小健違反了大家訂下來的____，破壞了彼此間的互信，大家十分失望。',         ['協議',    '指導',     '缺乏',     '翻弄'],    6),
  item('cat-mouse-climbing',  'cat-mouse', '提心吊膽', '聽過那可怕的妖怪故事後，弟弟整天____，擔心妖怪會來捉走他。',           ['提心吊膽', '娓娓道來', '毫不起眼', '距離'],    7),

  item('persian-diary-grandpa',   'persian-diary', '距離',    '現今社會科技先進，即使和親友分隔兩地，也可以用互聯網拉近彼此的____。',             ['距離',    '鄰居',     '叫嚷',     '無言以對'], 10),
  item('persian-diary-anger',     'persian-diary', '控制',    '小玄的體重已經超過標準，因此醫生建議他除了要多做運動外，還要____飲食。',           ['控制',    '叫嚷',     '協議',     '遙遠'],    9),
  item('persian-diary-school',    'persian-diary', '傳遍',    '利用互聯網發放信息，只消一瞬間，信息便能____到世界各地。',                         ['傳遍',    '鄰居',     '控制',     '研讀'],    8),
  item('persian-diary-mountain',  'persian-diary', '缺乏',    '新型冠狀病毒的疫情嚴重，由於大部分市民都____足夠的防疫物資，只好留在家中，足不出戶。', ['缺乏',    '翻弄',     '協議',     '歡騰'],    9),
  item('persian-diary-perform',   'persian-diary', '丟臉',    '不懂事的弟弟在公眾場所大聲喧嘩，令我感到很____，只想盡快離開現場。',               ['丟臉',    '寧靜',     '指導',     '傳遍'],    8),
  item('persian-diary-textbook',  'persian-diary', '研讀',    '小彬的志願是成為一位牧師，於是他用功地____《聖經》，希望能學習更多聖經真理。',     ['研讀',    '歎息',     '歡騰',     '爭執'],    10),
  item('persian-diary-brother',   'persian-diary', '恍然大悟', '經過老師的講解後，同學們才____，明白如何計算這道數學題。',                         ['恍然大悟', '東跑西竄', '毫不起眼', '激憤'],    11),
  item('persian-diary-space',     'persian-diary', '遙遠',    '只要利用天文望遠鏡細心觀察，便能清楚看見____的星體。',                             ['遙遠',    '迫不及待', '控制',     '歎息'],    11),
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
